import { buildConsistencyMatrix } from "../logic/buildConsistencyMatrix.js";
import Card from "./Card.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

const dimensionColumns = [
  { key: "CA", label: "CA", title: "Claim Accuracy" },
  { key: "CP", label: "CP", title: "Causal Precision" },
  { key: "SF", label: "SF", title: "Scope Fidelity" },
  { key: "MT", label: "MT", title: "Method Transparency" },
  { key: "NP", label: "NP", title: "Nuance Preservation" },
  { key: "AC", label: "AC", title: "Audience Calibration" },
  { key: "ACT", label: "ACT", title: "Actionability" },
];

const methodologyTraditions = {
  quantitative: "Quantitative",
  qualitative: "Qualitative",
  mixed_methods: "Mixed Methods",
  theoretical: "Theoretical",
  experimental: "Experimental",
  meta_analysis: "Meta-Analysis",
  systematic_review: "Systematic Review",
};

const priorityFailureModes = new Set([
  "causal_overstatement",
  "unsupported_causal_language",
  "scope_overgeneralization",
  "overgeneralized_language",
  "mechanism_invention",
]);

function formatScore(score) {
  return Number(score).toFixed(2);
}

function scoreTone(score) {
  if (!Number.isFinite(Number(score))) return "neutral";
  if (score >= 4.5) return "high";
  if (score >= 4) return "strong";
  if (score >= 3) return "moderate";
  return "low";
}

function resultFailureId(failureMode) {
  return failureMode?.failure_mode ?? failureMode?.id ?? "";
}

function hasPriorityFailure(failureModes) {
  return (failureModes ?? []).some((failureMode) =>
    priorityFailureModes.has(resultFailureId(failureMode)),
  );
}

function currentTraditionLabel({ result, selectedPaper, selectedMethodology }) {
  const methodology =
    result?.generated_output?.methodology ??
    result?.methodology_profile?.detected_methodology ??
    selectedPaper?.methodology ??
    selectedMethodology;

  return methodologyTraditions[methodology] ?? "";
}

function PatternMetric({ label, value }) {
  return (
    <div className="patternMetric">
      <p className="metricLabel">{label}</p>
      <p className="patternValue">{value}</p>
    </div>
  );
}

function PatternPanel({ pattern }) {
  return (
    <aside className="consistencyPatternPanel" aria-label="Cross-method pattern summary">
      <h3>Pattern Summary</h3>
      <div className="consistencyPatternGrid">
        <PatternMetric
          label="Most consistent"
          value={`${pattern.most_consistent.tradition} ${formatScore(
            pattern.most_consistent.score,
          )}`}
        />
        <PatternMetric
          label="Least consistent"
          value={`${pattern.least_consistent.tradition} ${formatScore(
            pattern.least_consistent.score,
          )}`}
        />
        <PatternMetric label="Spread" value={formatScore(pattern.spread)} />
        <PatternMetric label="Weakest column" value={pattern.weakest_dimension} />
      </div>
    </aside>
  );
}

function MatrixTable({ matrix, currentTradition }) {
  return (
    <div className="consistencyTableWrap">
      <table className="consistencyMatrix">
        <thead>
          <tr>
            <th scope="col">Tradition</th>
            {dimensionColumns.map((column) => (
              <th key={column.key} scope="col">
                <abbr title={column.title}>{column.label}</abbr>
              </th>
            ))}
            <th scope="col">Avg</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => (
            <tr
              data-current={row.tradition === currentTradition ? "true" : undefined}
              key={row.tradition}
            >
              <th scope="row">{row.tradition}</th>
              {dimensionColumns.map((column) => (
                <td
                  className="consistencyScoreCell"
                  data-tone={scoreTone(row[column.key])}
                  key={column.key}
                >
                  {formatScore(row[column.key])}
                </td>
              ))}
              <td className="consistencyScoreCell consistencyAvgCell">
                {formatScore(row.Avg)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProblematicPairings({ pairings }) {
  return (
    <section className="problemPairingSection">
      <h3>Top three problematic pairings (output type x methodology)</h3>
      <div className="consistencyTableWrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Pairing</th>
              <th scope="col">Mean</th>
              <th scope="col">Primary Risk</th>
            </tr>
          </thead>
          <tbody>
            {pairings.map((pairing) => (
              <tr key={pairing.rank}>
                <th scope="row">{pairing.rank}</th>
                <td>{pairing.pairing}</td>
                <td>{formatScore(pairing.mean)}</td>
                <td>{pairing.primary_risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AnalyticalNarrative({ narrative }) {
  return (
    <section className="consistencyNarrative">
      <h3>Analytical Narrative</h3>
      {String(narrative)
        .split("\n\n")
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
        ))}
    </section>
  );
}

export default function ConsistencyAnalysisTab({
  result,
  selectedPaper,
  text,
  selectedMethodology,
  outputType,
  targetAudience,
}) {
  const generatedOutput = result?.generated_output ?? {};
  const consistency = buildConsistencyMatrix({
    text: text ?? selectedPaper?.research_text ?? "",
    selectedMethodology:
      generatedOutput.methodology ??
      result?.methodology_profile?.detected_methodology ??
      selectedPaper?.methodology ??
      selectedMethodology,
    outputType: generatedOutput.output_type ?? outputType,
    targetAudience: generatedOutput.target_audience ?? targetAudience,
    fidelityScores: result?.fidelity_scores,
    failureModes: result?.failure_modes,
  });
  const currentTradition = currentTraditionLabel({
    result,
    selectedPaper,
    selectedMethodology,
  });
  const showInputNote = hasPriorityFailure(result?.failure_modes);

  return (
    <Card
      title="Consistency"
      action={<ScoreBadge label={`${consistency.matrix.length} traditions`} />}
    >
      <div className="consistencyHeader">
        <div>
          <h3>Fidelity by Tradition x Dimension</h3>
          <p>
            Mean scores on a 1-5 fidelity scale across 21 papers x 18 outputs x 7
            dimensions
          </p>
        </div>
        {currentTradition && (
          <ScoreBadge label={`Current: ${currentTradition}`} tone="workable" />
        )}
      </div>

      {showInputNote && (
        <p className="consistencyInputNote">
          This input demonstrates why cross-method consistency checks matter:
          failure modes such as causal overstatement, scope overgeneralization, or
          mechanism invention can reduce fidelity for specific method-output
          combinations.
        </p>
      )}

      <div className="consistencyLayout">
        <section className="consistencyMatrixPanel">
          <MatrixTable
            currentTradition={currentTradition}
            matrix={consistency.matrix}
          />
        </section>
        <PatternPanel pattern={consistency.pattern} />
      </div>

      <ProblematicPairings pairings={consistency.problematic_pairings} />
      <AnalyticalNarrative narrative={consistency.narrative} />
    </Card>
  );
}
