import { useQuery } from '@tanstack/react-query';

export type WorkspaceUsage = {
    moleculeCount: number;
    gpuHoursUsed: number;
    gpuHoursLimit: number;
    storageUsedGb: string;
    storageLimitGb: number;
    synthesisCount: number;
    synthesisLimit: number;
};

async function fetchUsage(workspaceId: string): Promise<WorkspaceUsage> {
    const res = await fetch(`/api/workspace/usage?workspaceId=${workspaceId}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch usage');
    return json.data;
}

export function useUsage(workspaceId?: string) {
    return useQuery({
        queryKey: ['workspace', 'usage', workspaceId],
        queryFn: () => fetchUsage(workspaceId!),
        enabled: !!workspaceId,
    });
}
