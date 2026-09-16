# Zema Delivery

A delivery platform for DaVinci Resolve project files. You export the `.drp`
yourself; this handles getting it to the client and telling you what happened
to it.

It is deliberately not a video platform. There is no transcoding, no player,
no review tooling — files go in, a link goes out, and every view and download
is recorded.

## What it does

- **Deliveries** grouped by client, each with its own share link
- **Direct-to-storage uploads** — the browser PUTs straight to S3/R2, so file
  bytes never pass through the app server
- **Resolve-aware file labels** derived from the extension (`.drp`, `.drt`,
  `.drx`, `.drfx`, `.cube`, archives)
- **Link controls** — expiry, download cap, optional password, revoke at any time
- **Audit trail** — who opened the link, what they downloaded, when, from where
- **Download all** as a zip, streamed rather than buffered
- **SHA-256 checksums** computed in the browser before upload and shown to the
  recipient (skipped above 200 MB, where hashing in-browser costs more than it
  is worth)
- **Optional handoff notes** — the Resolve version the project was saved in and
  whether Studio is required. Both optional; leave them blank and they do not
  render. They exist because a project saved in a newer Resolve will not open in
  an older one, and that is the most common way a handoff fails.

The recipient never makes an account. They get a link.

## Stack

Next.js (App Router) · Postgres via Drizzle · any S3-compatible storage · Tailwind.

Storage is addressed through the S3 API rather than a vendor SDK, so the same
config drives Cloudflare R2, AWS S3, Backblaze B2 or a local MinIO. **R2 is the
recommended default** — it does not bill egress, which is the dominant running
cost of anything delivery-shaped.

## Local setup

```bash
cp .env.example .env.local        # then set SESSION_SECRET
docker compose up -d              # Postgres + MinIO
npm install
npm run db:push
npm run storage:init              # creates the bucket
npm run storage:cors              # REQUIRED -- see below
SEED_EMAIL=you@zemastudios.com SEED_PASSWORD=... npm run seed
npm run dev
```

Generate a secret with `openssl rand -base64 32`.

### Bucket CORS is not optional

Uploads go from the browser directly to the bucket, so the *bucket* has to
allow the app's origin. Without it, every upload fails at the CORS preflight
with a generic network error and nothing reaches storage.

`npm run storage:cors` applies the right policy for whatever `APP_URL` is set
to. Re-run it whenever `APP_URL` changes — including the first deploy to a
real domain.

## Deploying

1. Postgres — Neon, Supabase, or RDS. Set `DATABASE_URL` and run `npm run db:push`.
2. A bucket on R2 or S3. Set the `S3_*` vars, then `npm run storage:cors`.
3. Set `APP_URL` to the real domain. Share links are built from it.
4. Set `SESSION_SECRET` to a fresh random value. Rotating it signs everyone out
   **and invalidates every existing share link**, since tokens are sealed with
   it — reissue links after a rotation.
5. Optionally set `RESEND_API_KEY` and `EMAIL_FROM`. Without them the app still
   works: outgoing mail is logged to the console and you copy the link from the
   dashboard instead.
6. `npm run seed` once, to create the first user.

## How the security model works

- **Share tokens** are 192 bits of randomness. Only a SHA-256 of the token is
  indexed; the token itself is stored sealed with AES-256-GCM under
  `SESSION_SECRET` so the dashboard can display it again. A database leak alone
  does not yield working links.
- **Passwords** (both user and share-link) are hashed with scrypt.
- **Gate checks run on the download endpoints too**, not just the page, so a
  bare API URL cannot be used to step around an expired, revoked, capped or
  locked link.
- Share links carry `noindex`.
- The audit trail stores recipient IP addresses. If you operate under GDPR,
  decide on a retention window for `access_events` — nothing prunes it today.

## Known limits

- **5 GB per file.** Uploads use a single presigned PUT, which is the S3
  ceiling. Multipart upload is the fix and is not implemented. This is fine for
  project files, LUTs and effect bundles; it is the constraint you will hit
  first if you start shipping full `.dra` archives.
- **`.dra` is a folder**, not a file. Zip it before uploading. Directory upload
  is not implemented.
- **No resumable uploads.** A dropped connection means starting that file again.
- **Nothing reads inside the `.drp`.** Media manifests, relink reports and
  plugin dependency detection would need a headless Resolve worker driven
  through its scripting API. Out of scope here by design.
- **No per-recipient identity.** Anyone holding the link is treated as the
  recipient. Add email verification if you need per-person attribution rather
  than per-link.
- `npm run db:push` is used instead of versioned migrations. Switch to
  `db:generate` and committed migrations once the schema is stable.

## Tests

There is no automated test suite in the repo. The implementation was verified
end to end against a real browser, Postgres and an S3-compatible endpoint:
sign-in, client and delivery creation, direct-to-storage upload, byte-exact
download, zip integrity, the audit trail, expiry, download caps, revocation,
and the password gate including a direct-endpoint bypass attempt. Wiring that
into CI as Playwright specs is the obvious next step.
