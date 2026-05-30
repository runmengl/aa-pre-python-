import { methodologyRules } from "../data/methodologyRules.js";
import { outputRiskRules } from "../data/outputRiskRules.js";
import { extractEvidence } from "./extractEvidence.js";

const lowCausalPermissionLevels = new Set([
  "exploratory",
  "hypothetical",
  "limited",
  "inherits-from-included-studies",
  "evidence-base-dependent",
]);

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

function normalizeOutputType(outputType) {
  return outputType || "executive_summary";
}

function strongCausalClaims(evidenceSummary, methodologyId) {
  const claims =
    evidenceSummary?.causal_claims?.filter((claim) => claim.strength === "strong") ??
    [];

  if (methodologyId === "meta_analysis") {
    return claims.filter((claim) =>
      claim.matches.some((match) => !["effect on", "effects on"].includes(match)),
    );
  }

  return claims;
}

function hasStrongCausalClaim(evidenceSummary, methodologyId) {
  return strongCausalClaims(evidenceSummary, methodologyId).length > 0;
}

function hasCausalDisclaimer(evidenceSummary) {
  return (
    evidenceSummary?.limitation_signals?.some((signal) =>
      signal.matches.some((match) =>
        ["does not establish", "should not", "cannot", "not be treated"].includes(match),
      ),
    ) ?? false
  );
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function makeFailureMode({
  id,
  title,
  severity,
  rationale,
  evidence = [],
  safeguards = [],
}) {
  return {
    id,
    title,
    severity,
    rationale,
    evidence: unique(evidence).slice(0, 3),
    safeguards: unique(safeguards).slice(0, 5),
  };
}

function addFailureMode(failureModes, failureMode) {
  if (!failureModes.some((item) => item.id === failureMode.id)) {
    failureModes.push(failureMode);
  }
}

export function detectFailureModes({
  text = "",
  methodology = "unknown",
  outputType = "executive_summary",
  evidenceSummary,
} = {}) {
  const summary = evidenceSummary ?? extractEvidence(text);
  const methodologyId = normalizeMethodology(methodology);
  const outputTypeId = normalizeOutputType(outputType);
  const methodologyRule = methodologyRules[methodologyId];
  const outputRule = outputRiskRules[outputTypeId];
  const failureModes = [];
  const methodologySafeguards = methodologyRule?.recommendedLanguageControls ?? [];
  const outputSafeguards = outputRule?.safeguards ?? [];
  const safeguards = [...methodologySafeguards, ...outputSafeguards];
  const lowerText = String(text ?? "").toLowerCase();

  if (!summary.summary?.has_text) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "missing_input",
        title: "Missing input text",
        severity: "high",
        rationale: "No analyzable text was provided.",
        safeguards: ["Add the source text before reviewing methodology fidelity."],
      }),
    );

    return failureModes;
  }

  if (!methodologyRule) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "unknown_methodology",
        title: "Unknown methodology",
        severity: "medium",
        rationale:
          "The selected or detected methodology does not match a configured rule set.",
        safeguards: ["Choose a supported methodology before scoring inference fidelity."],
      }),
    );
  }

  if (
    methodologyRule &&
    hasStrongCausalClaim(summary, methodologyId) &&
    lowCausalPermissionLevels.has(methodologyRule.causalPermissionLevel) &&
    !hasCausalDisclaimer(summary)
  ) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "unsupported_causal_language",
        title: "Unsupported causal language",
        severity: "high",
        rationale: `${methodologyRule.label} evidence does not support unqualified causal claims at this permission level.`,
        evidence: strongCausalClaims(summary, methodologyId).map(
          (claim) => claim.sentence,
        ),
        safeguards,
      }),
    );
  }

  if (
    methodologyId === "experimental" &&
    hasStrongCausalClaim(summary, methodologyId) &&
    !summary.method_signals.some((signal) =>
      signal.matches.some((match) =>
        ["randomized", "randomised", "assigned", "control group", "treatment group"].includes(
          match,
        ),
      ),
    )
  ) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "causal_design_not_visible",
        title: "Causal design is not visible",
        severity: "medium",
        rationale:
          "Experimental causal language should remain tied to assignment, comparison, and measurement details.",
        evidence: summary.causal_claims.map((claim) => claim.sentence),
        safeguards,
      }),
    );
  }

  if (summary.generalization_signals.length > 0) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "overgeneralized_language",
        title: "Overgeneralized language",
        severity: "medium",
        rationale:
          "The text uses broad language that may exceed the methodology's generalizability level.",
        evidence: summary.generalization_signals.map((signal) => signal.sentence),
        safeguards,
      }),
    );
  }

  if (
    outputRule &&
    ["high", "medium-high"].includes(outputRule.riskLevel) &&
    !summary.summary?.has_limitations
  ) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "missing_high_stakes_caveat",
        title: "Missing high-stakes caveat",
        severity: "medium",
        rationale: `${outputRule.label} outputs need visible uncertainty, scope, or implementation caveats.`,
        safeguards: outputSafeguards,
      }),
    );
  }

  if (
    methodologyId !== "theoretical" &&
    summary.sentence_count > 1 &&
    !summary.summary?.has_method_detail
  ) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "thin_method_detail",
        title: "Thin method detail",
        severity: "medium",
        rationale:
          "The text makes evidence-facing claims without enough visible method detail to audit the source.",
        safeguards: [
          "Add sample, design, data source, or synthesis details next to the claim.",
          ...safeguards,
        ],
      }),
    );
  }

  if (methodologyId === "qualitative" && summary.numeric_claims.length > 0) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "qualitative_quantification_overreach",
        title: "Qualitative quantification overreach",
        severity: "medium",
        rationale:
          "Qualitative evidence can report counts within the coded sample, but it should not imply population prevalence.",
        evidence: summary.numeric_claims.map((claim) => claim.sentence),
        safeguards,
      }),
    );
  }

  if (
    methodologyId === "theoretical" &&
    (summary.numeric_claims.length > 0 || lowerText.includes("found that"))
  ) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "theory_presented_as_empirical",
        title: "Theory presented as empirical evidence",
        severity: "high",
        rationale:
          "Theoretical work should keep conceptual propositions separate from empirical findings.",
        evidence: [
          ...summary.numeric_claims.map((claim) => claim.sentence),
          lowerText.includes("found that") ? "The text uses empirical finding language." : "",
        ],
        safeguards,
      }),
    );
  }

  if (
    methodologyId === "systematic_review" &&
    (lowerText.includes("pooled estimate") ||
      lowerText.includes("pooled effect") ||
      lowerText.includes("effect size")) &&
    !lowerText.includes("should not be framed as a pooled estimate") &&
    !lowerText.includes("unless formal meta-analysis") &&
    !lowerText.includes("without meta-analysis")
  ) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "systematic_review_as_meta_analysis",
        title: "Systematic review framed as meta-analysis",
        severity: "medium",
        rationale:
          "A systematic review should not claim pooled estimates unless formal meta-analysis was performed.",
        safeguards,
      }),
    );
  }

  if (
    methodologyId === "meta_analysis" &&
    !lowerText.includes("heterogeneity") &&
    !lowerText.includes("publication bias") &&
    !summary.summary?.has_limitations
  ) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "meta_analysis_synthesis_caveat_gap",
        title: "Meta-analysis caveat gap",
        severity: "medium",
        rationale:
          "Meta-analytic outputs should surface heterogeneity, study quality, or publication-bias limits.",
        safeguards,
      }),
    );
  }

  if (outputTypeId === "mechanism_map" && !summary.summary?.has_causal_language) {
    addFailureMode(
      failureModes,
      makeFailureMode({
        id: "mechanism_invention",
        title: "Mechanism invention risk",
        severity: "medium",
        rationale:
          "A mechanism map can imply causal pathways, but the source text does not include visible causal evidence.",
        evidence: summary.evidence_sentences.slice(0, 2),
        safeguards: [
          "Label mechanisms as possible or hypothesized unless causal evidence is explicit.",
          ...safeguards,
        ],
      }),
    );
  }

  return failureModes;
}
