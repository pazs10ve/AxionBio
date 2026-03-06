import { useQuery } from '@tanstack/react-query';

export type WorkspaceMember = {
    id: string;
    role: string;
    joinedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string | null;
    };
};

async function fetchMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const res = await fetch(`/api/workspace/members?workspaceId=${workspaceId}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch members');
    return json.data;
}

export function useMembers(workspaceId?: string) {
    return useQuery({
        queryKey: ['workspace', 'members', workspaceId],
        queryFn: () => fetchMembers(workspaceId!),
        enabled: !!workspaceId,
    });
}
