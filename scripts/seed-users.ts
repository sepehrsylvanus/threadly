/**
 * Seed user_profiles for demo authors so profile pages work.
 *
 *   npx tsx scripts/seed-users.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const DEMO_USERS = [
  { id: "seed_auth_alice", username: "alice" },
  { id: "seed_auth_bob", username: "bob" },
  { id: "seed_auth_clara", username: "clara" },
  { id: "seed_auth_dev", username: "dev" },
  { id: "seed_auth_erin", username: "erin" },
  { id: "seed_auth_frank", username: "frank" },
];

async function main() {
  for (const u of DEMO_USERS) {
    await prisma.userProfile.upsert({
      where: { id: u.id },
      update: { username: u.username },
      create: { id: u.id, username: u.username },
    });
    console.log(`✓ Created/updated: ${u.username}`);
  }
  console.log("Done seeding users.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
