import { DetailBreadcrumb } from "@/components/shell/detail-breadcrumb";
import { TimerSettings } from "@/components/timer/timer-settings";

export function TimerDetail() {
  return (
    <div>
      <DetailBreadcrumb
        items={[{ label: "Horizon", href: "/" }, { label: "Timer" }]}
      />

      <div className="my-[9vh] space-y-10">
        <div className="space-y-4">
          <h2 className="text-3xl font-medium tracking-tighter">Timer</h2>
          <p className="text-foreground/70 max-w-xl leading-relaxed">
            Un unico conto alla rovescia condiviso, singolo o a fasi in sequenza:
            avvio, pausa, azzeramento e modifiche si vedono su tutti i
            dispositivi collegati alla stessa rete, e da ognuno si possono
            comandare.
          </p>
        </div>

        <TimerSettings />

        <div className="space-y-3">
          <h3 className="text-foreground/50 text-sm">Collega un altro dispositivo</h3>
          <ol className="text-foreground/70 max-w-xl list-decimal space-y-2 pl-5 leading-relaxed">
            <li>Collega il dispositivo alla stessa rete Wi-Fi del computer.</li>
            <li>
              Apri l&apos;indirizzo <em>Network</em> che Next stampa nel
              terminale all&apos;avvio, seguito da <code>/timer</code>.
            </li>
            <li>
              Per limitare chi può comandare il timer, imposta{" "}
              <code>TIMER_PIN</code> in <code>.env.local</code>.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
