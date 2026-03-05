'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Dataset = {
    id: string;
    workspaceId: string;
    name: string;
    fileType: string;
    sizeBytes: number;
    r2Key: string;
    createdAt: string;
    uploader: {
        name: string | null;
        avatarUrl: string | null;
    };
};

// ── Fetcher ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? `API error ${res.status}`);
    return json.data;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useDatasets() {
    return useQuery<Dataset[]>({
        queryKey: ['datasets'],
        queryFn: () => apiFetch('/api/data'),
    });
}

/**
 * Hook to handle the 2-step upload process:
 * 1. Request a presigned URL from our API
 * 2. PUT the file directly to R2
 * 3. POST the metadata to our API to save the dataset row
 */
export function useUploadDataset() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            // 1. Get presigned URL
            const { uploadUrl, key } = await apiFetch<{ uploadUrl: string; key: string }>('/api/data/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type || 'application/octet-stream',
                }),
            });

            // 2. Upload directly to Cloudflare R2
            const r2Res = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type || 'application/octet-stream',
                },
            });

            if (!r2Res.ok) {
                throw new Error('Failed to upload file to storage bucket');
            }

            // 3. Register in database
            const dataset = await apiFetch<Dataset>('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: file.name,
                    fileType: file.type || 'application/octet-stream',
                    sizeBytes: file.size,
                    r2Key: key,
                }),
            });

            return dataset;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['datasets'] });
            qc.invalidateQueries({ queryKey: ['activity'] });
        },
    });
}
