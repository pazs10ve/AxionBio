'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Notification = {
    id: string;
    type: string;
    title: string;
    body: string | null;
    entityId: string | null;
    read: boolean;
    createdAt: string;
};

type NotificationsResult = {
    items: Notification[];
    unreadCount: number;
};

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? `API error ${res.status}`);
    return json.data;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useNotifications() {
    return useQuery<NotificationsResult>({
        queryKey: ['notifications'],
        queryFn: () => apiFetch('/api/notifications'),
        // Poll every 30 seconds for new notifications
        refetchInterval: 30_000,
    });
}

export function useMarkRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (ids?: string[]) =>
            apiFetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
