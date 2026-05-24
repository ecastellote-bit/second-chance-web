"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "vu_founder_wave_banner_dismissed";

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
        Ola fundadora
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-[#243647]">
        Estamos abriendo el barrio con los primeros usuarios. Tu participación ayuda a sembrar
        esta primera etapa — si algo confunde, contanos.
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
