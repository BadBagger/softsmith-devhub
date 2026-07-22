import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, "leadsmith.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    place_id TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    category TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    has_website INTEGER NOT NULL DEFAULT 0,
    lat REAL,
    lng REAL,
    rating REAL,
    rating_count INTEGER,
    score INTEGER NOT NULL DEFAULT 0,
    score_reasons TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    search_location TEXT,
    search_category TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
    template TEXT NOT NULL DEFAULT 'modern',
    business_name TEXT NOT NULL,
    tagline TEXT NOT NULL DEFAULT '',
    about TEXT NOT NULL DEFAULT '',
    services TEXT NOT NULL DEFAULT '[]',
    phone TEXT,
    email TEXT,
    address TEXT,
    accent_color TEXT NOT NULL DEFAULT '#0f766e',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

export type { Lead, LeadStatus } from "./lead-types";
export { LEAD_STATUSES } from "./lead-types";
export type { Site, SiteService, SiteTemplateId } from "./site-types";
export { SITE_TEMPLATES } from "./site-types";

export default db;
