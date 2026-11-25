/** Nome dei file caricati: 12 caratteri esadecimali + estensione. */
export const MEDIA_FILE_RE = /^[a-f0-9]{12}\.(png|jpg|webp|svg)$/;

export const mediaUrl = (file: string) => `/media/${file}`;
