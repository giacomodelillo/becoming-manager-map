# Horizon: base layout

Layout applicativo con tre parti:

1. **Cornice scura** (`bg-background`) che incornicia tutto.
2. **Stage**: la sezione principale a destra, con angoli arrotondati (`rounded-3xl`) e superficie più chiara (`bg-stage`).
3. **Pannello dettaglio**: compare a sinistra e mostra i contenuti dell'elemento selezionato.

In più c'è una **floating toolbar** fissa in alto a destra.

```
┌──────────────────────────────────────────────────────────┐
│  cornice (bg-background)                      [toolbar]  │
│  ┌───────────────────┐  ┌──────────────────────────────┐ │
│  │  DETAIL PANEL     │  │  STAGE (rounded-3xl)         │ │
│  │  slot @detail     │  │  children                    │ │
│  │                   │  │                              │ │
│  └───────────────────┘  └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

Su mobile (< `lg`) lo stage sta sopra e il dettaglio sotto.

---

## 1. Come funziona

### Idea di base

Ogni rotta fornisce **due contenuti in parallelo**:

- `children`: quello che va nello **stage**
- `@detail`: quello che va nel **pannello di sinistra**

Next li compone in `app/layout.tsx` grazie alle **parallel routes**. Lo shell (`AppShell`) non sa niente dei contenuti: riceve due `ReactNode` e li dispone.

### Apertura e chiusura del dettaglio

Lo stato `detailOpen` vive in `ShellProvider` (`shell-context.tsx`) ed è esposto con l'hook `useShell()`:

| Valore                | Descrizione                    |
| --------------------- | ------------------------------ |
| `detailOpen`          | `true` se il pannello è aperto |
| `setDetailOpen(bool)` | apre o chiude esplicitamente   |
| `toggleDetail()`      | inverte lo stato               |

Il layout usa una griglia a due colonne che passa da `0fr 1fr` (chiuso) a `1fr 1fr` (aperto) con transizione CSS. Lo stage si ridimensiona in modo fluido.

Regole di apertura:

- **Caricamento diretto di una rotta**: il dettaglio parte aperto se `pathname !== "/"` (vedi `AppShell`). Vale solo per lo stato iniziale.
- **Click su un elemento**: la navigazione cambia la rotta ma **non** tocca lo stato dello shell, quindi il link deve chiamare `setDetailOpen(true)` nel suo `onClick` (come fa `ItemGrid`).
- **Toolbar**: il bottone espandi/comprimi chiama `toggleDetail()`.

### Struttura dei file

```
src/
├─ app/
│  ├─ layout.tsx                      # font, <html>/<body>, monta AppShell con lo slot detail
│  ├─ page.tsx                        # stage della home
│  ├─ globals.css                     # token shadcn + token --stage
│  ├─ items/[slug]/page.tsx           # stage della rotta elemento
│  └─ @detail/
│     ├─ default.tsx                  # fallback dello slot (navigazione hard senza match)
│     ├─ page.tsx                     # dettaglio della home ("nessuna selezione")
│     └─ items/[slug]/page.tsx        # dettaglio dell'elemento
├─ lib/
│  └─ items.ts                        # dati degli elementi (sostituisci con i tuoi)
└─ components/
   ├─ shell/                          # infrastruttura del layout (non dipende dai contenuti)
   │  ├─ shell-context.tsx            # stato detailOpen + useShell()
   │  ├─ app-shell.tsx                # griglia, toolbar, provider
   │  ├─ main-stage.tsx               # stage arrotondato
   │  ├─ detail-panel.tsx             # contenitore del dettaglio
   │  ├─ detail-breadcrumb.tsx        # breadcrumb riusabile
   │  ├─ floating-toolbar.tsx         # barra flottante
   │  └─ toolbar-button.tsx           # bottone con tooltip
   ├─ sections/                       # contenuti: stage e dettagli
   │  ├─ hero-section.tsx
   │  ├─ item-grid.tsx
   │  ├─ home-stage.tsx
   │  ├─ item-detail.tsx
   │  └─ empty-detail.tsx
   └─ ui/                             # shadcn (button, tooltip)
```

**Regola d'oro**: `components/shell/` è l'infrastruttura, `components/sections/` sono i contenuti. Quando aggiungi funzionalità, di norma tocchi solo `sections/`, `app/` e `lib/`.

---

## 2. Ricette

### 2.1 Aggiungere un nuovo elemento (con dettaglio)

È il caso più semplice: basta aggiungere una voce in `src/lib/items.ts`.

```ts
export const ITEMS: Item[] = [
  // ...
  {
    slug: "epsilon",
    title: "Epsilon",
    summary: "Quinto elemento.",
    description: "Descrizione estesa mostrata nel dettaglio.",
    tags: ["nextjs"],
    specs: [
      { label: "Stato", value: "Attivo" },
      { label: "Versione", value: "1.0.0" },
    ],
  },
];
```

La card compare nella griglia, la rotta `/items/epsilon` viene generata da `generateStaticParams` e il dettaglio appare da solo.

### 2.2 Cambiare l'aspetto del dettaglio di un elemento

Modifica `components/sections/item-detail.tsx`. Il pannello accetta qualsiasi JSX: tabelle, codice, immagini, componenti client.

Struttura consigliata per ogni dettaglio:

```tsx
<div>
  <DetailBreadcrumb
    items={[{ label: "Horizon", href: "/" }, { label: "Titolo" }]}
  />
  <div className="my-[9vh] space-y-10">{/* contenuto */}</div>
</div>
```

Il breadcrumb lo renderizza **ogni pagina di dettaglio**, così può cambiare da rotta a rotta.

### 2.3 Aggiungere una nuova sezione con rotte proprie

Una nuova area (esempio: `/progetti/[slug]`) richiede **sempre una coppia di rotte**: una per lo stage e una per il dettaglio.

```
app/progetti/[slug]/page.tsx             # stage
app/@detail/progetti/[slug]/page.tsx     # dettaglio
```

**Stage** (`app/progetti/[slug]/page.tsx`):

```tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProgettiStage } from "@/components/sections/progetti-stage";
import { getProgetto } from "@/lib/progetti";

async function Stage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getProgetto(slug)) notFound();
  return <ProgettiStage />;
}

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<ProgettiStage />}>
      <Stage params={params} />
    </Suspense>
  );
}
```

**Dettaglio** (`app/@detail/progetti/[slug]/page.tsx`): stessa forma, con `<ProgettoDetail />` al posto dello stage.

Per una rotta senza parametri (esempio `/about`) non serve `Suspense`:

```tsx
// app/about/page.tsx
export default function Page() {
  return <AboutStage />;
}

// app/@detail/about/page.tsx
export default function DetailPage() {
  return <AboutDetail />;
}
```

> **Importante: slot senza rotta corrispondente.**
> Nelle navigazioni _soft_ (click sui link), se `@detail` non ha una rotta per il nuovo percorso, Next **mantiene il contenuto precedente** dello slot. Per questo ogni rotta dello stage dovrebbe avere la sua gemella in `@detail`.
> Se vuoi un fallback generale ("nessuna selezione") per tutte le rotte non gestite, aggiungi un catch-all:
>
> ```tsx
> // app/@detail/[...rest]/page.tsx
> import { EmptyDetail } from "@/components/sections/empty-detail";
> export default function CatchAll() {
>   return <EmptyDetail />;
> }
> ```

### 2.4 Regola per `params` (Suspense)

Qualunque pagina che usa `await params` (o `searchParams`) **deve** farlo dentro un componente avvolto da `<Suspense>`, altrimenti Next segnala l'errore di navigazione istantanea. Il pattern è sempre quello della ricetta 2.3: un componente interno `async` + `Suspense` con fallback uguale allo stage/dettaglio.

### 2.5 Aggiungere sezioni nello stage principale

Lo stage è una colonna scrollabile. Le sezioni sono componenti messi uno sotto l'altro. In `components/sections/home-stage.tsx`:

```tsx
import { HeroSection } from "./hero-section";
import { ItemGrid } from "./item-grid";
import { StatsSection } from "./stats-section"; // nuova

export function HomeStage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ItemGrid />
    </>
  );
}
```

Convenzioni per le sezioni:

- Larghezza e centratura: `mx-auto max-w-3xl px-8`.
- Spaziatura verticale: `pb-10` o `py-16`. La prima sezione ha `pt-28` per non finire sotto la toolbar.
- Server Component di default. Aggiungi `"use client"` solo se serve stato, eventi o `useShell()`.

### 2.6 Elementi fissi nello stage

Ci sono due casi diversi.

**a) Fisso durante lo scroll, ma dentro lo scroll (esempio: header sticky)**

Lo stage ha un contenitore interno scrollabile, quindi `sticky` funziona. L'elemento deve essere figlio diretto del contenuto dello stage (o stare in un genitore abbastanza alto).

```tsx
// components/sections/stage-header.tsx
export function StageHeader() {
  return (
    <header className="bg-stage/80 sticky top-0 z-10 px-8 py-4 backdrop-blur">
      <h2 className="text-sm font-medium">Titolo fisso</h2>
    </header>
  );
}
```

Poi lo metti per primo in `HomeStage`.

**b) Fisso rispetto allo stage, che non scorre mai (esempio: hint in basso, bottone flottante)**

Non usare `fixed`: sarebbe posizionato rispetto alla finestra e uscirebbe dagli angoli arrotondati. Usa un overlay `absolute` dentro lo stage. Aggiungi una prop `overlay` a `MainStage`:

```tsx
// components/shell/main-stage.tsx
import type { ReactNode } from "react";

export function MainStage({
  children,
  overlay,
}: {
  children: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <main className="order-1 min-w-0 p-2 lg:order-2 lg:h-full">
      <div className="bg-stage relative h-full min-h-[calc(100dvh-1rem)] overflow-clip rounded-3xl">
        <div className="h-full overflow-y-auto">{children}</div>
        {overlay && (
          <div className="pointer-events-none absolute inset-0 z-10">
            {overlay}
          </div>
        )}
      </div>
    </main>
  );
}
```

Inoltra la prop in `app-shell.tsx`:

```tsx
export type AppShellProps = {
  children: ReactNode;
  detail: ReactNode;
  /** Elementi fissi rispetto allo stage */
  stageOverlay?: ReactNode;
};

export function AppShell({ children, detail, stageOverlay }: AppShellProps) {
  const pathname = usePathname();
  return (
    <ShellProvider defaultDetailOpen={pathname !== "/"}>
      <TooltipProvider delay={150}>
        <ShellFrame detail={detail} stageOverlay={stageOverlay}>
          {children}
        </ShellFrame>
      </TooltipProvider>
    </ShellProvider>
  );
}

function ShellFrame({ children, detail, stageOverlay }: AppShellProps) {
  const { detailOpen } = useShell();
  return (
    <div className="bg-background text-foreground h-dvh w-full overflow-y-auto lg:overflow-hidden">
      <FloatingToolbar />
      <div
        data-detail={detailOpen ? "open" : "closed"}
        className="grid h-full grid-cols-1 lg:grid-cols-[0fr_1fr] lg:transition-[grid-template-columns] lg:duration-300 lg:ease-in-out lg:data-[detail=open]:grid-cols-[1fr_1fr]"
      >
        <DetailPanel>{detail}</DetailPanel>
        <MainStage overlay={stageOverlay}>{children}</MainStage>
      </div>
    </div>
  );
}
```

E lo usi in `app/layout.tsx`:

```tsx
<AppShell detail={detail} stageOverlay={<StageHint />}>
  {children}
</AppShell>
```

```tsx
// components/sections/stage-hint.tsx
export function StageHint() {
  return (
    <p className="text-foreground/40 absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-wide">
      Seleziona un elemento
    </p>
  );
}
```

Regola: il contenitore overlay ha `pointer-events-none`, quindi gli elementi che devono essere cliccabili vanno marcati con `pointer-events-auto`.

> L'overlay è montato nel layout, quindi compare su **tutte** le rotte. Se serve solo su alcune, leggi `usePathname()` dentro il componente (client) e restituisci `null` altrove.

### 2.7 Elementi fissi nel pannello dettaglio

Il pannello ha uno scroll interno (`overflow-y-auto`), quindi la stessa tecnica `sticky` funziona. Esempio, un breadcrumb che resta in vista:

```tsx
<div className="bg-background sticky top-0 z-10">
  <DetailBreadcrumb items={[...]} />
</div>
```

Se vuoi qualcosa di fisso per **tutte** le pagine di dettaglio, mettilo in `components/shell/detail-panel.tsx`, attorno a `{children}`.

### 2.8 Aggiungere tasti permanenti alla toolbar

La toolbar è in `components/shell/floating-toolbar.tsx`. Ogni azione è un `ToolbarButton`.

```tsx
"use client";

import { House, Maximize, Minimize } from "lucide-react";
import { useRouter } from "next/navigation";
import { ToolbarButton } from "./toolbar-button";
import { useShell } from "./shell-context";

export function FloatingToolbar() {
  const router = useRouter();
  const { detailOpen, toggleDetail } = useShell();

  return (
    <div className="bg-stage/80 border-foreground/5 fixed right-6 top-6 z-50 flex items-center gap-1 rounded-2xl border p-1.5 backdrop-blur">
      <ToolbarButton
        label="Home"
        icon={House}
        onClick={() => router.push("/")}
      />

      <span className="bg-foreground/10 mx-0.5 h-5 w-px" />

      <ToolbarButton
        label={detailOpen ? "Nascondi dettaglio" : "Mostra dettaglio"}
        icon={detailOpen ? Maximize : Minimize}
        onClick={toggleDetail}
      />
    </div>
  );
}
```

Props di `ToolbarButton`:

| Prop      | Tipo         | Descrizione                      |
| --------- | ------------ | -------------------------------- |
| `label`   | `string`     | testo del tooltip e `aria-label` |
| `icon`    | `LucideIcon` | icona (da `lucide-react`)        |
| `onClick` | `() => void` | azione                           |

La toolbar è `fixed` rispetto alla finestra e sta sopra stage e dettaglio. Se un contenuto parte dall'alto, lascia spazio sufficiente (`pt-28` sulla prima sezione).

**Azioni che dipendono dalla pagina** (esempio: "esporta" solo nel dettaglio di un elemento): non metterle nella toolbar globale. Mettile come bottoni dentro la sezione, oppure passa dalla ricetta 2.6b usando un overlay.

### 2.9 Aggiungere bottoni e componenti shadcn

```bash
pnpm dlx shadcn@latest add <componente>
```

Usali dentro le sezioni come al solito. Se il componente gestisce lo stato, ricordati `"use client"`.

> **Attenzione a Base UI.** Questo progetto usa lo stile shadcn basato su **Base UI** (`@base-ui/react`), non su Radix. Non esiste `asChild`: per cambiare l'elemento renderizzato si usa la prop `render`:
>
> ```tsx
> <TooltipTrigger render={<Button variant="ghost" size="icon" />}>
>   <Icon />
> </TooltipTrigger>
> ```
>
> Prima di usare un componente con composizione, controlla sempre il file generato in `components/ui/`: è la fonte di verità per le prop.

### 2.10 Aprire o chiudere il dettaglio da un tuo componente

Qualsiasi componente client dentro lo shell può usare `useShell()`:

```tsx
"use client";
import { useShell } from "@/components/shell/shell-context";

export function OpenDetailButton() {
  const { setDetailOpen } = useShell();
  return <button onClick={() => setDetailOpen(true)}>Apri dettaglio</button>;
}
```

Per un link che apre il dettaglio:

```tsx
<Link href={`/items/${slug}`} onClick={() => setDetailOpen(true)}>
  ...
</Link>
```

### 2.11 Aggiungere stato condiviso allo shell

Se più componenti devono condividere altro stato (esempio: una vista "griglia/lista"), estendi `shell-context.tsx`:

```tsx
type ShellContextValue = {
  detailOpen: boolean;
  setDetailOpen: (open: boolean) => void;
  toggleDetail: () => void;
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
};
```

Aggiungi lo `useState` nel provider e includilo nel `useMemo` del valore.

### 2.12 Colori e tema

- Il tema scuro si attiva con la classe `dark` su `<html>` (in `app/layout.tsx`). Rimuovila per seguire il tema chiaro.
- Cornice: `--background`. Stage: `--stage` (token aggiunto in `globals.css`).
- Per cambiare il contrasto tra cornice e stage, modifica solo questi due valori:

```css
.dark {
  --background: oklch(0.1 0 0);
  --stage: oklch(0.18 0 0);
}
```

- Il token è esposto a Tailwind con `--color-stage: var(--stage)` dentro `@theme inline`, quindi funziona `bg-stage`, `bg-stage/80`, ecc.

### 2.13 Font

`app/layout.tsx` carica Geist con `next/font` e applica le variabili CSS su `<html>`. Perché Tailwind le usi, `globals.css` deve mapparle:

```css
@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

e il `body` deve avere `font-sans` (già presente nel layout).

---

## 3. Problemi frequenti

| Sintomo                                                  | Causa e rimedio                                                                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Errore "params accessed outside of Suspense"             | Avvolgi l'accesso a `params` in un componente dentro `<Suspense>` (ricetta 2.4)                             |
| Il dettaglio mostra il contenuto della pagina precedente | Manca la rotta gemella in `@detail` per quel percorso. Crea la coppia o aggiungi il catch-all (ricetta 2.3) |
| `<button>` annidato in `<button>`, errore di hydration   | Hai usato `asChild`. Con Base UI usa `render` (ricetta 2.9)                                                 |
| Cliccando un elemento il dettaglio non si apre           | Manca `setDetailOpen(true)` nell'`onClick` del link (ricetta 2.10)                                          |
| Un elemento `fixed` esce dagli angoli dello stage        | Usa l'overlay `absolute` (ricetta 2.6b)                                                                     |
| Il font non cambia                                       | Controlla il mapping `--font-sans` in `@theme inline` e che `<body>` abbia `font-sans`                      |
| Errori di tipo dopo aver creato `@detail`                | Riavvia `next dev` e cancella la cartella `.next`                                                           |

---

## 4. Checklist: aggiungere una pagina completa

1. Crea i dati in `lib/` (se la pagina è basata su elementi).
2. Crea il componente stage in `components/sections/`.
3. Crea il componente dettaglio in `components/sections/` (con `DetailBreadcrumb`).
4. Crea `app/<percorso>/page.tsx` (stage). Se usa `params`, aggiungi `generateStaticParams` e `Suspense`.
5. Crea `app/@detail/<percorso>/page.tsx` (dettaglio), con le stesse regole.
6. Nei link che portano alla pagina, chiama `setDetailOpen(true)` nell'`onClick`.
7. Verifica che il caricamento diretto dell'URL e la navigazione da click diano lo stesso risultato.
