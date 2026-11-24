/**
 * Prepara un'immagine prima del caricamento: riduce PNG/JPG/WebP al lato massimo
 * indicato e li converte in WebP. Gli SVG restano com'è (massimo 300 KB).
 */
export async function prepareImage(file: File, maxSide: number): Promise<Blob> {
  if (file.type === "image/svg+xml") {
    if (file.size > 300 * 1024) throw new Error("SVG troppo pesante (massimo 300 KB)");
    return file;
  }
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    throw new Error("Formato non supportato: usa PNG, JPG, WebP o SVG");
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossibile elaborare l'immagine");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!blob) throw new Error("Impossibile elaborare l'immagine");
  return blob;
}
