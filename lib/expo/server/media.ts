import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

// Cartella fissa dentro public: niente più variabili d'ambiente dinamiche
const DIR = path.join(process.cwd(), "public", "media");

export const MAX_MEDIA_BYTES = 3 * 1024 * 1024;

export function sniff(buf: Buffer): "png" | "jpg" | "webp" | "svg" | null {
  if (
    buf.length > 8 &&
    buf
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
    return "jpg";
  if (
    buf.length > 12 &&
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "webp";
  const head = buf
    .subarray(0, 1024)
    .toString("utf8")
    .replace(/^\uFEFF/, "")
    .trimStart();
  if (
    (head.startsWith("<svg") || head.startsWith("<?xml")) &&
    head.includes("<svg")
  ) {
    const whole = buf.toString("utf8");
    if (/<script|\son\w+\s*=|javascript:/i.test(whole)) return null;
    return "svg";
  }
  return null;
}

export async function saveMedia(buf: Buffer): Promise<string | null> {
  const ext = sniff(buf);
  if (!ext) return null;
  const file = `${randomBytes(6).toString("hex")}.${ext}`;
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(path.join(DIR, file), buf);
  // Ritorna direttamente l'URL pubblico da usare nei tag <img src="..." />
  return `/media/${file}`;
}
