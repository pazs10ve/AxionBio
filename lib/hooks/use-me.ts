'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserProfile = {
    id: string;
    auth0Id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: string | null;
    bio: string | null;
    timezone: string | null;
    workspaces: {
        id: string;
        name: string;
        slug: string;
        plan: string;
        role: string;
    }[];
};

type UpdateMeInput = {
    name?: string;
    bio?: string;
    role?: string;
    timezone?: string;
    avatarUrl?: string;
};

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? `API error ${res.status}`);
    return json.data;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useMe() {
    return useQuery<UserProfile>({
        queryKey: ['me'],
        queryFn: () => apiFetch('/api/me'),
        // User profile rarely changes — very long stale time
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateMe() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateMeInput) =>
            apiFetch('/api/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['me'] });
        },
    });
}
