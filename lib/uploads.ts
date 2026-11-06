import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

function detectMime(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function saveUpload(
  file: File | null | undefined,
): Promise<{ name?: string; error?: string }> {
  if (!file || file.size === 0) return {};
  if (file.size > MAX_BYTES) return { error: "File is larger than 2 MB." };

  const ext = path.extname(file.name).toLowerCase().replace(".", "");
  if (!ALLOWED_EXT.has(ext)) {
    return { error: "Only JPG, PNG and WebP files are allowed." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!detectMime(buffer)) return { error: "File is not a valid image." };

  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return { name };
}
