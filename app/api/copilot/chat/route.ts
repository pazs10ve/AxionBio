import { NextResponse } from 'next/server';
import { getSessionUser, requireWorkspaceMember } from '@/lib/api-utils';
import { db } from '@/src/db';
import { copilotSessions, copilotMessages } from '@/src/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

const openrouter = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
        'HTTP-Referer': 'https://axionbio.ai', // Optional but recommended for OpenRouter
        'X-Title': 'AxionBio',
    },
});

const MODEL = process.env.COPILOT_MODEL ?? 'anthropic/claude-3.5-sonnet';

// ── GET SESSIONS ──────────────────────────────────────────────────────────────
export async function GET(req: Request) {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspaceId;
        if (!workspaceId) throw new Error('No workspace context found');

        await requireWorkspaceMember(user.id, workspaceId);

        // Return recent sessions
        const sessions = await db.query.copilotSessions.findMany({
            where: and(
                eq(copilotSessions.workspaceId, workspaceId),
                eq(copilotSessions.userId, user.id)
            ),
            orderBy: [desc(copilotSessions.updatedAt)],
            limit: 20,
        });

        return NextResponse.json({ data: sessions });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Error fetching sessions' }, { status: err.status || 500 });
    }
}

// ── POST NEW CHAT MESSAGE (STREAMING) ─────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const { user } = await getSessionUser();
        const workspaceId = user.memberships[0]?.workspaceId;
        if (!workspaceId) throw new Error('No workspace context found');

        await requireWorkspaceMember(user.id, workspaceId);

        const { sessionId, messages, contextJobIds = [], contextMoleculeIds = [] } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array required' }, { status: 400 });
        }

        // Validate or create session
        let activeSessionId = sessionId;
        if (!activeSessionId) {
            const previewText = messages[0]?.content?.slice(0, 50) || 'New Session';

            const [newSession] = await db.insert(copilotSessions).values({
                workspaceId,
                userId: user.id,
                title: previewText,
                preview: previewText,
                contextJobIds,
                contextMoleculeIds,
            }).returning();

            activeSessionId = newSession.id;
        }

        // Save the user's latest incoming message to the DB
        const latestUserMsg = messages[messages.length - 1];
        if (latestUserMsg?.role === 'user') {
            await db.insert(copilotMessages).values({
                sessionId: activeSessionId,
                role: 'user',
                content: latestUserMsg.content,
            });
        }

        // Define system prompt
        const systemPrompt = `
You are AxionBio Copilot, an expert computational biologist and AI assistant.
You help users design molecules, run simulations, and analyze structural data.

You have access to the following tools:
1. run_alphafold3: Predicts 3D structures from sequences.
2. run_rfdiffusion: Generates novel protein binders against a given target.
3. run_md: Runs Molecular Dynamics simulations (GROMACS/OpenMM).
4. fetch_structure: Pulls structural data from public DBs like RCSB PDB.

When the user asks to perform an action, prefer using a tool-call to accomplish it.
Keep your conversational responses concise.
`;

        // We use Vercel AI SDK to handle tool calling and streaming natively
        const result = streamText({
            model: openrouter(MODEL),
            system: systemPrompt,
            messages: messages as any,
            tools: {
                run_alphafold3: tool({
                    description: 'Run an AlphaFold3 job to predict protein structure',
                    parameters: z.object({
                        sequence: z.string().describe('The amino acid sequence to fold'),
                        jobName: z.string().optional()
                    }),
                    // @ts-ignore
                    execute: async ({ sequence, jobName }) => {
                        // In a real app we would call db.insert(jobs)...
                        return { success: true, fakeJobId: 'job_af3_uuid', status: 'queued' };
                    },
                }),
                run_rfdiffusion: tool({
                    description: 'Run RFdiffusion to generate binders against a target structure',
                    parameters: z.object({
                        targetPdb: z.string().describe('Target PDB ID or filepath if known'),
                        numDesigns: z.number().default(100),
                        hotspots: z.array(z.string()).optional()
                    }),
                    // @ts-ignore
                    execute: async ({ targetPdb, numDesigns }) => {
                        return { success: true, fakeJobId: 'job_rfd_uuid', numDesigns };
                    },
                }),
                run_md: tool({
                    description: 'Run a Molecular Dynamics simulation',
                    parameters: z.object({
                        moleculeId: z.string().describe('The DB ID of the molecule to simulate'),
                        durationNs: z.number().describe('Duration in nanoseconds (e.g. 50)')
                    }),
                    // @ts-ignore
                    execute: async ({ durationNs }) => {
                        return { success: true, fakeJobId: 'job_md_uuid', durationNs };
                    },
                }),
                fetch_structure: tool({
                    description: 'Fetch a structure from RCSB PDB',
                    parameters: z.object({
                        pdbId: z.string().describe('4-letter PDB ID')
                    }),
                    // @ts-ignore
                    execute: async ({ pdbId }) => {
                        return { success: true, pdbId, resolution: '1.8A' };
                    },
                }),
            },
            onFinish: async ({ text, toolCalls, toolResults }) => {
                // Save the assistant's response to the DB once the stream completes
                const formattedToolCalls = toolCalls?.map((tc, idx) => ({
                    id: tc.toolCallId,
                    tool: tc.toolName,
                    label: `Running ${tc.toolName}...`,
                    status: 'done', // Since execution completed inline during the stream for this demo
                    input: (tc as any).args || (tc as any).arguments,
                    output: (toolResults?.[idx] as any)?.result || (toolResults?.[idx] as any)?.args,
                    duration: '2s'
                })) || [];

                await db.insert(copilotMessages).values({
                    sessionId: activeSessionId,
                    role: 'agent',
                    content: text,
                    toolCalls: formattedToolCalls.length > 0 ? formattedToolCalls : undefined,
                });
            }
        });

        // The frontend useChat hook expects this specific response format
        return (result as any).toTextStreamResponse({ headers: { 'x-copilot-session-id': activeSessionId } });
    } catch (err: any) {
        console.error('[Copilot Chat API Error]', err);
        return NextResponse.json({ error: err.message || 'Stream failed' }, { status: 500 });
    }
}
