'use client';

import { useState, useRef, useEffect } from 'react';
import { MOCK_SESSIONS, MOCK_CONTEXT_FILES, MOCK_TOOL_CALLS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
    Bot, Plus, Send, Paperclip, X, ChevronRight, ChevronDown,
    CheckCircle2, XCircle, Loader2, Clock, Dna, Database, Cpu,
    FlaskConical, FileText, Layers, PanelLeftClose, PanelRightClose,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

// ── Types ─────────────────────────────────────────────────────────────────────

type ToolStatus = 'pending' | 'running' | 'done' | 'error';
type MessageRole = 'user' | 'agent';

type ToolCall = {
    id: string;
    tool: string;
    label: string;
    status: ToolStatus;
    duration: string | null;
    input: Record<string, unknown> | null;
    output: Record<string, unknown> | null;
};

type Message = {
    id: string;
    role: MessageRole;
    content: string;
    toolCalls?: ToolCall[];
    timestamp: Date;
};

// ── Demo scripted response ────────────────────────────────────────────────────

const DEMO_PROMPT = 'Run AlphaFold on PDB 7OOO, design 500 binders with RFdiffusion, run 50ns MD on the top 20, then order top 3 to Twist.';

function buildDemoMessages(): Message[] {
    return [
        {
            id: 'm-1',
            role: 'user',
            content: DEMO_PROMPT,
            timestamp: new Date(Date.now() - 4 * 60 * 1000),
        },
        {
            id: 'm-2',
            role: 'agent',
            content: "I've broken this into 4 sequential steps. Here's my plan — you can **Approve & Continue** or cancel any step before it runs.",
            toolCalls: MOCK_TOOL_CALLS as ToolCall[],
            timestamp: new Date(Date.now() - 3 * 60 * 1000 + 800),
        },
    ];
}

// ── Status badge / icon helpers ───────────────────────────────────────────────

function ToolStatusBadge({ status }: { status: ToolStatus }) {
    const styles: Record<ToolStatus, string> = {
        pending: 'text-slate-500 bg-slate-100 border-slate-200',
        running: 'text-brand bg-brand/10 border-brand/20',
        done: 'text-success bg-success/10 border-success/20',
        error: 'text-error bg-error/10 border-error/20',
    };
    const labels: Record<ToolStatus, string> = {
        pending: 'Pending', running: 'Running', done: 'Done', error: 'Error',
    };
    return (
        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', styles[status])}>
            {status === 'running' && <Loader2 className="w-2.5 h-2.5 inline mr-1 animate-spin" />}
            {status === 'done' && <CheckCircle2 className="w-2.5 h-2.5 inline mr-1" />}
            {status === 'error' && <XCircle className="w-2.5 h-2.5 inline mr-1" />}
            {status === 'pending' && <Clock className="w-2.5 h-2.5 inline mr-1" />}
            {labels[status]}
        </span>
    );
}

const TOOL_ICONS: Record<string, React.FC<{ className?: string }>> = {
    fetch_structure: Database,
    run_alphafold3: Sparkles,
    run_rfdiffusion: Dna,
    run_md: FlaskConical,
};

// ── Tool Call Card ────────────────────────────────────────────────────────────

function ToolCallCard({ call }: { call: ToolCall }) {
    const [expanded, setExpanded] = useState(call.status === 'running');
    const Icon = TOOL_ICONS[call.tool] ?? Cpu;

    return (
        <div className={cn(
            'rounded-xl border transition-all duration-200',
            call.status === 'running' ? 'border-brand/30 bg-brand/5' :
                call.status === 'done' ? 'border-success/20 bg-success/5' :
                    call.status === 'error' ? 'border-error/20 bg-error/5' :
                        'border-slate-200 bg-white'
        )}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left"
            >
                <div className={cn(
                    'p-1.5 rounded-lg shrink-0',
                    call.status === 'running' ? 'bg-brand/10' :
                        call.status === 'done' ? 'bg-success/10' : 'bg-slate-100'
                )}>
                    <Icon className={cn(
                        'w-4 h-4',
                        call.status === 'running' ? 'text-brand' :
                            call.status === 'done' ? 'text-success' : 'text-slate-400'
                    )} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">{call.label}</span>
                        <ToolStatusBadge status={call.status} />
                        {call.duration && (
                            <span className="text-[10px] text-slate-400">{call.duration}</span>
                        )}
                    </div>
                </div>
                {expanded ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>

            {expanded && (
                <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
                    {call.input && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Input</p>
                            <pre className="bg-slate-900 text-green-400 text-[11px] font-mono rounded-lg p-3 overflow-x-auto">
                                {JSON.stringify(call.input, null, 2)}
                            </pre>
                        </div>
                    )}
                    {call.output && (
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Output</p>
                            <pre className="bg-slate-900 text-green-400 text-[11px] font-mono rounded-lg p-3 overflow-x-auto">
                                {JSON.stringify(call.output, null, 2)}
                            </pre>
                        </div>
                    )}
                    {call.status === 'running' && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
                            Running inference on GPU cluster...
                        </div>
                    )}
                    {call.status === 'pending' && (
                        <div className="flex gap-2">
                            <Button size="sm" className="h-8 text-xs bg-brand hover:bg-brand-hover text-white gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Continue
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200 text-slate-600 hover:text-error hover:border-error/20">
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel Plan
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === 'user';

    return (
        <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {/* Avatar */}
            <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                isUser ? 'bg-brand text-white' : 'bg-slate-100 border border-slate-200'
            )}>
                {isUser ? 'You' : <Bot className="w-4 h-4 text-brand" />}
            </div>

            <div className={cn('flex flex-col gap-2 max-w-[78%]', isUser ? 'items-end' : 'items-start')}>
                {/* Text bubble */}
                <div className={cn(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    isUser
                        ? 'bg-brand text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                )}>
                    {msg.content}
                </div>

                {/* Tool call cards (agent only) */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="w-full space-y-2">
                        {msg.toolCalls.map((tc) => (
                            <ToolCallCard key={tc.id} call={tc} />
                        ))}
                    </div>
                )}

                <span className="text-[10px] text-slate-400">
                    {formatDistanceToNow(msg.timestamp, { addSuffix: true })}
                </span>
            </div>
        </div>
    );
}

// ── Sessions Sidebar ──────────────────────────────────────────────────────────

function SessionsSidebar({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    return (
        <div className={cn(
            'flex flex-col bg-white border-r border-slate-200 transition-all duration-300 shrink-0 overflow-hidden',
            visible ? 'w-[220px]' : 'w-0'
        )}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                <span className="text-sm font-semibold text-slate-700">Sessions</span>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <PanelLeftClose className="w-4 h-4" />
                </button>
            </div>
            <div className="p-2">
                <button className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-brand/5 hover:bg-brand/10 text-brand text-sm font-semibold transition-colors border border-brand/20 mb-2">
                    <Plus className="w-4 h-4" /> New Session
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {MOCK_SESSIONS.map((s, i) => (
                    <button key={s.id}
                        className={cn(
                            'w-full text-left px-3 py-3 rounded-xl text-xs transition-colors',
                            i === 0 ? 'bg-brand/10 border border-brand/20 text-brand' : 'hover:bg-slate-50 text-slate-600'
                        )}>
                        <p className={cn('font-semibold truncate', i === 0 ? 'text-brand' : 'text-slate-800')}>{s.title}</p>
                        <p className="text-slate-400 truncate mt-0.5">{s.preview}</p>
                        <p className="text-slate-300 mt-1">{s.ago}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ── Context Panel ─────────────────────────────────────────────────────────────

function ContextPanel({ visible, onClose }: { visible: boolean; onClose: () => void }) {
    return (
        <div className={cn(
            'flex flex-col bg-white border-l border-slate-200 transition-all duration-300 shrink-0 overflow-hidden',
            visible ? 'w-[220px]' : 'w-0'
        )}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
                <span className="text-sm font-semibold text-slate-700">Context</span>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <PanelRightClose className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Files */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Files in context</p>
                    <div className="space-y-1.5">
                        {MOCK_CONTEXT_FILES.map((f) => (
                            <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 group">
                                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-700 truncate">{f.name}</p>
                                    <p className="text-[10px] text-slate-400">{f.size}</p>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-error transition-all">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Molecules */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Molecules</p>
                    <div className="space-y-1.5">
                        {['ABL1-Binder-Rank1', 'CompactCas-Variant-7'].map((name) => (
                            <div key={name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 group">
                                <Dna className="w-3.5 h-3.5 text-brand shrink-0" />
                                <p className="text-xs font-medium text-slate-700 flex-1 truncate">{name}</p>
                                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-error transition-all">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active jobs */}
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Jobs</p>
                    <div className="space-y-1.5">
                        {[{ name: 'KRAS_G12C_Binder_v3', status: 'running' }].map((j) => (
                            <div key={j.name} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-700 truncate">{j.name}</p>
                                    <p className="text-[10px] text-brand flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block animate-pulse" />
                                        Running
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Chat Input ────────────────────────────────────────────────────────────────

const DEMO_PROMPTS = [
    'Design 100 binders for 6OIM chain A with RFdiffusion',
    'Run 50ns GROMACS MD on ABL1-Binder-Rank1',
    'What is the predicted immunogenicity of my top candidates?',
    'Order the top 3 sequences to Twist Bioscience',
];

function ChatInput({ onSend, disabled }: { onSend: (msg: string) => void; disabled?: boolean }) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!value.trim()) return;
        onSend(value.trim());
        setValue('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const autoResize = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
    };

    return (
        <div className="p-4 border-t border-slate-200 bg-white">
            {/* Demo prompt pills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {DEMO_PROMPTS.map((p) => (
                    <button key={p} onClick={() => setValue(p)}
                        className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 hover:border-brand/30 hover:bg-brand/5 hover:text-brand text-slate-500 transition-colors font-medium truncate max-w-[200px]">
                        {p}
                    </button>
                ))}
            </div>

            {/* Textarea */}
            <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={value}
                        onChange={(e) => { setValue(e.target.value); autoResize(); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder="Describe what you want to do..."
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all min-h-[44px]"
                        style={{ maxHeight: '144px' }}
                    />
                    <button className="absolute right-3 bottom-3 text-slate-400 hover:text-slate-600 transition-colors">
                        <Paperclip className="w-4 h-4" />
                    </button>
                </div>
                <Button
                    onClick={handleSend}
                    disabled={!value.trim() || disabled}
                    className="h-11 w-11 p-0 bg-brand hover:bg-brand-hover text-white rounded-xl shrink-0 disabled:opacity-30"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
                Shift+Enter for new line · The agent will ask for confirmation before running jobs
            </p>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CopilotPage() {
    const [messages, setMessages] = useState<Message[]>(buildDemoMessages());
    const [sessionsPanelOpen, setSessionsPanelOpen] = useState(true);
    const [contextPanelOpen, setContextPanelOpen] = useState(true);
    const [isAgentTyping, setIsAgentTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (text: string) => {
        const userMsg: Message = {
            id: `m-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsAgentTyping(true);

        // Simulate agent "thinking" then responding
        setTimeout(() => {
            const agentMsg: Message = {
                id: `m-${Date.now() + 1}`,
                role: 'agent',
                content: "I'll start working on that. Let me begin by fetching the relevant structure and setting up the job pipeline.",
                toolCalls: [
                    {
                        id: `tc-${Date.now()}`,
                        tool: 'fetch_structure',
                        label: 'Fetching target structure from RCSB...',
                        status: 'running',
                        duration: null,
                        input: { query: text.slice(0, 60) },
                        output: null,
                    },
                ],
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, agentMsg]);
            setIsAgentTyping(false);

            // Transition tool call to done after a moment
            setTimeout(() => {
                setMessages(prev => prev.map(m =>
                    m.id === agentMsg.id
                        ? {
                            ...m,
                            toolCalls: m.toolCalls?.map(tc => ({
                                ...tc,
                                status: 'done' as ToolStatus,
                                duration: '1.4s',
                                output: { chains: 2, residues: 189 },
                            })),
                        }
                        : m
                ));
            }, 2200);
        }, 1400);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">

            {/* Sessions sidebar */}
            <SessionsSidebar visible={sessionsPanelOpen} onClose={() => setSessionsPanelOpen(false)} />

            {/* Center — Chat canvas */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Chat topbar */}
                <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        {!sessionsPanelOpen && (
                            <button onClick={() => setSessionsPanelOpen(true)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                                <PanelLeftClose className="w-4 h-4 rotate-180" />
                            </button>
                        )}
                        <div className="p-1.5 bg-brand/10 rounded-lg">
                            <Bot className="w-4 h-4 text-brand" />
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold text-slate-900">Agentic Copilot</h1>
                            <p className="text-xs text-slate-400">KRAS G12C binder design session</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-brand font-medium bg-brand/5 px-3 py-1.5 rounded-full border border-brand/20">
                            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                            1 job running
                        </div>
                        {!contextPanelOpen && (
                            <button onClick={() => setContextPanelOpen(true)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                                <PanelRightClose className="w-4 h-4 rotate-180" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} />
                    ))}

                    {/* Typing indicator */}
                    {isAgentTyping && (
                        <div className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-brand" />
                            </div>
                            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                                {[0, 150, 300].map((delay) => (
                                    <span key={delay} className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                                        style={{ animationDelay: `${delay}ms` }} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <ChatInput onSend={handleSend} disabled={isAgentTyping} />
            </div>

            {/* Context panel */}
            <ContextPanel visible={contextPanelOpen} onClose={() => setContextPanelOpen(false)} />
        </div>
    );
}
