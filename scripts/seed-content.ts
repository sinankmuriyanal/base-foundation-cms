/**
 * Seeds projects, BASE programs, hero slides, team and settings from lib/content/defaults.ts.
 * Existing documents and settings fields are left alone, so admin edits are never overwritten.
 *
 * Run from project root (needs scripts/serviceAccountKey.json):
 *   npx tsx scripts/seed-content.ts
 */
import fs from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_PAGES,
  DEFAULT_PROGRAMS,
  DEFAULT_PROJECTS,
  DEFAULT_SITE,
  DEFAULT_TEAM,
} from "../lib/content/defaults";

initializeApp({ credential: cert(JSON.parse(fs.readFileSync("scripts/serviceAccountKey.json", "utf8"))) });
const db = getFirestore();

async function seedCollection(name: string, items: object[], idFor: (item: object, i: number) => string) {
  let created = 0;
  for (const [order, item] of items.entries()) {
    const ref = db.collection(name).doc(idFor(item, order));
    if ((await ref.get()).exists) continue;
    await ref.set({ published: true, ...item, order, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    created++;
  }
  console.log(`${name}: ${created} written, ${items.length - created} already existed`);
}

async function seedSettings(docId: string, defaults: Record<string, string>) {
  const ref = db.collection("settings").doc(docId);
  const current = (await ref.get()).data() ?? {};
  const missing = Object.fromEntries(Object.entries(defaults).filter(([k]) => current[k] === undefined));
  if (Object.keys(missing).length) await ref.set({ ...missing, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  console.log(`settings/${docId}: ${Object.keys(missing).length} fields added`);
}

async function main() {
  await seedCollection("projects", DEFAULT_PROJECTS, (p) => (p as { slug: string }).slug);
  await seedCollection("programs", DEFAULT_PROGRAMS, (_, i) => `program-${i + 1}`);
  await seedCollection("heroSlides", DEFAULT_HERO_SLIDES, (_, i) => `slide-${i + 1}`);
  await seedCollection("teamMembers", DEFAULT_TEAM, (_, i) => `member-${i + 1}`);
  await seedSettings("site", { ...DEFAULT_SITE });
  await seedSettings("pages", { ...DEFAULT_PAGES });
}

main().then(() => process.exit(0));
