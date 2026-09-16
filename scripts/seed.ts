/**
 * Creates the first studio user. Safe to re-run: an existing email is
 * updated with the given password rather than duplicated.
 */
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { hashPassword } from "../src/lib/crypto";

async function main() {
  const email = (process.env.SEED_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.SEED_PASSWORD ?? "";
  const name = process.env.SEED_NAME ?? "Zema Studios";

  if (!email || !password) {
    console.error(
      "Set SEED_EMAIL and SEED_PASSWORD, e.g.\n" +
        "  SEED_EMAIL=you@zemastudios.com SEED_PASSWORD=... npm run seed",
    );
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing[0]) {
    await db
      .update(users)
      .set({ passwordHash, name })
      .where(eq(users.id, existing[0].id));
    console.log(`Updated ${email}.`);
  } else {
    await db.insert(users).values({ email, name, passwordHash });
    console.log(`Created ${email}.`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
