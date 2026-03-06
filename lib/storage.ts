import { Storage } from '@google-cloud/storage';

// Initialize GCS client using environment variables directly
export const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const BUCKET_NAME = process.env.GCS_BUCKET ?? 'axionbio-files';
const bucket = storage.bucket(BUCKET_NAME);

/**
 * Get a pre-signed URL to download a file from GCS (valid for 1 hour by default).
 */
export const getSignedDownloadUrl = async (key: string, expiresIn = 3600) => {
    const [url] = await bucket.file(key).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
    });
    return url;
};

/**
 * Get a pre-signed URL to upload a file directly from the browser to GCS.
 */
export const getSignedUploadUrl = async (key: string, contentType: string, expiresIn = 900) => {
    const [url] = await bucket.file(key).getSignedUrl({
        version: 'v4',
        action: 'write',
        contentType,
        expires: Date.now() + expiresIn * 1000,
    });
    return url;
};

/**
 * Standard key builders — keeps the bucket organized.
 */
export const storageKeys = {
    jobOutput: (jobId: string, filename: string) => `jobs/${jobId}/${filename}`,
    moleculePdb: (moleculeId: string) => `molecules/${moleculeId}/structure.pdb`,
    moleculeFasta: (moleculeId: string) => `molecules/${moleculeId}/export.fasta`,
    trajectory: (moleculeId: string) => `molecules/${moleculeId}/trajectory.xtc`,
    dataset: (workspaceId: string, datasetId: string, filename: string) =>
        `datasets/${workspaceId}/${datasetId}/${filename}`,
    avatar: (userId: string, ext: string) => `avatars/${userId}/avatar.${ext}`,
};
