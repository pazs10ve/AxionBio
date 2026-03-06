import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type ApiKey = {
    id: string;
    name: string;
    prefix: string;
    scopes: string[];
    lastUsedAt: string | null;
    createdAt: string;
    cleartextKey?: string;
};

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'API error');
    return json.data;
}

export function useApiKeys(workspaceId?: string) {
    return useQuery<ApiKey[]>({
        queryKey: ['workspace', 'keys', workspaceId],
        queryFn: () => apiFetch(`/api/workspace/keys?workspaceId=${workspaceId}`),
        enabled: !!workspaceId,
    });
}

export function useCreateApiKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { workspaceId: string; name: string }) =>
            apiFetch<ApiKey>('/api/workspace/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vars),
            }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['workspace', 'keys', vars.workspaceId] });
        },
    });
}

export function useRevokeApiKey() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { workspaceId: string; id: string }) =>
            apiFetch(`/api/workspace/keys?id=${vars.id}`, { method: 'DELETE' }),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['workspace', 'keys', vars.workspaceId] });
        },
    });
}
