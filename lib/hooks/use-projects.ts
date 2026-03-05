'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Project = {
    id: string;
    name: string;
    description: string | null;
    status: string;
    target: string | null;
    indication: string | null;
    modality: string | null;
    phase: string | null;
    program: string | null;
    color: string;
    tags: string[] | null;
    createdAt: string;
    updatedAt: string;
    creator: { name: string | null; avatarUrl: string | null };
    jobCount: number;
    moleculeCount: number;
    runningJobs: number;
};

type CreateProjectInput = {
    name: string;
    description?: string;
    target?: string;
    indication?: string;
    modality?: string;
    phase?: string;
    program?: string;
    color?: string;
    tags?: string[];
};

type UpdateProjectInput = Partial<CreateProjectInput> & { status?: string };

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? `API error ${res.status}`);
    return json.data;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useProjects() {
    return useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: () => apiFetch('/api/projects'),
    });
}

export function useCreateProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateProjectInput) =>
            apiFetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

export function useUpdateProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...input }: UpdateProjectInput & { id: string }) =>
            apiFetch(`/api/projects/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

export function useDeleteProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            apiFetch(`/api/projects/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}
