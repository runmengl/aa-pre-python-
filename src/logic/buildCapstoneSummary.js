import { methodologyRules } from "../data/methodologyRules.js";
import { outputRiskRules } from "../data/outputRiskRules.js";

function normalizeMethodology(methodology) {
  if (typeof methodology === "string") {
    return methodology;
  }

  return (
    methodology?.selected_methodology ??
    methodology?.detected_methodology ??
    methodology?.methodology ??
    methodology?.id ??
    "unknown"
  );
}

function highestSeverity(failureModes) {
  const severityRank = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return failureModes.reduce(
    (highest, failureMode) =>
      severityRank[failureMode.severity] > severityRank[highest]
        ? failureMode.severity
        : highest,
    "low",
  );
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function buildCapstoneSummary({
  methodology = "unknown",
  outputType = "executive_summary",
  targetAudience = "public_administrators",
  failureModes = [],
} = {}) {
  const methodologyId = normalizeMethodology(methodology);
  const methodologyRule = methodologyRules[methodologyId];
  const outputRule = outputRiskRules[outputType];
  const riskPosture = failureModes.length === 0 ? "clear" : highestSeverity(failureModes);
  const topFailures = failureModes.slice(0, 3);
  const safeguards = unique(
    topFailures.flatMap((failureMode) => failureMode.safeguards ?? []),
  ).slice(0, 4);

  return {
    risk_posture: riskPosture,
    headline:
      failureModes.length === 0
        ? "No major methodology-consistency failures were detected."
        : `${topFailures.length} priority failure mode${topFailures.length === 1 ? "" : "s"} need review before use.`,
    talking_points: [
      methodologyRule
        ? `${methodologyRule.label} evidence supports ${methodologyRule.allowedInferenceTypes
            .slice(0, 2)
            .join(" and ")} when language stays within its inference limits.`
        : "The methodology should be selected before the output is treated as review-ready.",
      outputRule
        ? `${outputRule.label} has ${outputRule.riskLevel} output risk and should preserve visible safeguards.`
        : "The output type does not have configured publication safeguards.",
      `The generated output should be calibrated for ${targetAudience.replaceAll(
        "_",
        " ",
      )}.`,
      failureModes.length > 0
        ? `The main issue is ${topFailures[0].title.toLowerCase()}.`
        : "The current draft keeps evidence and claims broadly aligned.",
    ],
    reviewer_questions: [
      "Which claims would change if the methodology label changed?",
      "Which sentences require caveats before a decision-maker sees this output?",
      "Are causal and generalization claims supported by the source design?",
    ],
    recommended_next_steps:
      safeguards.length > 0
        ? safeguards
        : [
            "Keep methodology, evidence, and output-risk labels attached to the draft.",
            "Re-run the analyzer after adding new claims or removing caveats.",
          ],
  };
}
