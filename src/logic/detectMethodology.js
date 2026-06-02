const methodologySignals = [
  {
    id: "meta_analysis",
    label: "Meta-Analysis",
    signals: [
      "meta-analysis",
      "meta analysis",
      "systematic review and meta-analysis",
      "pooled estimate",
      "pooled effect",
      "pooled effects",
      "effect sizes",
      "mean effect size",
      "standardized mean difference",
      "random effects",
      "fixed effects",
      "forest plot",
      "heterogeneity",
      "publication bias",
      "moderator analysis",
      "moderator",
    ],
  },
  {
    id: "systematic_review",
    label: "Systematic Review",
    signals: [
      "systematic review",
      "scoping review",
      "rapid review",
      "literature review",
      "prisma",
      "database search",
      "searched databases",
      "screened",
      "records",
      "included studies",
      "eligible studies",
      "inclusion criteria",
      "exclusion criteria",
      "search strategy",
      "quality appraisal",
      "risk of bias",
      "evidence base",
      "synthesis",
    ],
  },
  {
    id: "experimental",
    label: "Experimental",
    signals: [
      "randomized",
      "randomised",
      "randomized controlled trial",
      "randomised controlled trial",
      "rct",
      "random assignment",
      "assigned",
      "treatment group",
      "control group",
      "control condition",
      "experiment",
      "experimental design",
      "field experiment",
      "trial",
      "intervention",
      "treatment effect",
      "causal effect",
      "difference-in-differences",
      "natural experiment",
    ],
  },
  {
    id: "mixed_methods",
    label: "Mixed Methods",
    signals: [
      "mixed methods",
      "mixed-methods",
      "mixed method",
      "convergent design",
      "sequential explanatory",
      "sequential exploratory",
      "combined",
      "triangulated",
      "triangulation",
      "integrated analysis",
      "integrated findings",
      "quantitative patterns",
      "qualitative themes",
      "interview evidence",
      "survey and interview",
      "surveys and interviews",
      "interviews and survey",
      "usage analytics",
    ],
  },
  {
    id: "qualitative",
    label: "Qualitative",
    signals: [
      "qualitative",
      "interviews",
      "interviewed",
      "semi-structured",
      "semistructured",
      "participants described",
      "themes",
      "thematic analysis",
      "content analysis",
      "lived experience",
      "focus group",
      "focus groups",
      "coded",
      "coding",
      "field notes",
      "ethnographic",
      "ethnography",
      "case study",
      "open-ended",
      "narrative analysis",
    ],
  },
  {
    id: "quantitative",
    label: "Quantitative",
    signals: [
      "quantitative",
      "survey",
      "surveys",
      "statistical",
      "regression",
      "logistic regression",
      "linear regression",
      "multivariate",
      "anova",
      "correlation",
      "controlled for",
      "sample",
      "dataset",
      "administrative data",
      "confidence interval",
      "p-value",
      "p <",
      "n =",
      "odds ratio",
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
      "hypotheses",
      "framework",
      "conceptual framework",
      "conceptual model",
      "logic model",
      "mechanism",
      "proposition",
      "propositions",
      "typology",
      "theory building",
      "we theorize",
      "proposes",
      "boundary conditions",
    ],
  },
];

const supportedMethodologies = new Set(
  methodologySignals.map((methodology) => methodology.id),
);

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
  if (
    [
      "meta-analysis",
      "meta analysis",
      "systematic review",
      "mixed methods",
      "mixed-methods",
      "randomized controlled trial",
      "randomised controlled trial",
    ].includes(signal)
  ) {
    return 5;
  }

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

export function resolveMethodologyFromText(text) {
  const detection = detectMethodology(text);
  const detectedMethodology = supportedMethodologies.has(
    detection.detected_methodology,
  )
    ? detection.detected_methodology
    : "auto_detect";

  return {
    detection,
    detectedMethodology,
  };
}
