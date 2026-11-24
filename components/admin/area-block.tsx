"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import type { HistoryMode } from "@/lib/expo/admin-store";
import { cn } from "@/lib/utils";
import {
  addCompany,
  countCompanies,
  duplicateCompany,
  MAX_COMPANIES,
  moveArea,
  moveCompany,
  removeArea,
  removeCompany,
  updateArea,
  updateCompany,
} from "@/lib/expo/config-ops";
import type { Area, CompanyDraft, FairConfig, ZoneTone } from "@/lib/expo/types";
import { CompanyForm } from "./company-form";
import { Btn, Eyebrow, IconBtn, TextField } from "./fields";

const TONES: { tone: ZoneTone; label: string; color: string }[] = [
  { tone: "gold", label: "Oro", color: "#f5c84c" },
  { tone: "magenta", label: "Magenta", color: "#d43d74" },
  { tone: "gray", label: "Grigio", color: "#7a7a7a" },
];

type Props = {
  config: FairConfig;
  area: Area;
  index: number;
  /** numero del primo booth di quest'area */
  start: number;
  openKey: string | null;
  onOpen: (key: string | null) => void;
  onChange: (config: FairConfig, mode?: HistoryMode) => void;
};

function CompanyRow({
  company,
  number,
  open,
  onToggle,
  children,
}: {
  company: CompanyDraft;
  number: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: company.key,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border border-white/20 bg-white/5",
        isDragging && "relative z-20 border-[var(--gold)] bg-[var(--ink)] opacity-90",
      )}
    >
      <div className="flex items-center gap-1 p-2">
        <button
          type="button"
          aria-label="Trascina per riordinare"
          className="flex size-12 shrink-0 cursor-grab touch-none items-center justify-center text-white/60 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span
            className={cn(
              "expo-serif flex size-10 shrink-0 items-center justify-center text-xl",
              company.hidden ? "bg-white/25 text-white/70" : "bg-[var(--paper)] text-[var(--ink)]",
            )}
          >
            {number}
          </span>
          <span className="min-w-0">
            <span className={cn("block truncate font-semibold", company.hidden && "line-through opacity-60")}>
              {company.name || "Senza nome"}
            </span>
            <span className="block truncate text-xs text-white/55">
              {company.hidden ? "Assente" : company.sector || "Settore non indicato"}
            </span>
          </span>
        </button>
      </div>
      {open && children}
    </li>
  );
}

export function AreaBlock({ config, area, index, start, openKey, onOpen, onChange }: Props) {
  const lastArea = index === config.areas.length - 1;
  const total = countCompanies(config);

  return (
    <section className="space-y-4 border border-white/20 bg-white/5 p-4">
      <header className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <TextField
              label={`Area ${index + 1} · nome`}
              value={area.label}
              maxLength={40}
              onChange={(label) => onChange(updateArea(config, area.id, { label }), "coalesce")}
            />
          </div>
          <IconBtn
            label="Sposta area prima"
            disabled={index === 0}
            onClick={() => onChange(moveArea(config, area.id, -1))}
          >
            <ChevronUp className="size-5" strokeWidth={1.5} />
          </IconBtn>
          <IconBtn
            label="Sposta area dopo"
            disabled={lastArea}
            onClick={() => onChange(moveArea(config, area.id, 1))}
          >
            <ChevronDown className="size-5" strokeWidth={1.5} />
          </IconBtn>
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <div className="space-y-1">
            <Eyebrow>Colore</Eyebrow>
            <div className="flex gap-2" role="group" aria-label="Colore dell'area">
              {TONES.map((t) => (
                <button
                  key={t.tone}
                  type="button"
                  aria-label={t.label}
                  aria-pressed={area.tone === t.tone}
                  onClick={() => onChange(updateArea(config, area.id, { tone: t.tone }))}
                  style={{ backgroundColor: t.color }}
                  className={cn(
                    "size-12 border-2 transition active:translate-y-0.5",
                    area.tone === t.tone
                      ? "border-[var(--paper)] outline-2 outline-offset-2 outline-[var(--paper)]"
                      : "border-transparent",
                  )}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Eyebrow>Verso di avanzamento</Eyebrow>
            <div className="flex" role="group" aria-label="Verso di avanzamento">
              {(["up", "down"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={area.direction === d}
                  onClick={() => onChange(updateArea(config, area.id, { direction: d }))}
                  className={cn(
                    "flex h-12 min-w-28 items-center justify-center gap-2 border border-white/40 px-4 text-sm font-semibold transition active:translate-y-0.5",
                    area.direction === d
                      ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]"
                      : "text-[var(--paper)]",
                  )}
                >
                  {d === "up" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
                  {d === "up" ? "Sale" : "Scende"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <SortableContext items={area.companies.map((c) => c.key)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {area.companies.map((c, ci) => {
            const open = openKey === c.key;
            const first = index === 0 && ci === 0;
            const last = lastArea && ci === area.companies.length - 1;
            const single = area.companies.length < 2;
            return (
              <CompanyRow
                key={c.key}
                company={c}
                number={start + ci}
                open={open}
                onToggle={() => onOpen(open ? null : c.key)}
              >
                <div className="flex flex-wrap gap-2 border-t border-white/20 p-2">
                  <IconBtn
                    label="Sposta su"
                    disabled={first || (ci === 0 && single)}
                    onClick={() => onChange(moveCompany(config, c.key, -1))}
                  >
                    <ArrowUp className="size-5" strokeWidth={1.5} />
                  </IconBtn>
                  <IconBtn
                    label="Sposta giù"
                    disabled={last || (ci === area.companies.length - 1 && single)}
                    onClick={() => onChange(moveCompany(config, c.key, 1))}
                  >
                    <ArrowDown className="size-5" strokeWidth={1.5} />
                  </IconBtn>
                  <IconBtn
                    label="Duplica azienda"
                    disabled={total >= MAX_COMPANIES}
                    onClick={() => {
                      const result = duplicateCompany(config, c.key);
                      onChange(result.config);
                      if (result.key) onOpen(result.key);
                    }}
                  >
                    <Copy className="size-5" strokeWidth={1.5} />
                  </IconBtn>
                  <IconBtn
                    label="Elimina azienda"
                    danger
                    disabled={single}
                    onClick={() => {
                      if (window.confirm(`Eliminare "${c.name || "questa azienda"}"?`)) {
                        onChange(removeCompany(config, c.key));
                      }
                    }}
                  >
                    <Trash2 className="size-5" strokeWidth={1.5} />
                  </IconBtn>
                </div>
                <CompanyForm
                  company={c}
                  onChange={(patch, mode) => onChange(updateCompany(config, c.key, patch), mode)}
                />
              </CompanyRow>
            );
          })}
        </ul>
      </SortableContext>

      <div className="flex flex-wrap gap-2">
        <Btn
          variant="ghost"
          disabled={total >= MAX_COMPANIES}
          onClick={() => {
            const result = addCompany(config, area.id);
            onChange(result.config);
            if (result.key) onOpen(result.key);
          }}
        >
          <Plus className="size-4" /> Aggiungi azienda
        </Btn>
        <Btn
          variant="danger"
          disabled={config.areas.length < 2}
          onClick={() => {
            if (window.confirm(`Eliminare l'area "${area.label}"? Le sue aziende passano all'area vicina.`)) {
              onChange(removeArea(config, area.id));
            }
          }}
        >
          <Trash2 className="size-4" /> Elimina area
        </Btn>
      </div>
    </section>
  );
}
