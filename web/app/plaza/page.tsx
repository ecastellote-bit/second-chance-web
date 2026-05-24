"use client";

import { PlazaInicialView } from "@/components/plaza/PlazaInicialView";
import { PlazaPostActivacionView } from "@/components/plaza/PlazaPostActivacionView";
import { UserProfileGate } from "@/components/perfil/UserProfileGate";
import { getActivationChoice } from "@/lib/activacion/storage";
import type { OfficialActivationPathId } from "@/lib/content/officialActivationPaths";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function PlazaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showMap = searchParams.get("mapa") === "1";
  const [activationPathId, setActivationPathId] = useState<OfficialActivationPathId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setActivationPathId(getActivationChoice());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0B2E59] text-sm text-white/80">
        Cargando tu plaza…
      </div>
    );
  }

  if (showMap || !activationPathId) {
    return (
      <PlazaInicialView
        showEntradaLink={Boolean(activationPathId)}
        onOpenEntrada={activationPathId ? () => router.push("/plaza") : undefined}
      />
    );
  }

  return (
    <PlazaPostActivacionView
      activationPathId={activationPathId}
      onOpenMap={() => router.push("/plaza?mapa=1")}
      onChangeCartel={() => router.push("/activacion")}
    />
  );
}

export default function PlazaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[100dvh] items-center justify-center bg-[#0B2E59] text-sm text-white/80">
          Cargando tu plaza…
        </div>
      }
    >
      <UserProfileGate>
        <PlazaPageContent />
      </UserProfileGate>
    </Suspense>
  );
}
