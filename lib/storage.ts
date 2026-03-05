import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Cloudflare R2 is S3-compatible — same SDK, different endpoint
export const r2 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT ?? 'https://placeholder.r2.cloudflarestorage.com',
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? 'placeholder',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? 'placeholder',
    },
});

const BUCKET = process.env.R2_BUCKET ?? 'axionbio-files';

/**
 * Get a pre-signed URL to download a file from R2 (valid for 1 hour by default).
 */
export const getSignedDownloadUrl = (key: string, expiresIn = 3600) =>
    getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });

/**
 * Get a pre-signed URL to upload a file directly from the browser to R2.
 */
export const getSignedUploadUrl = (key: string, contentType: string, expiresIn = 900) =>
    getSignedUrl(r2, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }), { expiresIn });

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
