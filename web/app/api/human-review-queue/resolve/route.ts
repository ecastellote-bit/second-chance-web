import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiAuth } from "@/lib/security/requireAdminApiAuth";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const QUEUE_DIR = path.join(process.cwd(), "data", "human-review");
const QUEUE_FILE = path.join(QUEUE_DIR, "pending-reviews.jsonl");

export async function POST(req: NextRequest) {
  const authError = requireAdminApiAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { caseId, resolution, note, convertToLearnedCase } = body as {
      caseId: string;
      resolution: "resolved" | "dismissed";
      note?: string;
      convertToLearnedCase?: boolean;
    };

    if (!caseId || !resolution) {
      return NextResponse.json(
        { ok: false, error: "caseId and resolution are required" },
        { status: 400 },
      );
    }

    await mkdir(QUEUE_DIR, { recursive: true });

    if (!existsSync(QUEUE_FILE)) {
      return NextResponse.json(
        { ok: false, error: "No queue file exists" },
        { status: 404 },
      );
    }

    const raw = await readFile(QUEUE_FILE, "utf8");
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);

    const updated = lines.map((line) => {
      try {
        const record = JSON.parse(line);
        if (record.caseId === caseId && record.status === "pending") {
          return JSON.stringify({
            ...record,
            status: resolution,
            resolvedAt: new Date().toISOString(),
            resolutionNote: note ?? null,
            convertToLearnedCase: convertToLearnedCase ?? false,
          });
        }
        return line;
      } catch {
        return line;
      }
    });

    await writeFile(QUEUE_FILE, updated.join("\n") + "\n", "utf8");

    return NextResponse.json({
      ok: true,
      caseId,
      resolution,
      convertToLearnedCase: convertToLearnedCase ?? false,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
