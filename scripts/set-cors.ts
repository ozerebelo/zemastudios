/**
 * Applies the bucket CORS policy that browser uploads depend on.
 *
 * The browser PUTs straight to storage, so the bucket -- not the app -- has to
 * allow the app's origin. Without this every upload fails at the preflight
 * with an opaque network error.
 *
 * Run once per bucket, and again whenever APP_URL changes.
 */
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

async function main() {
  const bucket = process.env.S3_BUCKET;
  const appUrl = process.env.APP_URL;
  if (!bucket) throw new Error("S3_BUCKET is not set");
  if (!appUrl) throw new Error("APP_URL is not set");

  const origin = new URL(appUrl).origin;

  const s3 = new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });

  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: [origin],
            AllowedMethods: ["PUT", "GET", "HEAD"],
            AllowedHeaders: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );

  console.log(`CORS applied to "${bucket}" for origin ${origin}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
