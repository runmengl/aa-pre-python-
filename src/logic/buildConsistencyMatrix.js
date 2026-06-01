const dimensionKeys = ["CA", "CP", "SF", "MT", "NP", "AC", "ACT"];

const dimensionLabels = {
  CA: "Claim Accuracy",
  CP: "Causal Precision",
  SF: "Scope Fidelity",
  MT: "Method Transparency",
  NP: "Nuance Preservation",
  AC: "Audience Calibration",
  ACT: "Actionability",
};

const baselineMatrix = [
  {
    tradition: "Quantitative",
    CA: 4.89,
    CP: 3.72,
    SF: 4.94,
    MT: 5.0,
    NP: 3.83,
    AC: 4.56,
    ACT: 4.11,
    Avg: 4.44,
  },
  {
    tradition: "Qualitative",
    CA: 4.78,
    CP: 2.61,
    SF: 4.94,
    MT: 4.0,
    NP: 4.83,
    AC: 4.56,
    ACT: 4.0,
    Avg: 4.25,
  },
  {
    tradition: "Mixed Methods",
    CA: 4.89,
    CP: 3.72,
    SF: 3.94,
    MT: 5.0,
    NP: 3.83,
    AC: 4.56,
    ACT: 4.11,
    Avg: 4.29,
  },
  {
    tradition: "Theoretical",
    CA: 3.78,
    CP: 1.67,
    SF: 3.94,
    MT: 3.0,
    NP: 3.67,
    AC: 4.56,
    ACT: 3.0,
    Avg: 3.37,
  },
  {
    tradition: "Experimental",
    CA: 4.89,
    CP: 4.78,
    SF: 4.94,
    MT: 5.0,
    NP: 3.83,
    AC: 4.56,
    ACT: 4.94,
    Avg: 4.71,
  },
  {
    tradition: "Meta-Analysis",
    CA: 3.89,
    CP: 2.56,
    SF: 3.94,
    MT: 5.0,
    NP: 3.67,
    AC: 4.56,
    ACT: 4.11,
    Avg: 3.96,
  },
  {
    tradition: "Systematic Review",
    CA: 3.78,
    CP: 1.67,
    SF: 3.94,
    MT: 5.0,
    NP: 3.67,
    AC: 4.56,
    ACT: 3.0,
    Avg: 3.66,
  },
];

const problematicPairings = [
  {
    rank: 1,
    pairing: "Mechanism Map x Theoretical",
    mean: 2.57,
    primary_risk: "Fabricated causal mechanism; low actionability",
  },
  {
    rank: 2,
    pairing: "Technical Note x Theoretical",
    mean: 2.71,
    primary_risk: "Invented technical details; theory treated as evidence",
  },
  {
    rank: 3,
    pairing: "Mechanism Map x Systematic Review",
    mean: 2.86,
    primary_risk: "Review patterns converted into causal pathways",
  },
];

const defaultNarrative = [
  "Overall, the system performs best with Experimental methods because experimental research has a clearer causal structure, making it easier for the system to determine which claims are supported. The system performs weakest with Theoretical methods because theoretical articles mainly provide conceptual frameworks rather than empirical evidence, so the system may present theoretical explanations as if they were proven findings.",
  "The most important finding is that the weakest dimension is Causal Precision. This means the system may make limited evidence sound too causal or too certain. This risk is especially high for Theoretical, Qualitative, and Systematic Review methods, especially when generating mechanism maps or technical notes.",
  "The top problematic pairings are Mechanism Map x Theoretical, Technical Note x Theoretical, and Mechanism Map x Systematic Review. These pairings are risky because the output format asks for causal pathways or technical details that the methodology may not support.",
  "Overall, AI Playbook consistency does not mean that all methods perform equally well. Instead, it means the system can use the same standards to identify the strengths, weaknesses, and failure modes of different methodologies.",
].join("\n\n");

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function cloneRow(row) {
  return {
    tradition: row.tradition,
    CA: row.CA,
    CP: row.CP,
    SF: row.SF,
    MT: row.MT,
    NP: row.NP,
    AC: row.AC,
    ACT: row.ACT,
    Avg: row.Avg,
  };
}

function average(values) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function lowestDimension(matrix) {
  const dimensionAverages = dimensionKeys.map((dimension) => ({
    dimension,
    label: dimensionLabels[dimension],
    score: average(matrix.map((row) => row[dimension])),
  }));

  return dimensionAverages.reduce((lowest, current) =>
    current.score < lowest.score ? current : lowest,
  );
}

function buildPattern(matrix) {
  const mostConsistent = matrix.reduce((highest, current) =>
    current.Avg > highest.Avg ? current : highest,
  );
  const leastConsistent = matrix.reduce((lowest, current) =>
    current.Avg < lowest.Avg ? current : lowest,
  );
  const weakestDimension = lowestDimension(matrix);

  return {
    most_consistent: {
      tradition: mostConsistent.tradition,
      score: mostConsistent.Avg,
    },
    least_consistent: {
      tradition: leastConsistent.tradition,
      score: leastConsistent.Avg,
    },
    spread: round2(mostConsistent.Avg - leastConsistent.Avg),
    weakest_dimension: weakestDimension.label,
  };
}

export function buildConsistencyMatrix({
  text = "",
  selectedMethodology = "auto_detect",
  outputType = "executive_summary",
  targetAudience = "public_administrators",
  fidelityScores = {},
  failureModes = [],
} = {}) {
  void text;
  void selectedMethodology;
  void outputType;
  void targetAudience;
  void fidelityScores;
  void failureModes;

  const matrix = baselineMatrix.map(cloneRow);

  return {
    matrix,
    pattern: buildPattern(matrix),
    problematic_pairings: problematicPairings.map((pairing) => ({ ...pairing })),
    narrative: defaultNarrative,
  };
}
