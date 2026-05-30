const methodologySignals = [
  {
    id: "systematic_review",
    label: "Systematic Review",
    signals: [
      "systematic review",
      "screened",
      "records",
      "included studies",
      "inclusion criteria",
      "exclusion criteria",
      "search strategy",
      "evidence base",
    ],
  },
  {
    id: "meta_analysis",
    label: "Meta-Analysis",
    signals: [
      "meta-analysis",
      "meta analysis",
      "pooled estimate",
      "pooled effect",
      "effect sizes",
      "heterogeneity",
      "publication bias",
      "moderator",
    ],
  },
  {
    id: "experimental",
    label: "Experimental",
    signals: [
      "randomized",
      "randomised",
      "random assignment",
      "assigned",
      "treatment group",
      "control group",
      "experiment",
      "field experiment",
      "trial",
    ],
  },
  {
    id: "mixed_methods",
    label: "Mixed Methods",
    signals: [
      "mixed methods",
      "combined",
      "triangulated",
      "triangulation",
      "quantitative patterns",
      "qualitative themes",
      "interview evidence",
      "usage analytics",
    ],
  },
  {
    id: "qualitative",
    label: "Qualitative",
    signals: [
      "interviews",
      "semi-structured",
      "participants described",
      "themes",
      "lived experience",
      "focus group",
      "coded",
      "field notes",
    ],
  },
  {
    id: "quantitative",
    label: "Quantitative",
    signals: [
      "survey",
      "statistical",
      "regression",
      "correlation",
      "controlled for",
      "sample",
      "percent",
      "%",
      "rate",
      "estimate",
    ],
  },
  {
    id: "theoretical",
    label: "Theoretical",
    signals: [
      "conceptual",
      "theoretical",
      "model predicts",
      "hypothesis",
      "framework",
      "mechanism",
      "proposes",
      "boundary conditions",
    ],
  },
];

function normalizeText(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasSignal(text, signal) {
  if (signal === "%") {
    return text.includes("%");
  }

  const normalizedSignal = normalizeText(signal);

  if (normalizedSignal.includes(" ") || normalizedSignal.includes("-")) {
    return text.includes(normalizedSignal);
  }

  return new RegExp(`\\b${escapeRegExp(normalizedSignal)}\\b`).test(text);
}

function signalWeight(signal) {
  if (signal.includes(" ") || signal.includes("-")) {
    return 3;
  }

  if (signal === "%") {
    return 2;
  }

  return 1;
}

function roundScore(value) {
  return Math.round(value * 100) / 100;
}

export function detectMethodology(text) {
  const normalizedText = normalizeText(text);

  const rankedCandidates = methodologySignals
    .map((methodology, index) => {
      const matchedSignals = methodology.signals.filter((signal) =>
        hasSignal(normalizedText, signal),
      );
      const score = matchedSignals.reduce(
        (total, signal) => total + signalWeight(signal),
        0,
      );

      return {
        methodology: methodology.id,
        label: methodology.label,
        score,
        matched_signals: matchedSignals,
        rank_order: index,
      };
    })
    .sort((a, b) => b.score - a.score || a.rank_order - b.rank_order)
    .map(({ rank_order, ...candidate }) => candidate);

  const topCandidate = rankedCandidates[0];
  const runnerUp = rankedCandidates[1];
  const detectedMethodology =
    topCandidate && topCandidate.score > 0 ? topCandidate.methodology : "unknown";
  const confidence =
    topCandidate && topCandidate.score > 0
      ? roundScore(
          Math.min(
            0.95,
            0.45 + topCandidate.score / (topCandidate.score + runnerUp.score + 6),
          ),
        )
      : 0;

  return {
    detected_methodology: detectedMethodology,
    label: detectedMethodology === "unknown" ? "Unknown" : topCandidate.label,
    confidence,
    matched_signals: detectedMethodology === "unknown" ? [] : topCandidate.matched_signals,
    ranked_candidates: rankedCandidates,
  };
}
