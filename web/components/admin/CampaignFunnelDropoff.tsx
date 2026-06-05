import type { ObservatoryCampaignFunnel } from "@/lib/observatory/types";

export type CampaignFunnelStep = {
  label: string;
  value: number;
};

export function buildCampaignFunnelSteps(
  campaign: ObservatoryCampaignFunnel,
): CampaignFunnelStep[] {
  return [
    { label: "Visitas fundador", value: campaign.fundadorViews },
    { label: "Inicio lectura", value: campaign.fullReadingIntroViews },
    { label: "Paso 1", value: campaign.step1Views },
    { label: "Paso 2", value: campaign.step2Views },
    { label: "Paso 3", value: campaign.step3Views },
    { label: "Paso 4", value: campaign.step4Views },
    { label: "Paso 5", value: campaign.step5Views },
    { label: "Análisis iniciado", value: campaign.analysisStarted },
    { label: "Lecturas archivadas", value: campaign.diagnosticArchived },
  ];
}

export function CampaignFunnelDropoff({ campaign }: { campaign: ObservatoryCampaignFunnel }) {
  const steps = buildCampaignFunnelSteps(campaign);
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="mt-4 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B7A8C]">
        Embudo · caída por etapa
      </p>
      <ul className="space-y-1.5">
        {steps.map((step) => {
          const widthPct = Math.max(4, Math.round((step.value / max) * 100));
          return (
            <li key={step.label} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-2 text-xs">
              <span className="truncate text-[#6B7A8C]">{step.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-[#E8EEF3]">
                <div
                  className="h-full rounded-full bg-[#1A9BB0]"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="text-right font-bold tabular-nums text-[#0B2E59]">
                {step.value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
