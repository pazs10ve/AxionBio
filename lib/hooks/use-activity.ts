'use client';

import { useQuery } from '@tanstack/react-query';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActivityEntry = {
    id: string;
    actionType: string;
    entityId: string | null;
    entityType: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    actor: { name: string | null; avatarUrl: string | null };
};

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string): Promise<T> {
    const res = await fetch(url);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? `API error ${res.status}`);
    return json.data;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useActivity() {
    return useQuery<ActivityEntry[]>({
        queryKey: ['activity'],
        queryFn: () => apiFetch('/api/activity'),
    });
}
