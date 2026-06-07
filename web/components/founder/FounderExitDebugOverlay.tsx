"use client";

import type { FounderExitDebugSnapshot } from "@/lib/founder/useFounderLandingEngagement";
import { clearFounderExitModalSessionForDebug } from "@/lib/founder/useFounderLandingEngagement";

type Props = {
  snapshot: FounderExitDebugSnapshot;
};

export function FounderExitDebugOverlay({ snapshot }: Props) {
  return (
    <div className="fixed bottom-2 left-2 z-[200] max-w-[16rem] rounded-lg border border-amber-400/40 bg-black/85 p-2 font-mono text-[9px] leading-relaxed text-amber-100 shadow-lg">
      <p className="mb-1 font-bold text-amber-300">debugFounderExit</p>
      <ul className="space-y-0.5">
        <li>hasRelevantAction: {String(snapshot.hasRelevantAction)}</li>
        <li>exitModalShown: {String(snapshot.exitModalShownThisSession)}</li>
        <li>backGuardArmed: {String(snapshot.backGuardArmed)}</li>
        <li>popstate listener: {String(snapshot.listenerActive)}</li>
        <li>lastExitTrigger: {snapshot.lastExitTrigger ?? "—"}</li>
        <li>sessionStorage: {snapshot.sessionStorageValue ?? "null"}</li>
      </ul>
      <button
        type="button"
        className="mt-2 rounded border border-amber-400/50 px-1.5 py-0.5 text-[8px] text-amber-200"
        onClick={() => {
          clearFounderExitModalSessionForDebug();
          console.debug("[founder-exit] sessionStorage cleared — recargá para re-armar guard");
        }}
      >
        Clear session key
      </button>
    </div>
  );
}
