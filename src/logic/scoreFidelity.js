import { methodologyRules } from "../data/methodologyRules.js";

const dimensionAnchors = {
  claim_accuracy: {
    5: "5 = all output claims are grounded in the input text.",
    4: "4 = mostly grounded, with only minor inference added.",
    3: "3 = generally aligned but includes some unsupported interpretation.",
    2: "2 = important claims are weakly supported.",
    1: "1 = major fabricated or contradicted claims.",
  },
  causal_precision: {
    5: "5 = causal language is fully supported by the methodology.",
    4: "4 = mostly cautious, with minor causal looseness.",
    3: "3 = acceptable but includes some causal ambiguity.",
    2: "2 = causal claims exceed methodology limits.",
    1: "1 = false or fabricated causal inference.",
  },
  scope_fidelity: {
    5: "5 = sample, setting, context, and limits are preserved.",
    4: "4 = scope is mostly preserved with minor compression.",
    3: "3 = limits are partially visible.",
    2: "2 = scope is overgeneralized.",
    1: "1 = scope is seriously distorted or universalized.",
  },
  method_transparency: {
    5: "5 = methodology is clearly visible and correctly interpreted.",
    4: "4 = method is visible but not fully explained.",
    3: "3 = method is mentioned but weakly connected to interpretation.",
    2: "2 = method is unclear or partially mismatched.",
    1: "1 = method is hidden or misrepresented.",
  },
  nuance_preservation: {
    5: "5 = limitations, uncertainty, and qualifications are retained.",
    4: "4 = most nuance is preserved.",
    3: "3 = some nuance remains but important caveats are shortened.",
    2: "2 = important uncertainty is lost.",
    1: "1 = nuance is removed or reversed.",
  },
  audience_calibration: {
    5: "5 = language, tone, and structure fit the target audience very well.",
    4: "4 = audience fit is mostly appropriate.",
    3: "3 = understandable but not fully calibrated.",
    2: "2 = too technical, too vague, or mismatched.",
    1: "1 = not appropriate for the selected audience.",
  },
  actionability: {
    5: "5 = practical recommendations are useful and evidence-bounded.",
    4: "4 = useful with minor limits.",
    3: "3 = somewhat useful but generic.",
    2: "2 = weakly actionable or exceeds evidence.",
    1: "1 = not actionable or recommends unsupported action.",
  },
};

const lowCausalPermissionLevels = new Set([
  "exploratory",
  "hypothetical",
  "limited",
  "inherits-from-included-studies",
  "evidence-base-dependent",
]);

const strongCausalTerms = [
  "causes",
  "cause",
  "proves",
  "leads to",
  "guarantees",
  "results in",
  "caused",
  "proved",
  "led to",
  "guaranteed",
  "resulted in",
];

const causalLimitTerms = [
  "causal inference",
  "causal conclusions are limited",
  "does not establish",
  "should not be treated",
  "cannot establish",
  "association",
  "associated with",
];

const universalScopeTerms = [
  "all agencies",
  "everyone",
  "always",
  "every organization",
  "every public administrator",
  "universal",
  "guaranteed",
  "guarantees",
];

const strongActionTerms = [
  "must",
  "should immediately",
  "should implement",
  "guarantee improvement",
  "immediately implement",
];

const methodSignalTerms = {
  quantitative: ["survey", "regression", "sample", "data", "variables", "statistical", "association", "associated with"],
  qualitative: ["interviews", "interview", "themes", "participants", "context", "lived experience", "semi-structured"],
  theoretical: ["framework", "concept", "theory", "theoretical", "model"],
  experimental: ["randomized", "randomised", "treatment", "control group", "experiment", "field experiment"],
  meta_analysis: ["pooled", "effect size", "heterogeneity", "studies", "synthesis", "meta-analysis", "meta analysis"],
  systematic_review: ["review", "literature", "evidence patterns", "gaps", "synthesis", "systematic review"],
  mixed_methods: ["survey", "regression", "quantitative", "interview", "themes", "qualitative", "mixed methods"],
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

function normalizeText(evidenceSummary) {
  return [
    ...(evidenceSummary?.evidence_sentences ?? []),
    ...(evidenceSummary?.causal_claims ?? []).map((claim) => claim.sentence),
    ...(evidenceSummary?.limitation_signals ?? []).map((signal) => signal.sentence),
    ...(evidenceSummary?.generalization_signals ?? []).map((signal) => signal.sentence),
    ...(evidenceSummary?.method_signals ?? []).map((signal) => signal.sentence),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function clamp1to5(score) {
  return Math.max(1, Math.min(5, Math.round(score)));
}

export function getScoreLabel(score) {
  if (score === 5) return "Excellent fidelity";
  if (score === 4) return "Strong fidelity with minor issues";
  if (score === 3) return "Acceptable with limitations";
  if (score === 2) return "Low fidelity";
  if (score === 1) return "Very low fidelity";
  return "Not scored";
}

function failureIds(failureModes) {
  return new Set(failureModes.map((failureMode) => failureMode.id));
}

function hasFailure(ids, names) {
  return names.some((name) => ids.has(name));
}

function evidenceFromSignals(signals, fallback = []) {
  return unique([
    ...fallback,
    ...signals.map((signal) => signal.sentence ?? signal.value ?? signal),
  ]).slice(0, 4);
}

function makeDimension({
  dimension,
  score,
  explanation,
  evidence = [],
  risks = [],
  recommendedFix,
}) {
  const finalScore = clamp1to5(score);

  return {
    score: finalScore,
    label: getScoreLabel(finalScore),
    explanation,
    evidence: unique(evidence).slice(0, 5),
    risks: unique(risks).slice(0, 5),
    recommended_fix: recommendedFix,
    anchor_justification: dimensionAnchors[dimension][finalScore],
  };
}

function methodSignalsFor(methodologyId, text, evidenceSummary) {
  const terms = methodSignalTerms[methodologyId] ?? [];
  const matchedTerms = terms.filter((term) => text.includes(term));
  const matchedSentences = evidenceFromSignals(evidenceSummary?.method_signals ?? []);

  return unique([...matchedTerms, ...matchedSentences]);
}

function causalEvidence(evidenceSummary) {
  return evidenceFromSignals(evidenceSummary?.causal_claims ?? []);
}

function limitationEvidence(evidenceSummary) {
  return evidenceFromSignals(evidenceSummary?.limitation_signals ?? []);
}

function generalizationEvidence(evidenceSummary) {
  return evidenceFromSignals(evidenceSummary?.generalization_signals ?? []);
}

function hasCausalLimit(text) {
  return includesAny(text, causalLimitTerms);
}

function strongCausalEvidence(text, evidenceSummary) {
  const claimEvidence = evidenceFromSignals(
    (evidenceSummary?.causal_claims ?? []).filter((claim) => claim.strength === "strong"),
  );
  const termEvidence = strongCausalTerms.filter((term) => text.includes(term));

  return unique([...claimEvidence, ...termEvidence]);
}

function applyFailureCaps(scores, risks, failureModes) {
  const ids = failureIds(failureModes);

  if (hasFailure(ids, ["causal_overstatement", "unsupported_causal_language"])) {
    scores.causal_precision = Math.min(scores.causal_precision, 2);
    risks.causal_precision.push("Failure mode cap: causal overstatement.");
  }

  if (hasFailure(ids, ["scope_overgeneralization", "overgeneralized_language"])) {
    scores.scope_fidelity = Math.min(scores.scope_fidelity, 2);
    risks.scope_fidelity.push("Failure mode cap: scope overgeneralization.");
  }

  if (hasFailure(ids, ["missing_limitations", "missing_high_stakes_caveat"])) {
    scores.nuance_preservation = Math.min(scores.nuance_preservation, 3);
    risks.nuance_preservation.push("Failure mode cap: missing limitations.");
  }

  if (hasFailure(ids, ["unsupported_recommendation"])) {
    scores.actionability = Math.min(scores.actionability, 2);
    risks.actionability.push("Failure mode cap: unsupported recommendation.");
  }

  if (hasFailure(ids, ["method_mismatch"])) {
    scores.method_transparency = Math.min(scores.method_transparency, 2);
    scores.claim_accuracy = Math.min(scores.claim_accuracy, 3);
    risks.method_transparency.push("Failure mode cap: method mismatch.");
    risks.claim_accuracy.push("Failure mode cap: method mismatch.");
  }

  if (hasFailure(ids, ["mechanism_invention"])) {
    scores.causal_precision = Math.min(scores.causal_precision, 1);
    scores.actionability = Math.min(scores.actionability, 2);
    risks.causal_precision.push("Failure mode cap: mechanism invention risk.");
    risks.actionability.push("Failure mode cap: mechanism invention risk.");
  }
}

export function scoreFidelity({
  evidenceSummary,
  failureModes = [],
  methodology = "unknown",
  outputType = "executive_summary",
  targetAudience = "public_administrators",
} = {}) {
  const methodologyId = normalizeMethodology(methodology);
  const methodologyRule = methodologyRules[methodologyId];
  const summary = evidenceSummary?.summary ?? {};
  const text = normalizeText(evidenceSummary);
  const methodEvidence = methodSignalsFor(methodologyId, text, evidenceSummary);
  const causalSignals = strongCausalEvidence(text, evidenceSummary);
  const limitationSignals = limitationEvidence(evidenceSummary);
  const scopeSignals = generalizationEvidence(evidenceSummary);
  const risks = {
    claim_accuracy: [],
    causal_precision: [],
    scope_fidelity: [],
    method_transparency: [],
    nuance_preservation: [],
    audience_calibration: [],
    actionability: [],
  };
  const scores = {
    claim_accuracy: summary.has_text ? 4 : 1,
    causal_precision: summary.has_causal_language ? 3 : 5,
    scope_fidelity: summary.has_limitations ? 4 : 3,
    method_transparency: methodEvidence.length > 0 ? 5 : summary.has_method_detail ? 4 : 2,
    nuance_preservation: summary.has_limitations ? 5 : 3,
    audience_calibration: ["executive_summary", "fact_sheet"].includes(outputType) ? 4 : 3,
    actionability: ["policy_brief", "policy_memo"].includes(outputType) ? 4 : 3,
  };

  if (!summary.has_text) {
    Object.keys(scores).forEach((key) => {
      scores[key] = 1;
      risks[key].push("No analyzable source text was provided.");
    });
  }

  if (!methodologyRule) {
    scores.claim_accuracy = Math.min(scores.claim_accuracy, 3);
    scores.method_transparency = Math.min(scores.method_transparency, 2);
    risks.claim_accuracy.push("No configured methodology rule matched the selection.");
    risks.method_transparency.push("Methodology could not be resolved.");
  }

  if (
    methodologyRule &&
    lowCausalPermissionLevels.has(methodologyRule.causalPermissionLevel) &&
    causalSignals.length > 0 &&
    !hasCausalLimit(text)
  ) {
    scores.causal_precision = Math.min(scores.causal_precision, 2);
    scores.claim_accuracy = Math.min(scores.claim_accuracy, 3);
    risks.causal_precision.push(
      `${methodologyRule.label} evidence does not support unqualified causal language.`,
    );
    risks.claim_accuracy.push("Strong causal interpretation may exceed the source evidence.");
  }

  if (hasCausalLimit(text) && causalSignals.length === 0) {
    scores.causal_precision = Math.max(scores.causal_precision, 4);
  }

  if (includesAny(text, universalScopeTerms) || scopeSignals.length > 0) {
    scores.scope_fidelity = Math.min(scores.scope_fidelity, 2);
    risks.scope_fidelity.push("Universal or broad scope language is visible.");
  }

  if (!summary.has_limitations) {
    scores.nuance_preservation = Math.min(scores.nuance_preservation, 3);
    risks.nuance_preservation.push("Limitations, uncertainty, or caveats are not visible.");
  }

  if (includesAny(text, strongActionTerms) && !summary.has_limitations) {
    scores.actionability = Math.min(scores.actionability, 2);
    risks.actionability.push("Action language is strong while evidence limits are missing.");
  }

  if (methodologyId === "theoretical" && includesAny(text, ["proves", "causes", "empirical proof"])) {
    scores.claim_accuracy = Math.min(scores.claim_accuracy, 3);
    scores.causal_precision = Math.min(scores.causal_precision, 1);
    risks.claim_accuracy.push("Conceptual argument may be presented as tested evidence.");
    risks.causal_precision.push("Theory is treated as causal proof.");
  }

  if (methodologyId === "experimental") {
    if (methodEvidence.length > 0) {
      scores.causal_precision = Math.max(scores.causal_precision, 4);
    }

    if (includesAny(text, universalScopeTerms)) {
      scores.scope_fidelity = Math.min(scores.scope_fidelity, 2);
      risks.scope_fidelity.push("Experimental finding may be generalized beyond sample or setting.");
    }
  }

  if (methodologyId === "meta_analysis" && !text.includes("heterogeneity")) {
    scores.nuance_preservation = Math.min(scores.nuance_preservation, 4);
    risks.nuance_preservation.push("Meta-analytic interpretation should mention heterogeneity when relevant.");
  }

  if (methodologyId === "systematic_review" && hasCausalLimit(text)) {
    scores.causal_precision = Math.max(scores.causal_precision, 4);
  }

  if (methodologyId === "mixed_methods") {
    const hasQuantStrand = includesAny(text, ["survey", "regression", "quantitative", "statistical"]);
    const hasQualStrand = includesAny(text, ["interview", "themes", "qualitative", "participants"]);

    if (hasQuantStrand && hasQualStrand) {
      scores.method_transparency = 5;
    } else {
      scores.nuance_preservation = Math.min(scores.nuance_preservation, 3);
      risks.nuance_preservation.push("One mixed-methods evidence strand is not visible.");
    }
  }

  if (outputType === "mechanism_map") {
    scores.claim_accuracy = Math.min(scores.claim_accuracy, 3);
    scores.causal_precision = Math.min(scores.causal_precision, summary.has_causal_language ? 2 : 1);
    risks.claim_accuracy.push("Mechanism maps can add pathway interpretation beyond the text.");
    risks.causal_precision.push("Pathways should be labeled as hypothesized unless causal evidence is established.");

    if (includesAny(text, universalScopeTerms)) {
      scores.scope_fidelity = Math.min(scores.scope_fidelity, 2);
      risks.scope_fidelity.push("Mechanism map may imply universal causal pathways.");
    }
  }

  if (
    outputType === "technical_note" &&
    ["qualitative", "theoretical", "systematic_review", "meta_analysis"].includes(methodologyId)
  ) {
    scores.claim_accuracy = Math.min(scores.claim_accuracy, 4);
    risks.claim_accuracy.push("Technical note precision risk: avoid invented statistics or analytic details.");
  }

  if (["linkedin_post", "press_release", "op_ed"].includes(outputType)) {
    scores.nuance_preservation = Math.min(scores.nuance_preservation, 4);
    scores.causal_precision = Math.min(scores.causal_precision, 4);
    risks.nuance_preservation.push("Persuasive formats can compress caveats.");
  }

  if (["executive_summary", "fact_sheet", "elevator_pitch"].includes(outputType)) {
    scores.audience_calibration = Math.max(scores.audience_calibration, 4);
  }

  applyFailureCaps(scores, risks, failureModes);

  const baseEvidence = evidenceFromSignals(evidenceSummary?.evidence_sentences ?? []);
  const dimensionEvidence = {
    claim_accuracy: unique([...baseEvidence, ...causalSignals]).slice(0, 4),
    causal_precision: unique([...causalSignals, ...limitationSignals]).slice(0, 4),
    scope_fidelity: unique([...scopeSignals, ...limitationSignals]).slice(0, 4),
    method_transparency: methodEvidence,
    nuance_preservation: limitationSignals,
    audience_calibration: [targetAudience.replaceAll("_", " "), outputType.replaceAll("_", " ")],
    actionability: unique([...baseEvidence, ...limitationSignals]).slice(0, 4),
  };

  return {
    claim_accuracy: makeDimension({
      dimension: "claim_accuracy",
      score: scores.claim_accuracy,
      explanation:
        scores.claim_accuracy >= 4
          ? "The visible claims are closely grounded in the input text and aligned with the selected methodology."
          : "Some claims risk going beyond what the input text and selected methodology can support.",
      evidence: dimensionEvidence.claim_accuracy,
      risks: risks.claim_accuracy,
      recommendedFix:
        scores.claim_accuracy >= 4
          ? "Keep generated claims traceable to the source text."
          : "Remove unsupported interpretation and tie each claim back to visible source evidence.",
    }),
    causal_precision: makeDimension({
      dimension: "causal_precision",
      score: scores.causal_precision,
      explanation:
        scores.causal_precision >= 4
          ? "Causal wording is cautious or supported by the selected methodology and visible limits."
          : "Causal wording may exceed what this methodology can responsibly support.",
      evidence: dimensionEvidence.causal_precision,
      risks: risks.causal_precision,
      recommendedFix:
        scores.causal_precision >= 4
          ? "Continue using association, pattern, or bounded causal language as appropriate."
          : "Replace strong causal verbs with cautious terms such as 'suggests', 'is associated with', or 'may help explain'.",
    }),
    scope_fidelity: makeDimension({
      dimension: "scope_fidelity",
      score: scores.scope_fidelity,
      explanation:
        scores.scope_fidelity >= 4
          ? "The sample, setting, and limits are visible enough to keep scope bounded."
          : "The language risks generalizing beyond the visible sample, setting, or context.",
      evidence: dimensionEvidence.scope_fidelity,
      risks: risks.scope_fidelity,
      recommendedFix:
        scores.scope_fidelity >= 4
          ? "Keep sample, setting, and transfer limits visible."
          : "Add sample, setting, context, and transferability limits; remove universal wording.",
    }),
    method_transparency: makeDimension({
      dimension: "method_transparency",
      score: scores.method_transparency,
      explanation:
        scores.method_transparency >= 4
          ? "The method is visible and can be connected to the permissible inference level."
          : "The method is not visible enough to support a clear inference audit.",
      evidence: dimensionEvidence.method_transparency,
      risks: risks.method_transparency,
      recommendedFix:
        scores.method_transparency >= 4
          ? "Keep the method label and evidence type connected to the interpretation."
          : "Name the method, sample, data source, design, or synthesis approach before making claims.",
    }),
    nuance_preservation: makeDimension({
      dimension: "nuance_preservation",
      score: scores.nuance_preservation,
      explanation:
        scores.nuance_preservation >= 4
          ? "Limitations, uncertainty, or caveats are retained and easy to see."
          : "Important limitations or uncertainty are missing, shortened, or at risk of being overlooked.",
      evidence: dimensionEvidence.nuance_preservation,
      risks: risks.nuance_preservation,
      recommendedFix:
        scores.nuance_preservation >= 4
          ? "Keep caveats close to the main claim."
          : "Add limitations, uncertainty language, and scope caveats before classroom or policy use.",
    }),
    audience_calibration: makeDimension({
      dimension: "audience_calibration",
      score: scores.audience_calibration,
      explanation:
        scores.audience_calibration >= 4
          ? "The selected output type can be calibrated clearly for the chosen target audience."
          : "The selected audience and output type require more careful calibration to avoid mismatch or overconfidence.",
      evidence: dimensionEvidence.audience_calibration,
      risks: risks.audience_calibration,
      recommendedFix:
        scores.audience_calibration >= 4
          ? "Keep language clear, audience-specific, and evidence-bounded."
          : "Revise tone, structure, and explanation level for the selected audience.",
    }),
    actionability: makeDimension({
      dimension: "actionability",
      score: scores.actionability,
      explanation:
        scores.actionability >= 4
          ? "Practical use is possible as long as recommendations remain evidence-bounded."
          : "The action language is generic, weakly supported, or stronger than the evidence allows.",
      evidence: dimensionEvidence.actionability,
      risks: risks.actionability,
      recommendedFix:
        scores.actionability >= 4
          ? "Keep recommendations proportional to the evidence."
          : "Frame next steps as review, testing, or cautious implementation rather than immediate mandate.",
    }),
  };
}
