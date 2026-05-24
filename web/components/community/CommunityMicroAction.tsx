"use client";

import { useCallback, useEffect, useState } from "react";
import { postCommunityEvent } from "@/lib/community/communityClient";
import { INTEREST_REGISTERED_TOAST } from "@/lib/content/communityInboxCopy";

type CircleProps = {
  kind: "circle";
  circleId: string;
  circleTitle: string;
  mode: "saved" | "interested" | "notify";
  label?: string;
  registeredLabel?: string;
};

type ProjectProps = {
  kind: "project";
  projectId: string;
  projectTitle: string;
  mode: "interest" | "observe" | "join";
  label?: string;
  registeredLabel?: string;
};

type EventProps = {
  kind: "formation_or_event";
  targetId: string;
  targetTitle: string;
  targetKind: "formation" | "event";
  notifySimilar?: boolean;
  savedRoute?: boolean;
  label?: string;
  registeredLabel?: string;
};

type Props = (CircleProps | ProjectProps | EventProps) & {
  variant?: "primary" | "secondary";
  className?: string;
};

const STORAGE_PREFIX = "vu_community_registered:";

function storageKey(props: Props): string {
  if (props.kind === "circle") {
    return `${STORAGE_PREFIX}circle_${props.mode}:${props.circleId}`;
  }
  if (props.kind === "project") {
    return `${STORAGE_PREFIX}project_${props.mode}:${props.projectId}`;
  }
  return `${STORAGE_PREFIX}${props.targetKind}:${props.targetId}${props.notifySimilar ? ":notify" : ""}`;
}

function defaultLabels(props: Props): { label: string; registered: string } {
  if (props.kind === "circle") {
    if (props.mode === "saved") {
      return { label: "Guardar círculo", registered: "Guardado" };
    }
    if (props.mode === "notify") {
      return {
        label: "Avisarme cuando se mueva",
        registered: "Aviso registrado",
      };
    }
    return { label: "Me interesa este espacio", registered: "Interés registrado" };
  }
  if (props.kind === "project") {
    const map = {
      interest: { label: "Me interesa", registered: "Interés registrado" },
      observe: { label: "Quiero observar", registered: "Observación registrada" },
      join: { label: "Quiero sumarme", registered: "Interés registrado" },
    };
    return map[props.mode];
  }
  if (props.savedRoute) {
    return { label: "Guardar ruta", registered: "Ruta guardada" };
  }
  if (props.notifySimilar) {
    return {
      label: "Avisarme si aparece algo parecido",
      registered: "Aviso registrado",
    };
  }
  return { label: "Me interesa", registered: "Interés registrado" };
}

export function CommunityMicroAction(props: Props) {
  const { variant = "secondary", className = "" } = props;
  const labels = defaultLabels(props);
  const label = props.label ?? labels.label;
  const registeredLabel = props.registeredLabel ?? labels.registered;
  const key = storageKey(props);

  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setRegistered(sessionStorage.getItem(key) === "1");
  }, [key]);

  const handleClick = useCallback(async () => {
    if (registered || loading) return;
    setLoading(true);
    setFeedback("");

    try {
      let ok = false;
      if (props.kind === "circle") {
        const res = await postCommunityEvent({
          event: "circle_interest",
          circleId: props.circleId,
          circleTitle: props.circleTitle,
          mode: props.mode,
        });
        ok = res.ok;
      } else if (props.kind === "project") {
        const res = await postCommunityEvent({
          event: "project_interest",
          projectId: props.projectId,
          projectTitle: props.projectTitle,
          mode: props.mode,
        });
        ok = res.ok;
      } else {
        const res = await postCommunityEvent({
          event: "formation_or_event_interest",
          targetId: props.targetId,
          targetTitle: props.targetTitle,
          targetKind: props.targetKind,
          notifySimilar: props.notifySimilar,
          savedRoute: props.savedRoute,
        });
        ok = res.ok;
      }

      if (ok) {
        sessionStorage.setItem(key, "1");
        setRegistered(true);
        setFeedback(INTEREST_REGISTERED_TOAST);
      }
    } finally {
      setLoading(false);
    }
  }, [props, registered, loading, key]);

  const base =
    variant === "primary"
      ? "bg-[#C6D92D] text-[#0B2E59] hover:bg-[#b3c428]"
      : "border border-[#E8EEF3] bg-white text-[#0B2E59] hover:bg-[#F8FAFC]";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={registered || loading}
        className={[
          "vu-focus inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl px-4 text-sm font-semibold transition-colors disabled:opacity-70",
          registered ? "bg-[#E6F6FA] text-[#0B2E59] ring-1 ring-[#1A9BB0]/30" : base,
        ].join(" ")}
      >
        {loading ? "Registrando…" : registered ? registeredLabel : label}
      </button>
      {feedback ? (
        <p className="mt-2 text-[12px] leading-relaxed text-[#6B7A8C]">{feedback}</p>
      ) : null}
    </div>
  );
}
