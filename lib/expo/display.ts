import type { DisplaySettings, MapSize, PanelSize } from "./types";

export const DEFAULT_DISPLAY: DisplaySettings = { mapSize: "fit", panelSize: "standard", publicUrl: "" };

/** Dimensione dei nomi dei booth a scala 1 (px). Serve a calcolare lo zoom minimo. */
export const BASE_NAME_PX = 11;

export const MAP_SIZES: { value: MapSize; label: string; hint: string; textPx: number }[] = [
  { value: "fit", label: "Tutta la mappa", hint: "Si vede tutto, testi piccoli", textPx: 0 },
  { value: "readable", label: "Leggibile", hint: "Testi da 14 px", textPx: 14 },
  { value: "large", label: "Grande", hint: "Testi da 18 px", textPx: 18 },
  { value: "xlarge", label: "Extra grande", hint: "Testi da 24 px, per il totem", textPx: 24 },
];

export const PANEL_SIZES: { value: PanelSize; label: string; hint: string; zoom: number }[] = [
  { value: "standard", label: "Standard", hint: "100%", zoom: 1 },
  { value: "large", label: "Grande", hint: "125%", zoom: 1.25 },
  { value: "xlarge", label: "Extra grande", hint: "150%, per il totem", zoom: 1.5 },
];

export const mapTextPx = (size: MapSize): number => MAP_SIZES.find((s) => s.value === size)?.textPx ?? 0;
export const panelZoom = (size: PanelSize): number => PANEL_SIZES.find((s) => s.value === size)?.zoom ?? 1;
