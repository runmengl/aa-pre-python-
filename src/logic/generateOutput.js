const audienceGuidance = {
  policymakers: {
    label: "Policymakers",
    emphasis: "decision relevance, policy options, evidence caution, and implementation risk",
    useLine:
      "Use this as decision support for comparing policy options and identifying implementation risks.",
    actionIntro: "Review policy options that address",
    caution:
      "Keep claims decision-relevant while avoiding certainty that the method does not support.",
  },
  public_administrators: {
    label: "Public Administrators",
    emphasis: "operational use, management implications, and implementation constraints",
    useLine:
      "Use this to review management routines, implementation constraints, and evaluation checkpoints.",
    actionIntro: "Use operational planning to address",
    caution:
      "Connect findings to implementation choices while keeping scope and method limits visible.",
  },
  communications_staff: {
    label: "Communications Staff",
    emphasis: "plain-language messaging and communication cautions",
    useLine:
      "Use this for cautious messaging that explains what the evidence does and does not show.",
    actionIntro: "Prepare plain-language messages about",
    caution: "Avoid headlines or public messages that sound more certain than the evidence.",
  },
  program_managers: {
    label: "Program Managers",
    emphasis: "program design, workflow improvement, evaluation, and implementation steps",
    useLine:
      "Use this to identify program design choices, workflow improvements, and evaluation needs.",
    actionIntro: "Adjust program design and workflow around",
    caution:
      "Treat the evidence as a guide for implementation review, not as a guarantee of results.",
  },
  research_analysts: {
    label: "Research Analysts",
    emphasis: "evidence quality, method limits, inference rules, and review needs",
    useLine:
      "Use this to audit evidence quality, inference boundaries, and review requirements.",
    actionIntro: "Document evidence quality and inference limits for",
    caution:
      "Keep source design, evidence strength, and missing information explicit before recommending action.",
  },
  general_public: {
    label: "General Public",
    emphasis: "plain language, minimal jargon, and why the finding matters",
    useLine:
      "Use this as a plain-language explanation of what the research suggests and why it matters.",
    actionIntro: "Explain in plain language why it matters that",
    caution:
      "Describe uncertainty directly and avoid technical claims that require background knowledge.",
  },
  students: {
    label: "Students",
    emphasis: "method explanation, evidence type, and why limitations matter",
    useLine:
      "Use this as a teaching example of how method choice shapes responsible conclusions.",
    actionIntro: "Use the example to explain",
    caution:
      "Make the connection between method, evidence type, and limitation language explicit.",
  },
};

const methodologyNotes = {
  quantitative:
    "This output treats the source as quantitative evidence. It may support statistical association, descriptive patterns, and limited prediction, but it should not claim causality unless the text explicitly names a randomized, experimental, treatment/control, or causal identification design.",
  qualitative:
    "This output treats the source as qualitative evidence. It may identify themes, meanings, participant descriptions, and context-bound interpretations, but it should not turn themes into population-level estimates or universal causal claims.",
  mixed_methods:
    "This output treats the source as mixed-methods evidence. Quantitative and qualitative strands should remain distinct unless the text explains how they are integrated.",
  theoretical:
    "This output treats the source as theoretical evidence. It may present conceptual logic, framework implications, and hypotheses, but it should not describe empirical findings unless the source text provides evidence.",
  experimental:
    "This output treats the source as experimental evidence. It may support bounded causal claims within the tested treatment, sample, and setting, while preserving external validity cautions.",
  meta_analysis:
    "This output treats the source as meta-analytic evidence. It may summarize pooled effects and cross-study patterns, but it should preserve heterogeneity and study-quality caveats.",
  systematic_review:
    "This output treats the source as systematic review evidence. It may summarize evidence patterns, gaps, and synthesis findings, but it should not present causal proof unless the reviewed designs support it.",
  unknown:
    "The methodology is not fully visible. This output should preserve cautious language and avoid claims that require stronger evidence than the text provides.",
};

const methodSignals = [
  "survey",
  "surveys",
  "regression",
  "statistical",
  "cross-sectional",
  "interview",
  "interviews",
  "semi-structured",
  "focus group",
  "coded",
  "mixed methods",
  "randomized",
  "randomised",
  "experiment",
  "experimental",
  "treatment",
  "control",
  "trial",
  "systematic review",
  "review",
  "meta-analysis",
  "meta analysis",
  "pooled",
  "study",
  "studies",
  "sample",
  "data",
];

const findingSignals = [
  "finds",
  "findings",
  "found",
  "show",
  "shows",
  "identify",
  "identifies",
  "described",
  "reported",
  "suggest",
  "suggests",
  "associated with",
  "linked to",
  "relationship",
  "themes",
  "evidence",
  "results",
];

const limitationSignals = [
  "but",
  "however",
  "limited",
  "limits",
  "limitation",
  "limitations",
  "constraint",
  "constraints",
  "scope",
  "sample",
  "context",
  "generalizability",
  "generalizability",
  "cannot",
  "does not",
  "should not",
  "not be treated",
  "not measured",
  "causal conclusions are limited",
  "causal inference",
  "heterogeneity",
  "publication bias",
  "gap",
  "gaps",
];

const causalDesignSignals = [
  "randomized",
  "randomised",
  "random assignment",
  "assigned",
  "treatment group",
  "control group",
  "experimental",
  "experiment",
  "field experiment",
  "trial",
  "causal design",
  "identification strategy",
];

const strongCausalSignals = [
  "causes",
  "caused",
  "leads to",
  "led to",
  "proves",
  "guarantees",
  "results in",
  "resulted in",
  "impact",
  "impacts",
];

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text) {
  const normalized = normalizeWhitespace(text);

  if (!normalized) {
    return [];
  }

  return (
    normalized
      .match(/[^.!?]+(?:[.!?]+|$)/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? []
  );
}

function lower(value) {
  return String(value ?? "").toLowerCase();
}

function includesAny(value, terms) {
  const normalized = lower(value);
  return terms.some((term) => normalized.includes(term));
}

function unique(values) {
  return [
    ...new Set(
      values
        .map((value) => normalizeWhitespace(value).replace(/[.;:,\s]+$/g, ""))
        .filter(Boolean),
    ),
  ];
}

function stripEnding(value) {
  return normalizeWhitespace(value).replace(/[.;:,\s]+$/g, "");
}

function sentenceWithoutLimitationClause(sentence) {
  return stripEnding(
    String(sentence ?? "")
      .replace(/\s+(?:but|however)\s+.+$/i, "")
      .replace(/\s+although\s+.+$/i, ""),
  );
}

function sentenceToFragment(sentence) {
  const cleaned = sentenceWithoutLimitationClause(sentence);

  return stripEnding(
    cleaned
      .replace(/^this\s+study\s+(?:uses|examines|explores|analyzes|analyses)\s+/i, "")
      .replace(/^the\s+study\s+(?:uses|examines|explores|analyzes|analyses)\s+/i, "")
      .replace(/^researchers\s+conducted\s+/i, "")
      .replace(/^participants\s+described\s+/i, "")
      .replace(/^the\s+review\s+finds?\s+(?:that\s+)?/i, "")
      .replace(/^the\s+findings\s+(?:identify|show|suggest)\s+(?:that\s+)?/i, "")
      .replace(/^regression\s+results\s+show\s+(?:that\s+)?/i, "")
      .replace(/^results\s+show\s+(?:that\s+)?/i, ""),
  );
}

function capitalizeFirst(value) {
  const text = normalizeWhitespace(value);

  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function sentenceSubject(value) {
  const focus = normalizeWhitespace(value);

  if (/\sand\s/i.test(focus) && !lower(focus).startsWith("the relationship")) {
    return `The relationship between ${focus}`;
  }

  return capitalizeFirst(focus);
}

function cleanLimitationText(value) {
  return stripEnding(value)
    .replace(/^they should not/i, "The findings should not")
    .replace(/^it should not/i, "The finding should not");
}

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function titleCase(value) {
  const smallWords = new Set(["and", "or", "of", "the", "for", "to", "in", "on"]);
  const words = normalizeWhitespace(value).split(" ");

  return words
    .map((word, index) => {
      const cleaned = word.toLowerCase();

      if (index > 0 && smallWords.has(cleaned)) {
        return cleaned;
      }

      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    })
    .join(" ");
}

function shortenPhrase(value, maxWords = 12) {
  const words = normalizeWhitespace(value)
    .replace(/^the\s+/i, "")
    .split(" ")
    .filter(Boolean);

  if (words.length <= maxWords) {
    return words.join(" ");
  }

  return `${words.slice(0, maxWords).join(" ")}`;
}

function listItems(items, fallback, limit = 5) {
  const values = unique(items).slice(0, limit);

  if (values.length === 0) {
    return `- ${fallback}`;
  }

  return values.map((item) => `- ${capitalizeFirst(item)}`).join("\n");
}

function inlineList(items, fallback = "the evidence signals") {
  const values = unique(items).slice(0, 3);

  if (values.length === 0) {
    return fallback;
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function matchFirst(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1] || match?.[0]) {
      return stripEnding(match[1] ?? match[0]);
    }
  }

  return "";
}

function splitListPhrase(value) {
  const normalized = stripEnding(value).replace(/,\s+and\s+/gi, ", ");
  const parts = normalized.includes(",")
    ? normalized.split(",")
    : lower(normalized).includes(" between ")
      ? [normalized]
      : normalized.split(/\s+and\s+/i);

  return parts
    .map((item) => stripEnding(item))
    .map((item) => item.replace(/^and\s+/i, ""))
    .filter((item) => item.length > 2);
}

function extractNumberedEvidence(sentences) {
  const numberPattern =
    /\b(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:\s?(?:%|percent|participants|respondents|studies|records|sessions|weeks|months|years|teams|regions|interviews|cases|employees))?\b/gi;

  return sentences.flatMap((sentence) => sentence.match(numberPattern) ?? []);
}

export function summarizeInput(text) {
  const normalizedText = normalizeWhitespace(text);
  const sentences = splitSentences(normalizedText);

  return {
    normalized_text: normalizedText,
    sentences,
    word_count: normalizedText ? normalizedText.split(" ").length : 0,
    first_sentence: sentences[0] ?? "",
    numeric_signals: unique(extractNumberedEvidence(sentences)),
    has_causal_design: includesAny(normalizedText, causalDesignSignals),
    has_strong_causal_language: includesAny(normalizedText, strongCausalSignals),
  };
}

export function extractStudyFocus(text) {
  const normalizedText = normalizeWhitespace(text);
  const normalizedLower = lower(normalizedText);

  if (
    normalizedLower.includes("frontline program managers") &&
    (normalizedLower.includes("handoff") ||
      normalizedLower.includes("ownership") ||
      normalizedLower.includes("escalation"))
  ) {
    return "frontline program coordination";
  }

  const relationship = normalizedText.match(
    /relationship between ([^.]+?) and ([^.]+?)(?:\.|,|;|$)/i,
  );

  if (relationship) {
    return `${stripEnding(relationship[1])} and ${stripEnding(relationship[2])}`;
  }

  const directFocus = matchFirst(normalizedText, [
    /\bpublic sector innovation\b/i,
    /\bpublic service motivation\b/i,
  ]);

  if (directFocus) {
    return directFocus;
  }

  const examined = matchFirst(normalizedText, [
    /examines? studies on ([^.]+?)(?:\.|,|;|$)/i,
    /examines? ([^.]+?)(?:\.|,|;|$)/i,
    /to examine ([^.]+?)(?:\.|,|;|$)/i,
    /explores? ([^.]+?)(?:\.|,|;|$)/i,
    /analy[sz]es? ([^.]+?)(?:\.|,|;|$)/i,
  ]);

  if (examined) {
    return shortenPhrase(examined, 12);
  }

  const findingFocus = matchFirst(normalizedText, [
    /findings? (?:identify|show|suggest)\s+(?:that\s+)?([^.]+?)(?:, but| but|\.|$)/i,
    /participants described ([^.]+?)(?:\.|, but| but|$)/i,
    /review finds?\s+(?:that\s+)?([^.]+?)(?:, but| but|\.|$)/i,
  ]);

  if (findingFocus) {
    return shortenPhrase(findingFocus, 10);
  }

  return shortenPhrase(splitSentences(normalizedText)[0] ?? "the source text", 10);
}

export function extractEvidenceType(text, methodology = "unknown") {
  const { sentences, numeric_signals: numericSignals } = summarizeInput(text);
  const methodSentence =
    sentences.find((sentence) => includesAny(sentence, methodSignals)) ?? "";
  const normalized = lower(text);

  if (methodology === "qualitative" && normalized.includes("interview")) {
    return sentenceToFragment(methodSentence || "qualitative interview evidence");
  }

  if (methodology === "quantitative") {
    const pieces = [];

    if (normalized.includes("survey")) {
      pieces.push("survey data");
    }

    if (normalized.includes("regression")) {
      pieces.push("regression results");
    }

    if (normalized.includes("cross-sectional")) {
      pieces.push("cross-sectional sample");
    }

    return pieces.length > 0
      ? inlineList(pieces)
      : sentenceToFragment(methodSentence || "quantitative evidence");
  }

  if (methodology === "experimental") {
    return sentenceToFragment(methodSentence || "experimental evidence");
  }

  if (methodology === "meta_analysis") {
    return sentenceToFragment(methodSentence || "meta-analytic evidence");
  }

  if (methodology === "systematic_review") {
    const focus = matchFirst(methodSentence, [
      /systematic review examines studies on ([^.]+?)(?:\.|,|;|$)/i,
      /review examines studies on ([^.]+?)(?:\.|,|;|$)/i,
    ]);

    return focus
      ? `systematic review evidence on ${focus}`
      : sentenceToFragment(methodSentence || "systematic review evidence");
  }

  if (methodology === "mixed_methods") {
    return sentenceToFragment(methodSentence || "mixed-methods evidence");
  }

  if (methodology === "theoretical") {
    return sentenceToFragment(methodSentence || "theoretical or conceptual argument");
  }

  if (methodSentence) {
    return sentenceToFragment(methodSentence);
  }

  return numericSignals.length > 0
    ? `evidence containing numeric signals such as ${inlineList(numericSignals)}`
    : "method details are limited in the pasted text";
}

export function extractLimitationSignals(text) {
  const { sentences } = summarizeInput(text);
  const directLimitations = sentences
    .filter((sentence) => includesAny(sentence, limitationSignals))
    .map((sentence) => {
      const match = sentence.match(/\b(?:but|however)\b[,\s]+(.+)$/i);
      return cleanLimitationText(match?.[1] ?? sentence);
    });

  return unique(directLimitations);
}

export function extractKeyFindings(text) {
  const { sentences } = summarizeInput(text);
  const findings = sentences
    .filter((sentence) => includesAny(sentence, findingSignals))
    .map((sentence) => sentenceToFragment(sentence))
    .filter(Boolean);

  if (findings.length > 0) {
    return unique(findings);
  }

  return unique(sentences.slice(0, 3).map((sentence) => sentenceToFragment(sentence)));
}

export function extractConditionsOrInputs(text) {
  const normalizedText = normalizeWhitespace(text);
  const conditions = [];

  const aroundMatch = normalizedText.match(
    /around ([^.]+?)(?:\.|, but| but|;|$)/i,
  );

  if (aroundMatch?.[1]) {
    conditions.push(...splitListPhrase(aroundMatch[1]));
  }

  const relationshipMatch = normalizedText.match(
    /relationship between ([^.]+?) and ([^.]+?)(?:\.|,|;|$)/i,
  );

  if (relationshipMatch) {
    conditions.push(stripEnding(relationshipMatch[1]), stripEnding(relationshipMatch[2]));
  }

  const associationSentence = splitSentences(normalizedText).find((sentence) =>
    lower(sentence).includes("associated with"),
  );
  const associatedMatch = associationSentence?.match(
    /^(?:(?:the\s+)?review finds? that |regression results show that |results show that |finds? that |show that |shows that )?(.+?) (?:is|are) (?:frequently )?associated with (.+?)(?:\.|,|;|$)/i,
  );

  if (associatedMatch) {
    conditions.push(stripEnding(associatedMatch[1]));
  }

  const supportConcepts = [
    "leadership",
    "organizational capacity",
    "organizational support",
    "public service motivation",
    "unclear ownership",
    "late escalation",
    "inconsistent handoffs",
    "outcome measurement",
    "public sector innovation",
  ];

  supportConcepts.forEach((concept) => {
    if (lower(normalizedText).includes(concept)) {
      conditions.push(concept);
    }
  });

  const cleanedConditions = unique(
    conditions
      .map((condition) =>
        condition
          .replace(/^that\s+/i, "")
          .replace(/^the\s+/i, "")
          .replace(/^findings?\s+/i, ""),
      )
      .map((condition) => shortenPhrase(condition, 10)),
  );

  return cleanedConditions.filter(
    (condition, index, allConditions) =>
      !allConditions.some(
        (otherCondition, otherIndex) =>
          otherIndex !== index &&
          lower(otherCondition).includes(lower(condition)) &&
          otherCondition.length > condition.length,
      ),
  );
}

export function buildMethodologyNote(methodology = "unknown", text = "") {
  const baseNote = methodologyNotes[methodology] ?? methodologyNotes.unknown;

  if (
    methodology === "quantitative" &&
    summarizeInput(text).has_causal_design
  ) {
    return "This output treats the source as quantitative evidence with visible causal-design language. Causal wording should still name the design, comparison, sample, and setting.";
  }

  return baseNote;
}

export function buildAudienceGuidance(targetAudience = "public_administrators") {
  return audienceGuidance[targetAudience] ?? audienceGuidance.public_administrators;
}

function buildFailureNotes(failureModes = []) {
  if (!failureModes.length) {
    return [
      "No priority failure mode was detected, but the output should still stay within the evidence.",
    ];
  }

  return failureModes
    .slice(0, 3)
    .map(
      (failureMode) =>
        `${formatLabel(failureMode.failure_mode)}: ${failureMode.recommended_fix}`,
    );
}

function buildCausalityWarning({ methodology, summary, limitations }) {
  if (methodology === "experimental") {
    return summary.has_causal_design
      ? "Causal claims should be limited to the tested treatment, measured outcomes, sample, and setting."
      : "Experimental causal language should be used only after the treatment/control design is visible.";
  }

  if (summary.has_causal_design) {
    return "The text includes causal-design language, so any causal claim should name the design and remain bounded by its sample and setting.";
  }

  const limitation = limitations.find((item) => lower(item).includes("causal"));

  if (limitation) {
    return capitalizeFirst(limitation);
  }

  return "This source does not establish causal effects; use association, theme, pattern, or possible pathway language.";
}

function buildPracticalActions(data) {
  const focusItems = data.conditions.length > 0 ? data.conditions : [data.studyFocus];
  const focus = inlineList(focusItems);

  return unique([
    `${data.audience.actionIntro} ${focus}.`,
    data.audience.useLine,
    "Add a review checkpoint before converting this evidence into firm guidance.",
  ]);
}

function methodologyLimitation(data) {
  if (data.methodology === "qualitative" && lower(data.evidenceType).includes("interview")) {
    return `Transfer cautiously because the evidence comes from ${data.evidenceType}`;
  }

  if (
    data.methodology === "quantitative" &&
    lower(data.evidenceType).includes("cross-sectional")
  ) {
    return "Cross-sectional quantitative evidence supports association language, not standalone causal claims";
  }

  if (data.methodology === "systematic_review") {
    return "The synthesis should be used as an evidence pattern, not as causal proof";
  }

  if (data.methodology === "meta_analysis") {
    return "Pooled evidence should be interpreted with attention to heterogeneity and study quality";
  }

  if (data.methodology === "experimental") {
    return "External validity should be checked before applying the result beyond the tested setting";
  }

  return "";
}

function buildPolicyImplications(data) {
  const finding = data.keyFindings[0] ?? `the source focuses on ${data.studyFocus}`;
  const limitation = data.limitations[0] ?? data.causalityWarning;

  return [
    `${capitalizeFirst(finding)}.`,
    `${data.audience.label} can use the evidence to consider ${inlineList(
      data.conditions,
      data.studyFocus,
    )}.`,
    `${capitalizeFirst(limitation)}.`,
  ];
}

function buildMechanisms(data) {
  const mechanismLines = data.conditions.map((condition) => {
    const normalized = lower(condition);

    if (normalized.includes("unclear ownership")) {
      return "Unclear ownership may create coordination gaps.";
    }

    if (normalized.includes("late escalation")) {
      return "Late escalation may delay problem resolution.";
    }

    if (normalized.includes("handoff")) {
      return "Inconsistent handoffs may weaken continuity across intake and delivery work.";
    }

    if (normalized.includes("organizational support")) {
      return "Organizational support may be linked to higher motivation, but the source supports association language unless causal design is explicit.";
    }

    if (normalized.includes("leadership")) {
      return "Leadership may be part of the evidence pattern associated with public sector innovation.";
    }

    if (normalized.includes("organizational capacity")) {
      return "Organizational capacity may shape whether innovation efforts can be supported and measured.";
    }

    if (normalized.includes("outcome measurement")) {
      return "Weak outcome measurement may make it harder to judge whether innovation efforts changed results.";
    }

    return `${capitalizeFirst(condition)} may shape the pattern described in the source text.`;
  });

  if (mechanismLines.length > 0) {
    return unique(mechanismLines);
  }

  return [
    `${capitalizeFirst(data.studyFocus)} may be connected to the observed pattern, but the pathway should be treated as tentative.`,
  ];
}

function outputTitle(outputType, studyFocus) {
  const label = formatLabel(outputType);
  return `${label}: ${titleCase(shortenPhrase(studyFocus, 8))}`;
}

function baseData({
  text,
  methodology,
  outputType,
  targetAudience,
  evidenceSummary,
  failureModes,
}) {
  const summary = summarizeInput(text);
  const studyFocus = extractStudyFocus(text);
  const evidenceType = extractEvidenceType(text, methodology);
  const extractedFindings = extractKeyFindings(text);
  const limitations = extractLimitationSignals(text);
  const conditions = extractConditionsOrInputs(text);
  const evidenceClaims = evidenceSummary?.main_claims ?? [];
  const supplementalFindings = evidenceClaims
    .filter((claim) => includesAny(claim, findingSignals))
    .map((claim) => sentenceToFragment(claim));
  const limitationClaims = (evidenceSummary?.limitations_found ?? []).map((claim) => {
    const match = String(claim).match(/\b(?:but|however)\b[,\s]+(.+)$/i);
    return cleanLimitationText(match?.[1] ?? claim);
  });
  const keyFindings = unique([...extractedFindings, ...supplementalFindings]).slice(
    0,
    5,
  );
  const limitationList = unique([...limitations, ...limitationClaims]).slice(0, 5);
  const audience = buildAudienceGuidance(targetAudience);
  const methodologyNote = buildMethodologyNote(methodology, text);
  const causalityWarning = buildCausalityWarning({
    methodology,
    summary,
    limitations: limitationList,
  });

  return {
    text,
    methodology,
    outputType,
    targetAudience,
    summary,
    studyFocus,
    evidenceType,
    keyFindings,
    limitations: limitationList,
    conditions,
    audience,
    methodologyNote,
    causalityWarning,
    failureNotes: buildFailureNotes(failureModes),
    title: outputTitle(outputType, studyFocus),
  };
}

function limitationsAndFidelity(data) {
  const limitationTexts = unique([...data.limitations, methodologyLimitation(data)]);

  if (
    data.causalityWarning &&
    !limitationTexts.some((item) => lower(item) === lower(data.causalityWarning))
  ) {
    limitationTexts.push(data.causalityWarning);
  }

  return [
    ...limitationTexts,
    ...data.failureNotes,
    `Audience fit: ${data.audience.caution}`,
  ];
}

function policyBrief(data) {
  return `Title
${data.title}

Audience
${data.audience.label}

Methodology Note
${data.methodologyNote}

Issue
${sentenceSubject(data.studyFocus)} is relevant to ${lower(data.audience.label)} because the source text connects it to ${inlineList(
    data.conditions,
    "practitioner decision-making",
  )}.

Evidence Summary
${listItems(
  [
    `${capitalizeFirst(data.evidenceType)}.`,
    ...data.keyFindings,
  ],
  "The pasted text provides limited evidence and should be reviewed before use.",
)}

Policy Implications
${listItems(buildPolicyImplications(data), "Policy implications require more source detail.")}

Recommended Actions
${listItems(buildPracticalActions(data), "Review the evidence before recommending action.")}

Limitations and Fidelity Note
${listItems(limitationsAndFidelity(data), "No explicit limitations were found; add scope and uncertainty language before use.")}`;
}

function policyMemo(data) {
  return `To
${data.audience.label}

From
AI Playbook Consistency & Failure Mode Analyzer

Subject
Method-bounded interpretation of ${data.studyFocus}

Background
The source text provides ${data.evidenceType}. The practitioner question is how to use the evidence about ${data.studyFocus} without exceeding what the method can support.

Analysis
${listItems(data.keyFindings, "The text does not provide enough finding detail for a strong memo analysis.")}

Recommendation
${listItems(buildPracticalActions(data), "Request more evidence before making a recommendation.")}

Limitations and Fidelity Note
${listItems(limitationsAndFidelity(data), "No explicit limitations were found; add scope and uncertainty language before use.")}`;
}

function executiveSummary(data) {
  return `Title
${data.title}

Overview
The source text is best read as ${data.evidenceType}. For ${lower(
    data.audience.label,
  )}, the practical focus is ${data.studyFocus}.

Key Findings
${listItems(data.keyFindings, "No clear key finding was detected in the pasted text.")}

Practical Meaning
${listItems(
  [
    `${data.audience.useLine}`,
    `${capitalizeFirst(data.studyFocus)} should be translated into action only with the method limits visible.`,
    ...buildPolicyImplications(data).slice(0, 1),
  ],
  "Practical meaning requires more source detail.",
)}

Methodological Caution
${data.methodologyNote}
${data.causalityWarning}

Limitations and Fidelity Note
${listItems(limitationsAndFidelity(data), "No explicit limitations were found; add scope and uncertainty language before use.")}`;
}

function factSheet(data) {
  return `Title
${data.title}

Study Focus
${capitalizeFirst(data.studyFocus)}

Evidence Type
${capitalizeFirst(data.evidenceType)}.

Key Takeaways
${listItems(data.keyFindings, "No clear takeaway was detected in the pasted text.")}

What This Does Not Prove
${listItems(
  [data.causalityWarning, ...data.failureNotes],
  "The text does not prove broad causal or universal claims.",
)}

Practical Use
${listItems(buildPracticalActions(data), "Use this as a cautious summary only.")}`;
}

function linkedInPost(data) {
  const takeaways = unique([
    data.keyFindings[0],
    `For ${lower(data.audience.label)}, the practical issue is ${data.studyFocus}.`,
    data.limitations[0] ?? data.causalityWarning,
  ]);

  return `Opening sentence
Research on ${data.studyFocus} can help public-sector practitioners think more carefully about action, but the method matters.

Three bullet takeaways
${listItems(takeaways, "The source text needs more evidence detail before public posting.", 3)}

Caution sentence
${data.causalityWarning}

Hashtags
#PublicAdministration #EvidenceUse #${formatLabel(data.methodology).replaceAll(" ", "")} #${formatLabel(data.outputType).replaceAll(" ", "")}`;
}

function mechanismMap(data) {
  return `Title
Mechanism Map: ${titleCase(shortenPhrase(data.studyFocus, 8))}

Audience
${data.audience.label}

Methodology Note
${data.methodologyNote}

Inputs / Conditions
${listItems(
  [
    data.evidenceType,
    ...data.conditions,
  ],
  "The text does not provide enough conditions to map; add context, actors, and setting.",
)}

Possible Mechanisms
${listItems(buildMechanisms(data), "No mechanism should be invented without stronger source evidence.")}

Observed or Suggested Outcomes
${listItems(data.keyFindings, "No observed or suggested outcomes were detected.")}

Causality Warning
${data.causalityWarning}

Policy or Practice Use
${listItems(buildPracticalActions(data), "Use this map as a cautious review aid only.")}

Limitations
${listItems(
  unique([...data.limitations, methodologyLimitation(data)]).length > 0
    ? unique([...data.limitations, methodologyLimitation(data)])
    : data.failureNotes,
  "No explicit limitations were found; transfer the map cautiously.",
)}`;
}

function technicalNote(data) {
  return `Title
${data.title}

Methodology
${formatLabel(data.methodology)}

Evidence Type
${capitalizeFirst(data.evidenceType)}.

Inference Rules
${listItems(
  [
    data.methodologyNote,
    data.causalityWarning,
    `Audience guidance: ${data.audience.caution}`,
  ],
  "Inference rules require a visible methodology.",
)}

Extracted Evidence
${listItems(
  [
    `Study focus: ${data.studyFocus}.`,
    ...data.keyFindings,
    ...data.conditions.map((condition) => `Condition/input: ${condition}.`),
  ],
  "No extractable evidence was detected.",
)}

Fidelity Risks
${listItems(data.failureNotes, "No priority fidelity risk was detected.")}

Review Notes
${listItems(buildPracticalActions(data), "Review source evidence and limitations before use.")}`;
}

export function formatOutputByType(outputType, extractedData) {
  if (outputType === "policy_brief") {
    return policyBrief(extractedData);
  }

  if (outputType === "policy_memo") {
    return policyMemo(extractedData);
  }

  if (outputType === "fact_sheet") {
    return factSheet(extractedData);
  }

  if (outputType === "linkedin_post") {
    return linkedInPost(extractedData);
  }

  if (outputType === "mechanism_map") {
    return mechanismMap(extractedData);
  }

  if (outputType === "technical_note") {
    return technicalNote(extractedData);
  }

  return executiveSummary(extractedData);
}

export function generateOutput({
  text = "",
  methodology = "unknown",
  outputType = "executive_summary",
  targetAudience = "public_administrators",
  evidenceSummary,
  failureModes = [],
} = {}) {
  const extractedData = baseData({
    text,
    methodology,
    outputType,
    targetAudience,
    evidenceSummary,
    failureModes,
  });

  return formatOutputByType(outputType, extractedData);
}
