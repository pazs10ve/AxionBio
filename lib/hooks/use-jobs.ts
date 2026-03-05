'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Job = {
    id: string;
    name: string;
    type: string;
    status: string;
    parameters: Record<string, unknown> | null;
    results: Record<string, unknown> | null;
    progressPct: number | null;
    currentStep: string | null;
    errorMessage: string | null;
    gpuHours: number | null;
    estimatedGpuHours: number | null;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    creator: { name: string | null; avatarUrl: string | null };
    project: { id: string; name: string } | null;
};

type SubmitJobInput = {
    name: string;
    type: string;
    projectId?: string | null;
    parameters?: Record<string, unknown>;
    estimatedGpuHours?: number;
};

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? `API error ${res.status}`);
    return json.data;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

type JobFilter = {
    projectId?: string;
    status?: string;
    type?: string;
    limit?: number;
};

export function useJobs(filter?: JobFilter) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.set('projectId', filter.projectId);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.type) params.set('type', filter.type);
    if (filter?.limit) params.set('limit', String(filter.limit));
    const qs = params.toString();

    return useQuery<Job[]>({
        queryKey: ['jobs', filter ?? {}],
        queryFn: () => apiFetch(`/api/jobs${qs ? `?${qs}` : ''}`),
        // Poll every 5 seconds so running/queued jobs update in near-real-time
        refetchInterval: 5000,
    });
}

export function useJob(jobId: string | null) {
    return useQuery<Job>({
        queryKey: ['job', jobId],
        queryFn: () => apiFetch(`/api/jobs/${jobId}`),
        enabled: !!jobId,
        refetchInterval: (query) => {
            const job = query.state.data;
            if (!job) return 5000;
            if (job.status === 'success' || job.status === 'failed' || job.status === 'cancelled') return false;
            return 3000;
        },
    });
}

export function useSubmitJob() {
    const qc = useQueryClient();
    return useMutation<{ jobId: string; status: string }, Error, SubmitJobInput>({
        mutationFn: (input) =>
            apiFetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
}

export function useCancelJob() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (jobId: string) =>
            apiFetch(`/api/jobs/${jobId}/cancel`, { method: 'POST' }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['jobs'] });
        },
    });
}
