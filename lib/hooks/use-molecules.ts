'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Molecule = {
    id: string;
    name: string;
    moleculeType: string;
    modality: string | null;
    sequence: string | null;
    pdbId: string | null;
    scores: Record<string, number | string> | null;
    status: string;
    starred: boolean;
    immunogenicity: string | null;
    tags: string[] | null;
    pdbFileKey: string | null;
    trajectoryKey: string | null;
    fastaKey: string | null;
    createdAt: string;
    project: { id: string; name: string } | null;
    sourceJob: { id: string; type: string } | null;
    creator: { name: string | null };
};

type MoleculeFilter = {
    projectId?: string;
    status?: string;
    starred?: boolean;
};

type UpdateMoleculeInput = {
    id: string;
    starred?: boolean;
    status?: string;
    tags?: string[];
};

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? `API error ${res.status}`);
    return json.data;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useMolecules(filter?: MoleculeFilter) {
    const params = new URLSearchParams();
    if (filter?.projectId) params.set('projectId', filter.projectId);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.starred) params.set('starred', 'true');
    const qs = params.toString();

    return useQuery<Molecule[]>({
        queryKey: ['molecules', filter ?? {}],
        queryFn: () => apiFetch(`/api/molecules${qs ? `?${qs}` : ''}`),
    });
}

export function useUpdateMolecule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...input }: UpdateMoleculeInput) =>
            apiFetch(`/api/molecules/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['molecules'] });
        },
    });
}

export function useDeleteMolecule() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) =>
            apiFetch(`/api/molecules/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['molecules'] });
        },
    });
}
