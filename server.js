import express from "express";

const app = express();
const port = 3001;

app.use(express.json({ limit: "1mb" }));

app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
});

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function printKeyValues(title, values = {}) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));

  const entries = Object.entries(values);

  if (entries.length === 0) {
    console.log("  none");
    return;
  }

  entries.forEach(([key, value]) => {
    console.log(`  ${formatLabel(key)}: ${value}`);
  });
}

function printFailureModes(failureModes = []) {
  console.log("\nFailure Modes");
  console.log("-------------");

  if (!Array.isArray(failureModes) || failureModes.length === 0) {
    console.log("  none detected");
    return;
  }

  failureModes.forEach((failureMode, index) => {
    console.log(`  ${index + 1}. ${formatLabel(failureMode.failure_mode)}`);
    console.log(`     Risk: ${formatLabel(failureMode.risk_level)}`);
    console.log(`     Fix: ${failureMode.recommended_fix || "Review required."}`);
  });
}

function printGenerationLog(payload) {
  const timestamp = new Date().toISOString();

  console.log("\n============================================================");
  console.log("AI PLAYBOOK DOCUMENT GENERATION");
  console.log("============================================================");
  console.log(`Event: ${payload.event || "Generate Document"}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Methodology: ${formatLabel(payload.methodology)}`);
  console.log(`Output Type: ${formatLabel(payload.outputType)}`);
  console.log(`Target Audience: ${formatLabel(payload.targetAudience)}`);
  console.log(`Document: ${payload.generatedDocumentTitle || "Untitled document"}`);

  printKeyValues("Workflow Stages", payload.workflowTrace);
  printKeyValues("Fidelity Scores", payload.fidelityScores);
  printFailureModes(payload.failureModes);

  console.log("============================================================\n");
}

app.post("/api/log-generation", (request, response) => {
  printGenerationLog(request.body ?? {});
  response.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Local generation logging server running on http://localhost:${port}`);
});
