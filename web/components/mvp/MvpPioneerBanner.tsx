"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "vu_mvp_banner_dismissed";

export function MvpPioneerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(sessionStorage.getItem(DISMISS_KEY) !== "1");
  }, []);

  if (!visible) return null;

  return (
    <aside
      className="mx-4 mb-4 rounded-2xl border border-[#1A9BB0]/30 bg-[#E6F6FA] px-4 py-3 shadow-sm"
      role="status"
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#0B2E59]">
        MVP en prueba
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-[#243647]">
        Estamos probando VocationUp con personas reales. Si algo confunde o incomoda, anotalo:
        nos ayuda más que el elogio.
      </p>
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setVisible(false);
        }}
        className="vu-focus mt-2 text-[12px] font-semibold text-[#1A9BB0] underline"
      >
        Entendido
      </button>
    </aside>
  );
}
