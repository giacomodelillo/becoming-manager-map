import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const INPUT =
  "w-full border border-white/25 bg-white/5 px-3 text-base text-[var(--paper)] placeholder:text-white/40 focus:outline-2 focus:outline-[var(--gold)] sm:text-sm";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="expo-eyebrow">{children}</p>;
}

export function TextField({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">{label}</span>
      <input
        className={cn(INPUT, "h-12")}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  maxLength,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">{label}</span>
      {hint && <span className="block text-xs text-white/45">{hint}</span>}
      <textarea
        className={cn(INPUT, "py-3")}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" };

export function Btn({ variant = "primary", className, ...props }: BtnProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-semibold transition active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-40",
        variant === "primary" && "bg-[var(--gold)] text-[var(--ink)]",
        variant === "ghost" && "border border-white/40 text-[var(--paper)] active:bg-white/10",
        variant === "danger" && "border border-[var(--magenta)] text-[#ff7aa6] active:bg-[var(--magenta)]/15",
        className,
      )}
      {...props}
    />
  );
}

export function IconBtn({
  label,
  danger,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex size-12 shrink-0 items-center justify-center border transition active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-30",
        danger
          ? "border-[var(--magenta)]/70 text-[#ff7aa6] active:bg-[var(--magenta)]/15"
          : "border-white/30 text-[var(--paper)] active:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}
