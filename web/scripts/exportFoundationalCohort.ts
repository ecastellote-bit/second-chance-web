/**
 * Exporta casos del batch fundacional para revisión humana y entrenamiento de jueces.
 * Uso: npm run cohort:export [-- cohort_id]
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_FOUNDATIONAL_COHORT,
  getCohortBatchFromPayload,
} from "../lib/learning/foundationalCohort";
import { listHumanCompleteCases, listHumanLearningExtracts } from "../lib/learning/humanCaseDepot";
import { listHumanCaseJourneyEvents } from "../lib/learning/humanCaseJourney";
import { listFounderProjectSeeds } from "../lib/learning/founderProjectSeeds";

async function main() {
  const cohortId = process.argv[2]?.trim() || DEFAULT_FOUNDATIONAL_COHORT;
  const complete = await listHumanCompleteCases(500);
  const extracts = await listHumanLearningExtracts(500);
  const journey = await listHumanCaseJourneyEvents(500);
  const allSeeds = await listFounderProjectSeeds(500);

  const cohortCases = complete.filter(
    (item) => getCohortBatchFromPayload(item.payload) === cohortId,
  );

  const archiveIds = new Set(cohortCases.map((c) => c.archiveId));
  const cohortExtracts = extracts.filter((e) => archiveIds.has(e.archiveId));
  const cohortJourney = journey.filter(
    (e) => e.cohortBatch === cohortId || archiveIds.has(e.archiveId),
  );
  const cohortSeeds = allSeeds.filter((s) => s.cohortBatch === cohortId);

  const outDir = path.join(process.cwd(), "data", "exports");
  await mkdir(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const outPath = path.join(outDir, `foundational-${cohortId}-${stamp}.json`);

  const bundle = {
    exportedAt: new Date().toISOString(),
    cohortBatch: cohortId,
    summary: {
      completeCases: cohortCases.length,
      learningExtracts: cohortExtracts.length,
      journeyEvents: cohortJourney.length,
      projectSeeds: cohortSeeds.length,
      pendingReview: cohortCases.filter(
        (c) => c.storagePolicy.reviewStatus === "pending_human_review",
      ).length,
    },
    completeCases: cohortCases,
    learningExtracts: cohortExtracts,
    journeyEvents: cohortJourney,
    projectSeeds: cohortSeeds,
  };

  await writeFile(outPath, JSON.stringify(bundle, null, 2), "utf8");
  console.log(`Exported ${cohortCases.length} cases → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
