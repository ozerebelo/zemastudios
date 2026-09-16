import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "node:stream";

/**
 * Deliberately S3-flavoured rather than vendor-specific: the same config
 * drives Cloudflare R2, AWS S3, Backblaze B2 and a local MinIO container.
 * R2 is the cheap default because it does not bill egress.
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

const globalForS3 = globalThis as unknown as { __zemaS3?: S3Client };

function client(): S3Client {
  if (globalForS3.__zemaS3) return globalForS3.__zemaS3;

  const s3 = new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    // MinIO and some S3-compatible stores need path-style addressing.
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
    },
  });

  globalForS3.__zemaS3 = s3;
  return s3;
}

function bucket(): string {
  return requireEnv("S3_BUCKET");
}

/** Upload URLs are short-lived; the browser PUTs straight to storage. */
export async function presignUpload(
  key: string,
  contentType: string,
): Promise<string> {
  return getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 60 * 60 },
  );
}

/**
 * Download URLs carry the original filename so the client does not receive a
 * file named after its storage key.
 */
export async function presignDownload(
  key: string,
  filename: string,
): Promise<string> {
  return getSignedUrl(
    client(),
    new GetObjectCommand({
      Bucket: bucket(),
      Key: key,
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    }),
    { expiresIn: 5 * 60 },
  );
}

/** Used by the zip-all route, which streams rather than buffers. */
export async function getObjectStream(key: string): Promise<Readable> {
  const result = await client().send(
    new GetObjectCommand({ Bucket: bucket(), Key: key }),
  );
  if (!result.Body) throw new Error(`Empty body for ${key}`);
  return result.Body as Readable;
}

export async function deleteObject(key: string): Promise<void> {
  await client().send(
    new DeleteObjectCommand({ Bucket: bucket(), Key: key }),
  );
}

export function storageKeyFor(deliveryId: string, fileId: string, filename: string): string {
  return `deliveries/${deliveryId}/${fileId}/${filename}`;
}
