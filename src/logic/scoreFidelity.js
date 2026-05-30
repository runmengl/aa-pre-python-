import { methodologyRules } from "../data/methodologyRules.js";

const severityPenalties = {
  low: 5,
  medium: 12,
  high: 24,
  critical: 36,
};

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

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreBand(score) {
  if (score >= 85) {
    return "strong";
  }

  if (score >= 70) {
    return "workable";
  }

  if (score >= 50) {
    return "needs_review";
  }

  return "high_risk";
}

function totalPenalty(failureModes) {
  return failureModes.reduce(
    (total, failureMode) => total + (severityPenalties[failureMode.severity] ?? 8),
    0,
  );
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

export function scoreFidelity({
  evidenceSummary,
  failureModes = [],
  methodology = "unknown",
} = {}) {
  const methodologyId = normalizeMethodology(methodology);
  const methodologyRule = methodologyRules[methodologyId];
  const penalty = totalPenalty(failureModes);
  const summary = evidenceSummary?.summary ?? {};
  const evidenceDensity = evidenceSummary?.evidence_density ?? 0;

  const methodologyAlignment = clampScore(
    100 - penalty - (methodologyRule ? 0 : 18),
  );
  const evidenceGrounding = clampScore(
    (summary.has_text ? 25 : 0) +
      evidenceDensity * 35 +
      (summary.has_method_detail ? 18 : 0) +
      (summary.has_numeric_evidence ? 10 : 0) +
      (summary.has_limitations ? 12 : 0),
  );
  const languageDiscipline = clampScore(
    100 -
      failureModes
        .filter((failureMode) =>
          [
            "unsupported_causal_language",
            "overgeneralized_language",
            "theory_presented_as_empirical",
            "qualitative_quantification_overreach",
          ].includes(failureMode.id),
        )
        .reduce(
          (total, failureMode) => total + (severityPenalties[failureMode.severity] ?? 8),
          0,
        ),
  );
  const outputReadiness = clampScore(100 - Math.round(penalty * 0.8));
  const overall = clampScore(
    methodologyAlignment * 0.35 +
      evidenceGrounding * 0.25 +
      languageDiscipline * 0.25 +
      outputReadiness * 0.15,
  );

  return {
    overall,
    band: scoreBand(overall),
    dimensions: {
      methodology_alignment: {
        score: methodologyAlignment,
        rationale: methodologyRule
          ? `Scored against ${methodologyRule.label} inference rules.`
          : "No configured methodology rules were available.",
      },
      evidence_grounding: {
        score: evidenceGrounding,
        rationale:
          "Based on visible method detail, numeric evidence, caveats, and evidence density.",
      },
      language_discipline: {
        score: languageDiscipline,
        rationale:
          "Penalizes causal, generalization, and empirical-certainty language that exceeds the method.",
      },
      output_readiness: {
        score: outputReadiness,
        rationale: "Reflects remaining unresolved failure modes before publication or review.",
      },
    },
    penalties: failureModes.map((failureMode) => ({
      id: failureMode.id,
      severity: failureMode.severity,
      penalty: severityPenalties[failureMode.severity] ?? 8,
    })),
    recommendations: unique(
      failureModes.flatMap((failureMode) => failureMode.safeguards ?? []),
    ).slice(0, 6),
  };
}
