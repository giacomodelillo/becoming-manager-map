"use client";

import { useEffect, useState } from "react";
import { adminStore, isDirty, useAdminState } from "@/lib/expo/admin-store";
import { getAuth, logout } from "@/lib/expo/admin-api";
import { getFairState, refreshFairData, useFairData } from "@/lib/expo/data-store";
import { AdminEditor } from "./admin-editor";
import { Eyebrow } from "./fields";
import { PinGate } from "./pin-gate";

type Auth = "loading" | "unconfigured" | "locked" | "open";

/** Contenuto del pannello dettaglio dell'area riservata: PIN, poi tutte le impostazioni. */
export function AdminPanel() {
  const data = useFairData();
  const admin = useAdminState();
  const [auth, setAuth] = useState<Auth>("loading");

  useEffect(() => {
    let alive = true;
    getAuth()
      .then((a) => alive && setAuth(!a.configured ? "unconfigured" : a.admin ? "open" : "locked"))
      .catch(() => alive && setAuth("locked"));
    return () => {
      alive = false;
    };
  }, []);

  // appena entrati, la bozza parte dai dati pubblicati
  useEffect(() => {
    if (auth === "open" && data.config && !admin.draft) adminStore.load(data.config, data.version);
  }, [auth, data.config, data.version, admin.draft]);

  // uscendo dalla pagina la bozza non salvata si perde
  useEffect(() => () => adminStore.clear(), []);

  async function handleLogout() {
    if (isDirty(adminStore.getState()) && !window.confirm("Ci sono modifiche non salvate. Uscire comunque?")) {
      return;
    }
    await logout();
    adminStore.clear();
    setAuth("locked");
  }

  async function handleReload() {
    await refreshFairData();
    const fresh = getFairState();
    if (fresh.config) adminStore.load(fresh.config, fresh.version);
  }

  if (auth === "loading") return <p className="text-sm text-white/60">Caricamento…</p>;

  if (auth === "unconfigured") {
    return (
      <div className="space-y-2">
        <Eyebrow>Area riservata</Eyebrow>
        <p className="text-base">
          L&apos;area riservata è disattivata: imposta <code>EXPO_ADMIN_PIN</code> in <code>.env.local</code>{" "}
          (almeno 4 cifre) e riavvia il server.
        </p>
      </div>
    );
  }

  if (auth === "locked") return <PinGate onSuccess={() => setAuth("open")} />;

  if (!admin.draft) {
    return (
      <p className="text-sm text-white/60">
        {data.status === "error" ? "Dati non disponibili. Riprova." : "Caricamento dati…"}
      </p>
    );
  }

  return <AdminEditor onLogout={handleLogout} onExpired={() => setAuth("locked")} onReload={handleReload} />;
}
