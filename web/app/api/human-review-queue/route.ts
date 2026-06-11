import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireAdminApiAuth } from "@/lib/security/requireAdminApiAuth";
import { mkdir, appendFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { HumanReviewPayload } from "@/lib/engines/humanReviewTrigger";

const QUEUE_DIR = path.join(process.cwd(), "data", "human-review");
const QUEUE_FILE = path.join(QUEUE_DIR, "pending-reviews.jsonl");

async function ensureDir() {
  await mkdir(QUEUE_DIR, { recursive: true });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as HumanReviewPayload;

    await ensureDir();

    const record = {
      ...payload,
      queuedAt: new Date().toISOString(),
      status: "pending",
    };

    await appendFile(QUEUE_FILE, `${JSON.stringify(record)}\n`, "utf8");

    // TODO: Connect email service here (Resend, SendGrid, etc.)
    // await sendReviewNotification(payload);

    return NextResponse.json({
      ok: true,
      queued: true,
      urgency: payload.triggerResult.urgency,
      reasons: payload.triggerResult.reasons,
      message: "Case queued for human review",
    });
  } catch (error) {
    console.error("human-review-queue failed:", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const authError = requireAdminApiAuth(req);
  if (authError) return authError;

  try {
    await ensureDir();

    if (!existsSync(QUEUE_FILE)) {
      return NextResponse.json({ ok: true, cases: [], total: 0 });
    }

    const raw = await readFile(QUEUE_FILE, "utf8");
    const lines = raw.split("\n").filter((l) => l.trim().length > 0);

    const cases = lines.map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);

    const pending = cases.filter((c: any) => c.status === "pending");

    return NextResponse.json({
      ok: true,
      cases: pending,
      total: cases.length,
      pending: pending.length,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}
