import { execSync } from "node:child_process";

const BASE_SHA = process.env.BASE_SHA || "";
const HEAD_SHA = process.env.HEAD_SHA || "";
const PR_BRANCH = (process.env.PR_BRANCH || "").trim();
const PR_BODY = process.env.PR_BODY || "";

const PROTECTED_PATH_RULES = [
  { type: "prefix", value: "functions/" },
  { type: "prefix", value: "cloudflare/" },
  { type: "prefix", value: "src/app/data/" },
  { type: "prefix", value: "src/data/" },
  { type: "exact", value: "src/app/components/CouncilAdminGate.tsx" },
  { type: "exact", value: "src/app/components/MainLayout.tsx" },
  { type: "exact", value: "src/app/pages/CouncilAdminPage.tsx" },
  { type: "exact", value: "src/app/pages/CouncilCompliancePage.tsx" },
  { type: "exact", value: "src/app/pages/CouncilContentManagerPage.tsx" },
  { type: "exact", value: "src/app/routes.tsx" },
  { type: "exact", value: ".github/workflows/portal-refresh.yml" },
  { type: "exact", value: "scripts/sync_sheets.mjs" },
  { type: "exact", value: "package.json" },
  { type: "exact", value: "package-lock.json" },
];

function parseLabels(json) {
  if (!json) return [];
  try {
    const raw = JSON.parse(json);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => String(item?.name || "").trim().toLowerCase())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const labels = parseLabels(process.env.PR_LABELS_JSON || "[]");
const hasLabel = (name) => labels.includes(name.toLowerCase());
const isFigmaSyncPR = PR_BRANCH.startsWith("figma/") || hasLabel("figma-sync");
const allowCoreChanges = hasLabel("allow-core-changes") || /\[allow-core-changes\]/i.test(PR_BODY);

function isProtectedPath(filePath) {
  for (const rule of PROTECTED_PATH_RULES) {
    if (rule.type === "exact" && filePath === rule.value) return true;
    if (rule.type === "prefix" && filePath.startsWith(rule.value)) return true;
  }
  return false;
}

function parseDiffRows(text) {
  const rows = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return rows.flatMap((line) => {
    const parts = line.split("\t");
    const status = parts[0] || "";

    // Rename/copy has 2 paths (old + new).
    if (status.startsWith("R") || status.startsWith("C")) {
      return [
        { status, path: parts[1] || "" },
        { status, path: parts[2] || "" },
      ].filter((entry) => entry.path);
    }

    return [{ status, path: parts[1] || "" }].filter((entry) => entry.path);
  });
}

function getChangedFiles() {
  if (!BASE_SHA || !HEAD_SHA) {
    throw new Error("BASE_SHA and HEAD_SHA are required.");
  }

  const output = execSync(`git diff --name-status ${BASE_SHA}...${HEAD_SHA}`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return parseDiffRows(output);
}

function main() {
  if (!isFigmaSyncPR) {
    console.log("Figma sync guard: not a figma PR. Skipping.");
    process.exit(0);
  }

  const changes = getChangedFiles();
  const protectedChanges = changes.filter((entry) => isProtectedPath(entry.path));
  const protectedDeletions = protectedChanges.filter((entry) => entry.status === "D");

  if (protectedDeletions.length > 0) {
    console.error("Blocked: protected core files cannot be deleted in Figma sync PRs.");
    for (const entry of protectedDeletions) {
      console.error(`- ${entry.path}`);
    }
    process.exit(1);
  }

  if (protectedChanges.length > 0 && !allowCoreChanges) {
    console.error("Blocked: this Figma sync PR changes protected core files.");
    console.error("Add label `allow-core-changes` only when core edits are intentional.");
    for (const entry of protectedChanges) {
      console.error(`- [${entry.status}] ${entry.path}`);
    }
    process.exit(1);
  }

  if (protectedChanges.length > 0 && allowCoreChanges) {
    console.log("Warning: protected core files changed, override accepted (`allow-core-changes`).");
    for (const entry of protectedChanges) {
      console.log(`- [${entry.status}] ${entry.path}`);
    }
  } else {
    console.log("Figma sync guard passed: no protected core file changes.");
  }
}

main();
