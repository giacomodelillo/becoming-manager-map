"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, SkipBack, SkipForward } from "lucide-react";

const ICON_MOTION = {
  initial: { opacity: 0, scale: 0.5, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.5, filter: "blur(4px)" },
  transition: { duration: 0.1 },
} as const;

const SECONDARY =
  "bg-foreground/10 hover:bg-foreground/20 flex h-12 w-12 items-center justify-center rounded-full transition-colors disabled:opacity-40";

export function TimerControls({
  running,
  disabled,
  showSkip,
  onToggle,
  onReset,
  onPrevious,
  onNext,
}: {
  running: boolean;
  disabled?: boolean;
  /** Mostra precedente/successiva (solo con più fasi). */
  showSkip?: boolean;
  onToggle: () => void;
  onReset: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex w-fit items-center gap-3">
      {showSkip && (
        <button
          type="button"
          aria-label="Fase precedente"
          disabled={disabled}
          onClick={onPrevious}
          className={SECONDARY}
        >
          <SkipBack className="size-5" />
        </button>
      )}

      <motion.button
        type="button"
        aria-label={running ? "Metti in pausa" : "Avvia"}
        disabled={disabled}
        onClick={onToggle}
        whileTap={{ scale: 0.9 }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff3828] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        <AnimatePresence initial={false} mode="wait">
          {running ? (
            <motion.svg
              key="pause"
              {...ICON_MOTION}
              viewBox="0 0 10 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 fill-current text-white"
            >
              <path d="M1.03906 12.7266H2.82031C3.5 12.7266 3.85938 12.3672 3.85938 11.6797V1.03906C3.85938 0.328125 3.5 0 2.82031 0H1.03906C0.359375 0 0 0.359375 0 1.03906V11.6797C0 12.3672 0.359375 12.7266 1.03906 12.7266ZM6.71875 12.7266H8.49219C9.17969 12.7266 9.53125 12.3672 9.53125 11.6797V1.03906C9.53125 0.328125 9.17969 0 8.49219 0H6.71875C6.03125 0 5.67188 0.359375 5.67188 1.03906V11.6797C5.67188 12.3672 6.03125 12.7266 6.71875 12.7266Z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="play"
              {...ICON_MOTION}
              viewBox="0 0 12 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 fill-current text-white"
            >
              <path d="M0.9375 13.2422C1.25 13.2422 1.51562 13.1172 1.82812 12.9375L10.9375 7.67188C11.5859 7.28906 11.8125 7.03906 11.8125 6.625C11.8125 6.21094 11.5859 5.96094 10.9375 5.58594L1.82812 0.3125C1.51562 0.132812 1.25 0.015625 0.9375 0.015625C0.359375 0.015625 0 0.453125 0 1.13281V12.1172C0 12.7969 0.359375 13.2422 0.9375 13.2422Z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {showSkip && (
        <button
          type="button"
          aria-label="Fase successiva"
          disabled={disabled}
          onClick={onNext}
          className={SECONDARY}
        >
          <SkipForward className="size-5" />
        </button>
      )}

      <button
        type="button"
        aria-label="Azzera"
        disabled={disabled}
        onClick={onReset}
        className={`${SECONDARY} text-[#ff3828]`}
      >
        <Plus className="rotate-45" />
      </button>
    </div>
  );
}
