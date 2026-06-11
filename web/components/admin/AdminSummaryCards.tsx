import type { ModerationSummaryCounts } from "@/lib/admin/unifiedModeration/types";

type CardDef = {
  key: keyof ModerationSummaryCounts;
  label: string;
  accent: string;
};

const CARDS: CardDef[] = [
  { key: "humanReviewPending", label: "Revisión humana", accent: "#DC2626" },
  { key: "reportsNew", label: "Reportes nuevos", accent: "#DC2626" },
  { key: "seedsPendingReview", label: "Semillas en revisión", accent: "#0B2E59" },
  { key: "contributionsPendingReview", label: "Aportes pendientes", accent: "#1A9BB0" },
  { key: "circleIdeasPending", label: "Ideas de círculo", accent: "#C6D92D" },
  { key: "contributionsFlagged", label: "Aportes flaggeados", accent: "#B45309" },
  { key: "adminPostsDraft", label: "Anuncios borrador", accent: "#6B7A8C" },
  { key: "projectSignalsActive", label: "Señales activas", accent: "#1A9BB0" },
  { key: "formationNew", label: "Formación nuevas", accent: "#0B2E59" },
  { key: "surfaceInterestNew", label: "Intereses pendientes", accent: "#DC2626" },
  { key: "exitFeedbackNew", label: "Feedback pendiente", accent: "#B45309" },
  { key: "userInboxNeedsReply", label: "Para responder", accent: "#C6D92D" },
  { key: "userInboxArchived", label: "Inbox archivado", accent: "#9AA8B8" },
  { key: "notificationsPending", label: "Notif. pendientes", accent: "#6B7A8C" },
  { key: "notificationsFailed", label: "Notif. con error", accent: "#DC2626" },
];

export function AdminSummaryCards({ counts }: { counts: ModerationSummaryCounts }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((card) => {
        const value = counts[card.key];
        const hot =
          value > 0 &&
          (card.key === "reportsNew" ||
            card.key === "humanReviewPending" ||
            card.key === "notificationsFailed" ||
            card.key === "surfaceInterestNew" ||
            card.key === "exitFeedbackNew");
        return (
          <div
            key={card.key}
            className={[
              "rounded-2xl border bg-white px-3 py-3 shadow-[0_4px_16px_rgba(15,42,70,0.06)]",
              hot ? "border-red-200 ring-1 ring-red-100" : "border-[#E8EEF3]",
            ].join(" ")}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B7A8C]">
              {card.label}
            </p>
            <p
              className="mt-1 text-2xl font-extrabold tabular-nums"
              style={{ color: value > 0 ? card.accent : "#CBD5E1" }}
            >
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
