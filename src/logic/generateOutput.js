const audienceGuidance = {
  policymakers: {
    label: "Policymakers",
    lens: "policy decisions and implementation risk",
    practicalUse: "use the evidence to review policy options and implementation risks",
  },
  public_administrators: {
    label: "Public Administrators",
    lens: "management relevance and operational implications",
    practicalUse: "use the evidence to review administrative practice and implementation limits",
  },
  communications_staff: {
    label: "Communications Staff",
    lens: "clear messaging and caution against overclaiming",
    practicalUse: "use the evidence in clear public messages with visible caveats",
  },
  program_managers: {
    label: "Program Managers",
    lens: "workflow, coordination, implementation, and evaluation",
    practicalUse: "use the evidence to review program design, handoffs, and evaluation checkpoints",
  },
  research_analysts: {
    label: "Research Analysts",
    lens: "evidence quality, inference limits, scope, and validity",
    practicalUse: "use the evidence to audit method fit, scope, and inference boundaries",
  },
  general_public: {
    label: "General Public",
    lens: "plain language and practical meaning",
    practicalUse: "use the evidence as a plain-language explanation of what the study suggests",
  },
  students: {
    label: "Students",
    lens: "method explanation, simpler language, and why limitations matter",
    practicalUse: "use the evidence to learn how methods shape responsible conclusions",
  },
};

const methodologyNotes = {
  quantitative:
    "Quantitative evidence can support association, descriptive patterns, and limited prediction, but it should not be rewritten as causal proof unless a causal design is explicit.",
  qualitative:
    "Qualitative evidence can support themes, participant descriptions, meanings, and context-bound interpretation, but it should not be rewritten as population-level prevalence or statistical proof.",
  mixed_methods:
    "Mixed-methods evidence should preserve quantitative and qualitative strands and should not merge them into one stronger claim unless the text explains that integration.",
  theoretical:
    "Theoretical work should be rewritten as conceptual argument, framework logic, or hypotheses, not as tested empirical evidence unless the text provides evidence.",
  experimental:
    "Experimental evidence can support bounded causal language only when randomization, treatment, control, or experiment details are visible.",
  meta_analysis:
    "Meta-analytic evidence should preserve pooled evidence, heterogeneity, and study-quality limits rather than implying a universal effect.",
  systematic_review:
    "Systematic review evidence should preserve synthesis, evidence patterns, and gaps rather than turning literature patterns into causal proof.",
  unknown:
    "Methodology is not fully visible, so claims should be rewritten cautiously and kept close to the source text.",
};

const methodSignals = [
  "survey",
  "surveys",
  "regression",
  "cross-sectional",
  "statistical",
  "interview",
  "interviews",
  "semi-structured",
  "focus group",
  "coded",
  "randomized",
  "randomised",
  "experiment",
  "experimental",
  "treatment",
  "control",
  "systematic review",
  "meta-analysis",
  "meta analysis",
  "pooled",
  "study",
  "sample",
  "data",
];

const findingSignals = [
  "finds",
  "findings",
  "found",
  "indicate",
  "indicates",
  "show",
  "shows",
  "identify",
  "identifies",
  "described",
  "describes",
  "reported",
  "suggest",
  "suggests",
  "associated with",
  "linked to",
  "relationship",
  "themes",
  "results",
  "evidence",
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
  "generalisability",
  "cannot",
  "does not",
  "should not",
  "not be treated",
  "not measured",
  "causal inference",
  "causal conclusions",
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

function addPeriod(value) {
  const text = normalizeWhitespace(value);

  if (!text) {
    return "";
  }

  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function capitalizeFirst(value) {
  const text = normalizeWhitespace(value);

  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function titleCase(value) {
  const smallWords = new Set(["and", "or", "of", "the", "for", "to", "in", "on"]);

  return normalizeWhitespace(value)
    .split(" ")
    .map((word, index) => {
      const normalized = word.toLowerCase();

      if (index > 0 && smallWords.has(normalized)) {
        return normalized;
      }

      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join(" ");
}

function inlineList(items, fallback = "the evidence") {
  const values = unique(items).slice(0, 4);

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

function listItems(items, fallback, limit = 5) {
  const values = unique(items).slice(0, limit);

  if (values.length === 0) {
    return `- ${fallback}`;
  }

  return values.map((item) => `- ${addPeriod(capitalizeFirst(item))}`).join("\n");
}

function firstSentence(text, fallback = "The source text provides limited evidence.") {
  return splitSentences(text)[0] ?? fallback;
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
      .replace(/^this\s+study\s+(?:uses|examines|explores|analy[sz]es)\s+/i, "")
      .replace(/^the\s+study\s+(?:uses|examines|explores|analy[sz]es)\s+/i, "")
      .replace(/^researchers\s+conducted\s+/i, "")
      .replace(/^the\s+researchers\s+conducted\s+/i, "")
      .replace(/^participants\s+described\s+/i, "")
      .replace(/^program managers\s+(?:said|reported|described)\s+/i, "")
      .replace(/^the\s+review\s+finds?\s+(?:that\s+)?/i, "")
      .replace(/^the\s+findings\s+(?:identify|show|suggest)\s+(?:that\s+)?/i, "")
      .replace(/^regression\s+results\s+show\s+(?:that\s+)?/i, "")
      .replace(/^results\s+show\s+(?:that\s+)?/i, ""),
  );
}

function cleanLimitationText(value) {
  return stripEnding(value)
    .replace(/^they should not/i, "the findings should not")
    .replace(/^it should not/i, "the finding should not")
    .replace(/^these results do not/i, "these results do not");
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
    return examined;
  }

  const findingFocus = matchFirst(normalizedText, [
    /participants described ([^.]+?)(?:\.|, but| but|$)/i,
    /findings? (?:identify|show|suggest)\s+(?:that\s+)?([^.]+?)(?:, but| but|\.|$)/i,
    /review finds?\s+(?:that\s+)?([^.]+?)(?:, but| but|\.|$)/i,
  ]);

  return findingFocus || sentenceToFragment(splitSentences(normalizedText)[0] ?? "");
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
    ? `evidence containing ${inlineList(numericSignals)}`
    : "source evidence with limited visible method detail";
}

export function extractLimitationSignals(text) {
  const { sentences } = summarizeInput(text);
  const directLimitations = sentences
    .filter((sentence) => {
      const normalized = lower(sentence);

      return (
        includesAny(sentence, limitationSignals) &&
        (!normalized.includes("sample") ||
          includesAny(sentence, [
            "limit",
            "limited",
            "limitation",
            "generalizability",
            "generalisability",
            "causal inference",
            "not be treated",
          ]))
      );
    })
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

  const problemsMatch = normalizedText.match(
    /problems? such as ([^.]+?)(?:\.|, but| but|;|$)/i,
  );

  if (problemsMatch?.[1]) {
    conditions.push(...splitListPhrase(problemsMatch[1]));
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
    /^(?:(?:the\s+)?review finds? that |the findings indicate |findings indicate |regression results show that |results show that |finds? that |show that |shows that )?(.+?) (?:is|are) (?:frequently )?associated with (.+?)(?:\.|,|;|$)/i,
  );

  if (associatedMatch) {
    conditions.push(stripEnding(associatedMatch[1]), stripEnding(associatedMatch[2]));
  }

  const supportConcepts = [
    "unclear ownership",
    "unclear responsibilities",
    "late escalation",
    "delayed escalation",
    "inconsistent handoffs",
    "poor handoffs",
    "organizational support",
    "public service motivation",
    "leadership",
    "organizational capacity",
    "public sector innovation",
    "outcome measurement",
  ];

  supportConcepts.forEach((concept) => {
    if (lower(normalizedText).includes(concept)) {
      conditions.push(concept);
    }
  });

  const cleanedConditions = unique(
    conditions.map((condition) =>
      stripEnding(condition)
        .replace(/^that\s+/i, "")
        .replace(/^the\s+/i, "")
        .replace(/^findings?\s+indicate\s+/i, "")
        .replace(/^findings?\s+/i, ""),
    ),
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

export function buildMethodologyNote(methodology = "unknown") {
  return methodologyNotes[methodology] ?? methodologyNotes.unknown;
}

export function buildAudienceGuidance(targetAudience = "public_administrators") {
  return audienceGuidance[targetAudience] ?? audienceGuidance.public_administrators;
}

function methodologyLabel(methodology) {
  return formatLabel(methodology || "unknown").toLowerCase();
}

function buildRewriteData(text, methodology = "unknown") {
  const summary = summarizeInput(text);
  const limitations = extractLimitationSignals(text);
  const conditions = extractConditionsOrInputs(text);
  const findings = extractKeyFindings(text);
  const evidenceType = extractEvidenceType(text, methodology);
  const studyFocus = extractStudyFocus(text);

  return {
    text: summary.normalized_text,
    methodology,
    summary,
    limitations,
    conditions,
    findings,
    evidenceType,
    studyFocus,
    methodNote: buildMethodologyNote(methodology),
  };
}

function primaryFinding(data) {
  const contentFindings = data.findings.filter(
    (finding) =>
      !includesAny(finding, [
        "qualitative evidence",
        "quantitative evidence",
        "method affects",
        "should be read",
        "should not imply",
      ]),
  );
  const associationFinding = contentFindings.find((finding) =>
    includesAny(finding, ["associated with", "linked to", "higher motivation"]),
  );

  if (associationFinding) {
    return associationFinding;
  }

  if (contentFindings.length > 0) {
    return contentFindings[0];
  }

  if (data.findings.length > 0) {
    return data.findings[0];
  }

  if (data.conditions.length > 0) {
    return `${data.studyFocus} involves ${inlineList(data.conditions)}`;
  }

  return data.studyFocus || "the source text provides limited evidence";
}

function limitationOrDefault(data) {
  if (data.limitations.length > 0) {
    return capitalizeFirst(data.limitations[0]);
  }

  if (data.methodology === "qualitative") {
    return "The evidence should be treated as context-bound thematic insight rather than a population-level estimate";
  }

  if (data.methodology === "quantitative") {
    return "The evidence should preserve association language and avoid unsupported causal claims";
  }

  if (data.methodology === "experimental") {
    return data.summary.has_causal_design
      ? "Any causal claim should stay bounded by the treatment, sample, setting, and measured outcomes"
      : "Causal language should wait until the experimental design is visible";
  }

  if (data.methodology === "meta_analysis") {
    return "The interpretation should preserve heterogeneity and study-quality limits";
  }

  if (data.methodology === "systematic_review") {
    return "The interpretation should preserve synthesis limits and evidence gaps";
  }

  if (data.methodology === "theoretical") {
    return "The argument should not be described as tested evidence unless the text provides empirical support";
  }

  return "Claims should stay within the visible source evidence";
}

function evidenceOpening(data, subject = "This study") {
  const method = methodologyLabel(data.methodology);

  if (data.methodology === "unknown") {
    return `${subject} uses ${data.evidenceType}`;
  }

  return `${subject} uses ${method} evidence from ${data.evidenceType}`;
}

function conditionSentence(data, verb = "described") {
  if (data.conditions.length === 0) {
    return addPeriod(capitalizeFirst(primaryFinding(data)));
  }

  return `The source ${verb} ${inlineList(data.conditions)}.`;
}

function associationSafeFinding(data) {
  const finding = primaryFinding(data)
    .replace(/\bcauses?\b/gi, "is associated with")
    .replace(/\bleads to\b/gi, "is associated with")
    .replace(/\bproves?\b/gi, "provides evidence about")
    .replace(/\bguarantees?\b/gi, "is linked to");

  return finding;
}

function studentMainPoint(data) {
  const finding = sentenceToFragment(primaryFinding(data));

  if (lower(finding).startsWith("recurring friction")) {
    return `the study describes ${finding}`;
  }

  return `the study shows ${finding}`;
}

function composeParagraph(sentences) {
  return sentences
    .map((sentence) => addPeriod(sentence))
    .filter(Boolean)
    .join(" ");
}

export function simplifyForStudents(text, methodology = "unknown") {
  const data = buildRewriteData(text, methodology);
  const methodExplanation =
    methodology === "qualitative"
      ? "This is qualitative evidence, which means it explains themes and experiences rather than giving numbers for everyone"
      : methodology === "quantitative"
        ? "This is quantitative evidence, which means it uses data patterns and should keep association separate from causation"
        : `This is ${methodologyLabel(methodology)} evidence, so the method affects what the study can claim`;

  return composeParagraph([
    `This study is based on ${data.evidenceType}`,
    data.conditions.length > 0
      ? `It describes problems or patterns such as ${inlineList(data.conditions)}`
      : capitalizeFirst(primaryFinding(data)),
    `In simpler terms, ${studentMainPoint(data).toLowerCase()}`,
    methodExplanation,
    limitationOrDefault(data),
  ]);
}

export function makePolicyOriented(text, methodology = "unknown") {
  const data = buildRewriteData(text, methodology);
  const method = methodologyLabel(methodology);
  const cautiousFinding =
    methodology === "quantitative" ? associationSafeFinding(data) : primaryFinding(data);

  return composeParagraph([
    `This ${method} study draws on ${data.evidenceType}`,
    `For policy purposes, the evidence suggests that ${inlineList(
      data.conditions,
      cautiousFinding,
    )} may be relevant to ${data.studyFocus}`,
    `The findings indicate ${cautiousFinding.toLowerCase()}`,
    `They should be interpreted cautiously because ${limitationOrDefault(data).toLowerCase()}`,
  ]);
}

export function makePlainLanguage(text, methodology = "unknown") {
  const data = buildRewriteData(text, methodology);
  const peopleLanguage = lower(data.evidenceType).includes("interview")
    ? `The researchers interviewed ${data.evidenceType.replace(/^.*?(\d+)/, "$1")}`
    : `The study looked at ${data.evidenceType}`;

  return composeParagraph([
    peopleLanguage,
    data.conditions.length > 0
      ? `People or studies pointed to ${inlineList(data.conditions)}`
      : capitalizeFirst(primaryFinding(data)),
    `The practical meaning is that ${sentenceToFragment(primaryFinding(data)).toLowerCase()}`,
    limitationOrDefault(data).replace("population-level", "everyone"),
  ]);
}

export function makeAnalystFocused(text, methodology = "unknown") {
  const data = buildRewriteData(text, methodology);
  const inferenceLimit =
    methodology === "qualitative"
      ? "context-bound thematic insight rather than population-level prevalence or causal inference"
      : methodology === "quantitative"
        ? "association evidence rather than causal inference unless the design supports causality"
        : limitationOrDefault(data).toLowerCase();

  return composeParagraph([
    `The source uses ${methodologyLabel(methodology)} evidence from ${data.evidenceType}`,
    `Reported findings include ${inlineList(data.findings, primaryFinding(data))}`,
    data.conditions.length > 0
      ? `Relevant extracted concepts include ${inlineList(data.conditions)}`
      : "",
    `The evidence should be treated as ${inferenceLimit}`,
    limitationOrDefault(data),
  ]);
}

export function makeProgramManagerFocused(text, methodology = "unknown") {
  const data = buildRewriteData(text, methodology);

  return composeParagraph([
    `${capitalizeFirst(data.studyFocus)} can be read as an implementation and workflow issue`,
    data.conditions.length > 0
      ? `The source points to operational concerns such as ${inlineList(data.conditions)}`
      : capitalizeFirst(primaryFinding(data)),
    `Program teams can use this evidence to review handoffs, role clarity, escalation routines, and evaluation checkpoints where relevant`,
    limitationOrDefault(data),
  ]);
}

export function makeCommunicationsFocused(text, methodology = "unknown") {
  const data = buildRewriteData(text, methodology);

  return composeParagraph([
    `Message-ready summary: ${sentenceToFragment(primaryFinding(data))}`,
    data.conditions.length > 0
      ? `The clearest supporting points are ${inlineList(data.conditions)}`
      : `The source evidence is ${data.evidenceType}`,
    `Use cautious language such as "the evidence suggests" or "the findings indicate"`,
    `Do not overstate the claim: ${limitationOrDefault(data).toLowerCase()}`,
  ]);
}

export function makePublicAdministratorFocused(text, methodology = "unknown") {
  const data = buildRewriteData(text, methodology);

  return composeParagraph([
    `For administrative practice, the source evidence from ${data.evidenceType} points to ${data.studyFocus}`,
    data.conditions.length > 0
      ? `The management-relevant issues include ${inlineList(data.conditions)}`
      : capitalizeFirst(primaryFinding(data)),
    `The finding can inform implementation review, operational planning, and management oversight`,
    limitationOrDefault(data),
  ]);
}

export function rewriteForAudience(
  text,
  targetAudience = "public_administrators",
  methodology = "unknown",
) {
  if (!normalizeWhitespace(text)) {
    return "No source text was provided to rewrite.";
  }

  if (targetAudience === "students") {
    return simplifyForStudents(text, methodology);
  }

  if (targetAudience === "policymakers") {
    return makePolicyOriented(text, methodology);
  }

  if (targetAudience === "general_public") {
    return makePlainLanguage(text, methodology);
  }

  if (targetAudience === "research_analysts") {
    return makeAnalystFocused(text, methodology);
  }

  if (targetAudience === "program_managers") {
    return makeProgramManagerFocused(text, methodology);
  }

  if (targetAudience === "communications_staff") {
    return makeCommunicationsFocused(text, methodology);
  }

  return makePublicAdministratorFocused(text, methodology);
}

function appendIfMissing(text, requiredPhrase, sentence) {
  return lower(text).includes(lower(requiredPhrase)) ? text : `${text} ${sentence}`;
}

export function applyMethodologySafeguards(text, methodology = "unknown") {
  let rewritten = normalizeWhitespace(text)
    .replace(/\bcauses?\b/gi, methodology === "experimental" ? "causes" : "is associated with")
    .replace(/\bleads to\b/gi, methodology === "experimental" ? "leads to" : "is linked to")
    .replace(/\bproves?\b/gi, "provides evidence about")
    .replace(/\bguarantees?\b/gi, "does not guarantee")
    .replace(/\bresults in\b/gi, methodology === "experimental" ? "results in" : "is associated with");

  if (methodology === "qualitative") {
    rewritten = appendIfMissing(
      rewritten,
      "population-level",
      "The rewritten claim should be read as thematic and context-bound, not as a population-level statistic.",
    );
  }

  if (methodology === "quantitative") {
    rewritten = appendIfMissing(
      rewritten,
      "associated",
      "The rewritten claim should preserve association language and should not imply causality.",
    );
  }

  if (methodology === "mixed_methods") {
    rewritten = appendIfMissing(
      rewritten,
      "strands",
      "Quantitative and qualitative strands should remain visible unless the source explains their integration.",
    );
  }

  if (methodology === "theoretical") {
    rewritten = appendIfMissing(
      rewritten,
      "conceptual",
      "The rewritten claim should be treated as conceptual rather than tested empirical evidence.",
    );
  }

  if (methodology === "experimental" && !includesAny(rewritten, causalDesignSignals)) {
    rewritten = appendIfMissing(
      rewritten,
      "causal language",
      "Causal language should be bounded because randomization, treatment, or control details are not visible in the rewritten text.",
    );
  }

  if (methodology === "meta_analysis") {
    rewritten = appendIfMissing(
      rewritten,
      "heterogeneity",
      "Any pooled interpretation should remain attentive to heterogeneity and study quality.",
    );
  }

  if (methodology === "systematic_review") {
    rewritten = appendIfMissing(
      rewritten,
      "synthesis",
      "The rewritten claim should be read as synthesis of evidence patterns, not causal proof.",
    );
  }

  return rewritten;
}

function practicalMeaningForAudience(targetAudience, data) {
  const guidance = buildAudienceGuidance(targetAudience);

  if (targetAudience === "students") {
    return "This helps students see how method choice affects what can responsibly be concluded.";
  }

  if (targetAudience === "policymakers") {
    return `This can help policymakers consider ${inlineList(
      data.conditions,
      data.studyFocus,
    )} while keeping evidence limits visible.`;
  }

  if (targetAudience === "research_analysts") {
    return "This should be used to review evidence quality, inference limits, and validity before stronger claims are made.";
  }

  return `This can help ${guidance.label.toLowerCase()} ${guidance.practicalUse}.`;
}

function cautionForFormattedOutput(data) {
  const limitation = limitationOrDefault(data);

  if (data.methodology === "quantitative") {
    return `${limitation}. Do not rewrite the association as a causal effect.`;
  }

  if (data.methodology === "qualitative") {
    return `${limitation}. Do not treat themes as population-level statistics.`;
  }

  return limitation;
}

function evidenceTitle(data, outputType) {
  const focus = data.studyFocus || "source evidence";
  return `${formatLabel(outputType)}: ${titleCase(focus)}`;
}

function mechanismLinks(data) {
  if (data.conditions.length === 0) {
    return [
      `${capitalizeFirst(data.studyFocus)} may be connected to the observed evidence, but the pathway should stay tentative.`,
    ];
  }

  return data.conditions.map((condition) => {
    const normalized = lower(condition);

    if (normalized.includes("ownership") || normalized.includes("responsibilities")) {
      return `${capitalizeFirst(condition)} may create role clarity or coordination challenges.`;
    }

    if (normalized.includes("escalation")) {
      return `${capitalizeFirst(condition)} may delay problem resolution.`;
    }

    if (normalized.includes("handoff")) {
      return `${capitalizeFirst(condition)} may weaken continuity across teams.`;
    }

    if (normalized.includes("organizational support")) {
      return `${capitalizeFirst(condition)} is associated with the motivation pattern described in the source.`;
    }

    return `${capitalizeFirst(condition)} may be part of the process described in the rewritten evidence statement.`;
  });
}

export function formatForOutputType(
  rewrittenText,
  outputType = "executive_summary",
  targetAudience = "public_administrators",
  methodology = "unknown",
) {
  const data = buildRewriteData(rewrittenText, methodology);
  const guidance = buildAudienceGuidance(targetAudience);
  const mainFinding = capitalizeFirst(primaryFinding(data));
  const caution = cautionForFormattedOutput(data);

  if (outputType === "policy_brief") {
    return `Title
${evidenceTitle(data, outputType)}

Key Message
${firstSentence(rewrittenText)}

Evidence-Based Summary
${rewrittenText}

Implications
${practicalMeaningForAudience(targetAudience, data)}

Caution / Limitations
${addPeriod(caution)}`;
  }

  if (outputType === "policy_memo") {
    return `To
${guidance.label}

From
AI Playbook Consistency & Failure Mode Analyzer

Subject
Method-bounded rewrite of ${data.studyFocus}

Summary
${rewrittenText}

Analysis
${mainFinding}

Recommendation
Use this rewritten evidence as decision support, not as a standalone basis for action.

Evidence Limit
${addPeriod(caution)}`;
  }

  if (outputType === "executive_summary") {
    return `Overview
${rewrittenText}

Main Finding
${addPeriod(mainFinding)}

Practical Meaning
${practicalMeaningForAudience(targetAudience, data)}

Limitation
${addPeriod(caution)}`;
  }

  if (outputType === "fact_sheet") {
    return `What the study looked at
${addPeriod(capitalizeFirst(data.evidenceType))}

What it found
${rewrittenText}

What it does not prove
${addPeriod(caution)}

Why it matters
${practicalMeaningForAudience(targetAudience, data)}`;
  }

  if (outputType === "linkedin_post") {
    const bullets = unique([
      firstSentence(rewrittenText),
      data.conditions.length > 0
        ? `The key issues are ${inlineList(data.conditions)}.`
        : addPeriod(mainFinding),
      addPeriod(caution),
    ]);

    return `Short opening line
Evidence is most useful when the wording stays close to what the study actually shows.

3 bullet points
${listItems(bullets, "The source text needs more evidence detail before public posting.", 3)}

Caution sentence
${addPeriod(caution)}

Hashtags
#PublicAdministration #EvidenceUse #${formatLabel(methodology).replaceAll(" ", "")} #${formatLabel(outputType).replaceAll(" ", "")}`;
  }

  if (outputType === "mechanism_map") {
    return `Conditions
${listItems(data.conditions, "No clear conditions were detected in the rewritten text.")}

Possible Process Links
${listItems(mechanismLinks(data), "No process link should be invented without stronger source evidence.")}

Observed Themes or Outcomes
${rewrittenText}

Causality Warning
${addPeriod(caution)}`;
  }

  if (outputType === "technical_note") {
    return `Evidence Type
${addPeriod(capitalizeFirst(data.evidenceType))}

Methodological Interpretation
${buildMethodologyNote(methodology)}

Rewritten Evidence Statement
${rewrittenText}

Fidelity Warning
${addPeriod(caution)}`;
  }

  return rewrittenText;
}

export const formatOutputByType = formatForOutputType;

export function generateOutput({
  text = "",
  methodology = "unknown",
  outputType = "executive_summary",
  targetAudience = "public_administrators",
  evidenceSummary,
  failureModes = [],
} = {}) {
  void evidenceSummary;
  void failureModes;

  const rewrittenText = rewriteForAudience(text, targetAudience, methodology);
  const safeguardedText = applyMethodologySafeguards(rewrittenText, methodology);

  return formatForOutputType(
    safeguardedText,
    outputType,
    targetAudience,
    methodology,
  );
}
