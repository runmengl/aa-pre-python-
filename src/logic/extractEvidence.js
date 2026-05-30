const numericPattern =
  /\b(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:\s?(?:%|percent|percentage points|participants|respondents|studies|records|sessions|weeks|months|years|agents|teams|regions|interviews|cases|operators))?\b/gi;

const methodTerms = [
  "survey",
  "interview",
  "interviews",
  "semi-structured",
  "focus group",
  "randomized",
  "randomised",
  "assigned",
  "control group",
  "treatment group",
  "experiment",
  "trial",
  "controlled for",
  "regression",
  "meta-analysis",
  "meta analysis",
  "systematic review",
  "pooled",
  "screened",
  "included",
  "coded",
  "sample",
  "evaluation",
];

const strongCausalTerms = [
  "caused",
  "causes",
  "cause",
  "led to",
  "leads to",
  "resulted in",
  "results in",
  "because of",
  "due to",
  "impact",
  "impacts",
  "effect on",
  "effects on",
];

const softCausalTerms = [
  "associated with",
  "linked to",
  "correlates with",
  "suggests",
  "supports",
  "predicts",
  "may",
  "could",
];

const limitationTerms = [
  "but",
  "however",
  "limited",
  "limitation",
  "uncertainty",
  "does not establish",
  "should not",
  "cannot",
  "not be treated",
  "varied",
  "heterogeneity",
  "publication bias",
  "evidence quality",
  "gaps",
  "concerns",
];

const generalizationTerms = [
  "always",
  "never",
  "all teams",
  "all organizations",
  "every team",
  "everyone",
  "universal",
  "guarantees",
  "proves",
  "best practice",
  "must",
];

function normalizeWhitespace(text) {
  return String(text ?? "")
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

function findTerms(sentence, terms) {
  const lowerSentence = sentence.toLowerCase();
  return terms.filter((term) => lowerSentence.includes(term));
}

function unique(values) {
  return [...new Set(values)];
}

function findNumericMatches(sentence) {
  numericPattern.lastIndex = 0;
  const matches = sentence.match(numericPattern) ?? [];
  numericPattern.lastIndex = 0;
  return matches;
}

function hasNumericClaim(sentence) {
  numericPattern.lastIndex = 0;
  const hasMatch = numericPattern.test(sentence);
  numericPattern.lastIndex = 0;
  return hasMatch;
}

function extractNumericClaims(sentences) {
  return sentences.flatMap((sentence) => {
    const matches = findNumericMatches(sentence);

    return unique(matches).map((value) => ({
      value,
      sentence,
    }));
  });
}

function extractSentenceSignals(sentences, terms) {
  return sentences
    .map((sentence) => ({
      sentence,
      matches: findTerms(sentence, terms),
    }))
    .filter((item) => item.matches.length > 0);
}

function extractCausalClaims(sentences) {
  return sentences
    .map((sentence) => {
      const strongMatches = findTerms(sentence, strongCausalTerms);
      const softMatches = findTerms(sentence, softCausalTerms);
      const matches = unique([...strongMatches, ...softMatches]);

      return {
        sentence,
        matches,
        strength: strongMatches.length > 0 ? "strong" : "soft",
      };
    })
    .filter((item) => item.matches.length > 0);
}

function wordCount(text) {
  const normalized = normalizeWhitespace(text);
  return normalized ? normalized.split(" ").length : 0;
}

function roundScore(value) {
  return Math.round(value * 100) / 100;
}

export function extractEvidence(text) {
  const normalizedText = normalizeWhitespace(text);
  const sentences = splitSentences(normalizedText);
  const numericClaims = extractNumericClaims(sentences);
  const methodSignals = extractSentenceSignals(sentences, methodTerms);
  const causalClaims = extractCausalClaims(sentences);
  const limitationSignals = extractSentenceSignals(sentences, limitationTerms);
  const generalizationSignals = extractSentenceSignals(sentences, generalizationTerms);
  const evidenceSentences = sentences.filter((sentence) => {
    const lowerSentence = sentence.toLowerCase();

    return (
      hasNumericClaim(sentence) ||
      methodTerms.some((term) => lowerSentence.includes(term)) ||
      limitationTerms.some((term) => lowerSentence.includes(term))
    );
  });

  return {
    word_count: wordCount(normalizedText),
    sentence_count: sentences.length,
    evidence_density:
      sentences.length === 0 ? 0 : roundScore(evidenceSentences.length / sentences.length),
    numeric_claims: numericClaims,
    method_signals: methodSignals,
    causal_claims: causalClaims,
    limitation_signals: limitationSignals,
    generalization_signals: generalizationSignals,
    evidence_sentences: unique(evidenceSentences),
    summary: {
      has_text: normalizedText.length > 0,
      has_numeric_evidence: numericClaims.length > 0,
      has_method_detail: methodSignals.length > 0,
      has_limitations: limitationSignals.length > 0,
      has_causal_language: causalClaims.length > 0,
      has_generalization_language: generalizationSignals.length > 0,
    },
  };
}
