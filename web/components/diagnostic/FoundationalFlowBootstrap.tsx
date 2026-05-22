"use client";

import { useEffect } from "react";
import { syncPendingBrowserCasesToServer } from "@/lib/learning/clientCaseBackup";
import { getOrCreateUserId } from "@/lib/users/activeUserSession";

/** Sincroniza copias locales pendientes al entrar al flujo /full. */
export function FoundationalFlowBootstrap() {
  useEffect(() => {
    getOrCreateUserId();
    syncPendingBrowserCasesToServer().catch(() => {});
  }, []);

  return null;
}
