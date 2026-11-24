import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { MEDIA_FILE_RE } from "../media";

/** Cartella dei file caricati. Cambiala con EXPO_MEDIA_DIR. */
const DIR = process.env.EXPO_MEDIA_DIR ?? path.join(process.cwd(), "data", "media");

export const MAX_MEDIA_BYTES = 3 * 1024 * 1024;

export const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
};

/** Riconosce il formato dai primi byte: il tipo dichiarato dal client non conta. */
export function sniff(buf: Buffer): "png" | "jpg" | "webp" | "svg" | null {
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "png";
  }
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return "webp";
  }
  const head = buf.subarray(0, 1024).toString("utf8").replace(/^\uFEFF/, "").trimStart();
  if ((head.startsWith("<svg") || head.startsWith("<?xml")) && head.includes("<svg")) {
    const whole = buf.toString("utf8");
    if (/<script|\son\w+\s*=|javascript:/i.test(whole)) return null; // niente script negli SVG
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
  return file;
}

export async function readMedia(file: string): Promise<{ buf: Buffer; ext: string } | null> {
  if (!MEDIA_FILE_RE.test(file)) return null;
  try {
    return { buf: await fs.readFile(path.join(DIR, file)), ext: file.split(".")[1] };
  } catch {
    return null;
  }
}
