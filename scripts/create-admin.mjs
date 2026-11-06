import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  try {
    const raw = await readFile(file, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (!match) continue;
      const key = match[1];
      let value = match[2];
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // .env.local is optional; environment variables can be provided directly.
  }
}

await loadEnv();

const email = (process.env.ADMIN_EMAIL || "admin@kamoratech.local").toLowerCase();
const password = process.env.ADMIN_PASSWORD || randomBytes(9).toString("base64url");
const name = process.env.ADMIN_NAME || "Site Admin";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME || "agency_db",
});

try {
  const hash = await bcrypt.hash(password, 12);
  const [existing] = await connection.execute("SELECT id FROM admins WHERE email = ? LIMIT 1", [email]);
  if (Array.isArray(existing) && existing.length > 0) {
    await connection.execute(
      "UPDATE admins SET full_name = ?, password_hash = ?, is_active = 1 WHERE email = ?",
      [name, hash, email],
    );
    console.log(`Updated admin: ${email}`);
  } else {
    await connection.execute(
      "INSERT INTO admins (full_name, email, password_hash, is_active) VALUES (?, ?, ?, 1)",
      [name, email, hash],
    );
    console.log(`Created admin: ${email}`);
  }
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`Generated password: ${password}`);
    console.log("Store this password now; it is not saved anywhere else.");
  }
} finally {
  await connection.end();
}
