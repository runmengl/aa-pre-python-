import { methodologyRules } from "../data/methodologyRules.js";
import { outputRiskRules } from "../data/outputRiskRules.js";
import { buildCapstoneSummary } from "./buildCapstoneSummary.js";
import { detectFailureModes } from "./detectFailureModes.js";
import { detectMethodology } from "./detectMethodology.js";
import { extractEvidence } from "./extractEvidence.js";
import { generateOutput } from "./generateOutput.js";
import { scoreFidelity } from "./scoreFidelity.js";

const consistencyDimensions = [
  "claim_accuracy",
  "causal_precision",
  "scope_fidelity",
  "method_transparency",
  "nuance_preservation",
  "audience_calibration",
  "actionability",
];

function normalizeMethodology(value) {
  if (!value || value === "auto_detect") {
    return null;
  }

  return value;
}

function formatList(values) {
  return values.length > 0 ? values.join(", ") : "none detected";
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function fidelityScoreValue(value) {
  return Number.isFinite(Number(value?.score)) ? Number(value.score) : 0;
}

function averageFidelityScore(fidelityScores) {
  const values = consistencyDimensions
    .map((dimension) => fidelityScoreValue(fidelityScores?.[dimension]))
    .filter((value) => value > 0);

  if (values.length === 0) {
    return 0;
  }

  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10;
}

function scoreBand(score) {
  if (score >= 4.5) {
    return "excellent";
  }

  if (score >= 3.5) {
    return "strong";
  }

  if (score >= 2.5) {
    return "acceptable";
  }

  if (score >= 1.5) {
    return "low";
  }

  return "very low";
}

function sentenceFallback(text) {
  return (
    String(text ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .match(/[^.!?]+(?:[.!?]+|$)/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean)
      .slice(0, 3) ?? []
  );
}

function buildWorkflowTrace({
  text,
  detected,
  selectedMethodology,
  selectedRule,
  outputType,
  outputRule,
  evidenceSummary,
  failureModes,
  fidelityScores,
}) {
  const hasText = evidenceSummary.summary.has_text;
  const methodologyLabel = selectedRule?.label ?? selectedMethodology;
  const outputLabel = outputRule?.label ?? outputType;

  return {
    stage_1_input_validation: hasText
      ? `Input accepted with ${evidenceSummary.word_count} words across ${evidenceSummary.sentence_count} sentences.`
      : "No research text was provided.",
    stage_2_methodology_classification:
      selectedMethodology === detected.detected_methodology
        ? `Methodology resolved as ${methodologyLabel} from text signals.`
        : `Methodology reviewed as ${methodologyLabel}; auto-detection suggested ${detected.detected_methodology}.`,
    stage_3_evidence_extraction: `${evidenceSummary.evidence_sentences.length} evidence-bearing sentence(s), ${evidenceSummary.numeric_claims.length} numeric claim(s), and ${evidenceSummary.causal_claims.length} possible causal claim(s) were found.`,
    stage_4_epistemological_interpretation: selectedRule
      ? `${selectedRule.label} permits ${formatList(selectedRule.allowedInferenceTypes)} and restricts ${formatList(selectedRule.forbiddenInferenceTypes)}.`
      : "No configured methodology rule matched the text.",
    stage_5_output_risk_assessment: outputRule
      ? `${outputLabel} has ${outputRule.riskLevel} output risk; safeguards should remain visible in the draft.`
      : "The selected output type does not have a configured risk profile.",
    stage_6_fidelity_check: `Fidelity review completed on a 1-5 scale with an average score of ${averageFidelityScore(fidelityScores)}/5 (${scoreBand(averageFidelityScore(fidelityScores))}).`,
    stage_7_consistency_analysis: `Cross-method consistency was reviewed across ${consistencyDimensions.length} dimensions.`,
    stage_8_failure_mode_detection: `${failureModes.length} failure mode(s) were detected for this input.`,
  };
}

function buildEvidenceSummary(evidenceSummary, text) {
  const mainClaims = unique(evidenceSummary.evidence_sentences).slice(0, 5);
  const limitations = unique(
    evidenceSummary.limitation_signals.map((signal) => signal.sentence),
  ).slice(0, 5);
  const scopeConditions = unique(
    [
      ...evidenceSummary.method_signals.map((signal) => signal.sentence),
      ...limitations,
    ],
  ).slice(0, 5);
  const missingInformation = [];

  if (!evidenceSummary.summary.has_text) {
    missingInformation.push("Research text is missing.");
  }

  if (!evidenceSummary.summary.has_method_detail) {
    missingInformation.push("Method details are not explicit enough to audit.");
  }

  if (!evidenceSummary.summary.has_limitations) {
    missingInformation.push("Limitations, scope, or caveats are not visible.");
  }

  if (!evidenceSummary.summary.has_numeric_evidence) {
    missingInformation.push("No numeric evidence was found.");
  }

  return {
    main_claims: mainClaims.length > 0 ? mainClaims : sentenceFallback(text),
    possible_causal_claims: unique(
      evidenceSummary.causal_claims.map((claim) => claim.sentence),
    ).slice(0, 5),
    limitations_found: limitations,
    scope_conditions_found: scopeConditions,
    missing_information: missingInformation,
  };
}

function hasFailure(failureModes, id) {
  return failureModes.some((failureMode) => failureMode.id === id);
}

function buildCrossMethodConsistencyFindings({
  evidenceSummary,
  failureModes,
  selectedRule,
  outputRule,
}) {
  return {
    claim_accuracy: selectedRule
      ? `Claims were checked against ${selectedRule.label} inference permissions.`
      : "Methodology could not be resolved, so claim accuracy needs manual review.",
    causal_precision: hasFailure(failureModes, "unsupported_causal_language")
      ? "Causal language may exceed what the methodology supports."
      : "Causal language is either bounded or not prominent in the text.",
    scope_fidelity: hasFailure(failureModes, "overgeneralized_language")
      ? "Some language may overgeneralize beyond the available evidence."
      : "Scope language appears bounded by the visible evidence.",
    method_transparency: evidenceSummary.summary.has_method_detail
      ? "The text includes visible method or source details."
      : "The text needs clearer method, sample, design, or source details.",
    nuance_preservation: evidenceSummary.summary.has_limitations
      ? "Limitations or caveats are visible in the text."
      : "The output should preserve more caveats before classroom use.",
    audience_calibration: outputRule
      ? `${outputRule.label} risk is ${outputRule.riskLevel}; language should stay calibrated to that audience.`
      : "Output audience risk could not be assessed from the selected output type.",
    actionability: hasFailure(failureModes, "unsupported_recommendation")
      ? "Action language needs stronger evidence support."
      : "Recommendations appear reviewable as long as safeguards remain visible.",
  };
}

function finalFidelityScores(fidelityScores) {
  return Object.fromEntries(
    consistencyDimensions.map((dimension) => [dimension, fidelityScores[dimension]]),
  );
}

function buildOutputRiskNote({ outputType, outputRule, selectedMethodology }) {
  const outputLabel = outputRule?.label ?? outputType;
  const methodologyLabel = selectedMethodology.replaceAll("_", " ");

  if (outputType === "mechanism_map") {
    return {
      detected_methodology: selectedMethodology,
      output_type: outputType,
      risk_level: "very high",
      why_this_combination_matters:
        "Mechanism Map is very high risk for theoretical, qualitative, and review-based evidence because it can imply unsupported causal pathways.",
    };
  }

  if (
    outputType === "technical_note" &&
    ["qualitative", "theoretical", "systematic_review", "meta_analysis"].includes(
      selectedMethodology,
    )
  ) {
    return {
      detected_methodology: selectedMethodology,
      output_type: outputType,
      risk_level: "high",
      why_this_combination_matters: `${outputLabel} can make ${methodologyLabel} evidence look more technically precise than the source supports.`,
    };
  }

  if (outputType === "linkedin_post") {
    return {
      detected_methodology: selectedMethodology,
      output_type: outputType,
      risk_level: "high persuasive",
      why_this_combination_matters:
        "Persuasive public-facing formats can compress caveats and make findings sound more certain than the method supports.",
    };
  }

  return {
    detected_methodology: selectedMethodology,
    output_type: outputType,
    risk_level: outputRule?.riskLevel ?? "not configured",
    why_this_combination_matters: outputRule
      ? `${outputLabel} outputs should keep claims calibrated to ${methodologyLabel} inference limits.`
      : "This output type does not have a configured risk profile.",
  };
}

function buildFailureModes(failureModes) {
  return failureModes.map((failureMode) => ({
    failure_mode: failureMode.id ?? "review_required",
    risk_level: failureMode.severity ?? "medium",
    evidence_from_text: (failureMode.evidence ?? []).join(" | "),
    why_it_matters: failureMode.rationale ?? failureMode.title ?? "",
    recommended_fix:
      failureMode.safeguards?.[0] ??
      "Revise the output so the claim is directly supported by the evidence.",
  }));
}

function buildCapstoneText(capstoneSummary, failureModes, targetAudience) {
  if (!capstoneSummary) {
    return "Run an analysis to generate Capstone talking points.";
  }

  const talkingPoints = capstoneSummary.talking_points ?? [];
  const nextSteps = capstoneSummary.recommended_next_steps ?? [];
  const failureNote =
    failureModes.length > 0
      ? `Priority review item: ${failureModes[0].failure_mode}.`
      : "No priority failure mode was detected.";

  return [
    capstoneSummary.headline,
    ...talkingPoints,
    `Target audience: ${targetAudience.replaceAll("_", " ")}.`,
    failureNote,
    nextSteps.length > 0 ? `Recommended next step: ${nextSteps[0]}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function analyzeText(input = {}) {
  const params = typeof input === "string" ? { text: input } : input;
  const text = params?.text ?? "";
  const expectedMethodology = normalizeMethodology(params?.expectedMethodology);
  const outputType = params?.outputType ?? "executive_summary";
  const targetAudience = params?.targetAudience ?? "public_administrators";
  const detected = detectMethodology(text);
  const selectedMethodology =
    expectedMethodology && methodologyRules[expectedMethodology]
      ? expectedMethodology
      : detected.detected_methodology;
  const selectedRule = methodologyRules[selectedMethodology];
  const outputRule = outputRiskRules[outputType];
  const evidenceSummaryRaw = extractEvidence(text);
  const failureModesRaw = detectFailureModes({
    text,
    methodology: selectedMethodology,
    outputType,
    evidenceSummary: evidenceSummaryRaw,
  });
  const fidelityScoresRaw = scoreFidelity({
    evidenceSummary: evidenceSummaryRaw,
    failureModes: failureModesRaw,
    methodology: selectedMethodology,
    outputType,
    targetAudience,
  });
  const failureModes = buildFailureModes(failureModesRaw);
  const evidenceSummary = buildEvidenceSummary(evidenceSummaryRaw, text);
  const capstoneSummaryRaw = buildCapstoneSummary({
    methodology: selectedMethodology,
    outputType,
    targetAudience,
    failureModes: failureModesRaw,
  });
  const generatedOutputText = generateOutput({
    text,
    methodology: selectedMethodology,
    outputType,
    targetAudience,
    evidenceSummary,
    failureModes,
  });

  return {
    workflow_trace: buildWorkflowTrace({
      text,
      detected,
      selectedMethodology,
      selectedRule,
      outputType,
      outputRule,
      evidenceSummary: evidenceSummaryRaw,
      failureModes: failureModesRaw,
      fidelityScores: fidelityScoresRaw,
    }),

    methodology_profile: {
      detected_methodology: selectedMethodology,
      allowed_inference_types: selectedRule?.allowedInferenceTypes ?? [],
      forbidden_inference_types: selectedRule?.forbiddenInferenceTypes ?? [],
      causal_permission_level: selectedRule?.causalPermissionLevel ?? "",
      generalizability_level: selectedRule?.generalizabilityLevel ?? "",
      recommended_language_controls:
        selectedRule?.recommendedLanguageControls ?? [],
    },

    evidence_summary: evidenceSummary,

    cross_method_consistency_findings: buildCrossMethodConsistencyFindings({
      evidenceSummary: evidenceSummaryRaw,
      failureModes: failureModesRaw,
      selectedRule,
      outputRule,
    }),

    failure_modes: failureModes,

    fidelity_scores: finalFidelityScores(fidelityScoresRaw),

    fidelity_risk_note: buildOutputRiskNote({
      outputType,
      outputRule,
      selectedMethodology,
    }),

    capstone_summary: buildCapstoneText(
      capstoneSummaryRaw,
      failureModes,
      targetAudience,
    ),

    generated_output: {
      output_type: outputType,
      target_audience: targetAudience,
      methodology: selectedMethodology,
      text: generatedOutputText,
    },

    generated_document: null,
  };
}
