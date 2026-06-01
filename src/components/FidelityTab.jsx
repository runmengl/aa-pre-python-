import Card from "./Card.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function FindingList({ findings }) {
  const items = Array.isArray(findings)
    ? findings.map((finding) => ({
        key: finding.id,
        label: finding.severity,
        value: finding.finding,
        note: finding.recommendation,
      }))
    : Object.entries(findings ?? {}).map(([key, value]) => ({
        key,
        label: key,
        value,
      }));

  if (items.length === 0) {
    return (
      <ul className="placeholderList">
        <li>No fidelity dimension findings are available.</li>
      </ul>
    );
  }

  return (
    <ul className="placeholderList">
      {items.map((finding) => (
        <li key={finding.key}>
          <strong>{formatLabel(finding.label)}:</strong> {finding.value}
          {finding.note && <p>{finding.note}</p>}
        </li>
      ))}
    </ul>
  );
}

const scoringScale = [
  "1 = Very Low Fidelity",
  "2 = Low Fidelity",
  "3 = Acceptable with limitations",
  "4 = Strong fidelity with minor issues",
  "5 = Excellent / Perfect Fidelity",
];

function scoreTone(score) {
  if (!Number.isFinite(Number(score))) return "neutral";
  if (score >= 5) return "strong";
  if (score >= 4) return "workable";
  if (score >= 3) return "review";
  return "risk";
}

function valueScore(value) {
  if (Number.isFinite(Number(value?.score))) {
    return Number(value.score);
  }

  if (Number.isFinite(Number(value))) {
    return Number(value);
  }

  return undefined;
}

function hasAnalysisResult(result) {
  return Boolean(
    result &&
      (result.workflow_trace || result.fidelity_scores || result.failure_modes),
  );
}

function normalizeScoreEntry(key, value) {
  if (value && typeof value === "object" && "score" in value) {
    return value;
  }

  const score = valueScore(value);

  return {
    score,
    label: score ? `${score}/5` : "Not scored",
    explanation: "Detailed scoring information is not available for this result.",
    evidence: [],
    risks: [],
    recommended_fix: "Run a new analysis to generate detailed fidelity scoring.",
    anchor_justification: "",
  };
}

function ChipList({ items, emptyLabel, tone = "neutral" }) {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];

  if (values.length === 0) {
    return <span className="fidelityChip">{emptyLabel}</span>;
  }

  return values.map((item, index) => (
    <span className="fidelityChip" data-tone={tone} key={`${item}-${index}`}>
      {item}
    </span>
  ));
}

function ScoringLegend() {
  return (
    <div className="fidelityLegend">
      <h3>Fidelity Scoring Scale</h3>
      <ul>
        {scoringScale.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function RiskNotePanel({ result }) {
  const note = result?.fidelity_risk_note;
  const generatedOutput = result?.generated_output;
  const profile = result?.methodology_profile;

  if (!note && !generatedOutput && !profile) {
    return null;
  }

  return (
    <div className="fidelityRiskPanel">
      <div>
        <p className="metricLabel">Detected Methodology</p>
        <p className="reportMetaValue">
          {formatLabel(note?.detected_methodology ?? profile?.detected_methodology)}
        </p>
      </div>
      <div>
        <p className="metricLabel">Output Type</p>
        <p className="reportMetaValue">
          {formatLabel(note?.output_type ?? generatedOutput?.output_type)}
        </p>
      </div>
      <div>
        <p className="metricLabel">Risk Level</p>
        <p className="reportMetaValue">{formatLabel(note?.risk_level)}</p>
      </div>
      <div className="fidelityRiskReason">
        <p className="metricLabel">Why This Combination Matters</p>
        <p>{note?.why_this_combination_matters ?? "Risk note is not available."}</p>
      </div>
    </div>
  );
}

function FidelityScores({ fidelityScores }) {
  if (!fidelityScores) {
    return <p className="metricLabel">Fidelity scores are not available yet.</p>;
  }

  const scoreEntries = Object.entries(fidelityScores).map(([key, value]) => [
    key,
    normalizeScoreEntry(key, value),
  ]);

  return (
    <div className="fidelityScoreGrid">
      {scoreEntries.map(([key, scoreDetail]) => (
        <article className="fidelityScoreCard" key={key}>
          <div className="fidelityScoreHeader">
            <div>
              <p className="metricLabel">{formatLabel(key)}</p>
              <h3>{scoreDetail.label}</h3>
            </div>
            <ScoreBadge
              label={`${scoreDetail.score ?? "?"}/5`}
              tone={scoreTone(scoreDetail.score)}
            />
          </div>

          <p>{scoreDetail.explanation}</p>

          <div>
            <p className="fidelityMiniLabel">Detected Evidence</p>
            <div className="fidelityChipRow">
              <ChipList
                emptyLabel="No direct evidence captured"
                items={scoreDetail.evidence}
              />
            </div>
          </div>

          <div>
            <p className="fidelityMiniLabel">Risk Flags</p>
            <div className="fidelityChipRow">
              <ChipList
                emptyLabel="No priority risk flag"
                items={scoreDetail.risks}
                tone="risk"
              />
            </div>
          </div>

          <div>
            <p className="fidelityMiniLabel">Recommended Fix</p>
            <p>{scoreDetail.recommended_fix}</p>
          </div>

          <div>
            <p className="fidelityMiniLabel">Anchor Justification</p>
            <p>{scoreDetail.anchor_justification}</p>
          </div>
        </article>
      ))}
      {scoreEntries.length === 0 && (
        <p className="metricLabel">Fidelity scores are not available yet.</p>
      )}
    </div>
  );
}

function averageScore(scores) {
  const values = Object.values(scores ?? {})
    .map(valueScore)
    .filter(Number.isFinite);

  if (values.length === 0) {
    return undefined;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function MethodologyProfile({ profile }) {
  if (!profile) {
    return null;
  }

  return (
    <div className="metricGrid">
      <div className="metric">
        <p className="metricLabel">Detected Methodology</p>
        <p className="metricValue">{formatLabel(profile.detected_methodology)}</p>
      </div>
      <div className="metric">
        <p className="metricLabel">Causal Permission</p>
        <p className="metricValue">{formatLabel(profile.causal_permission_level)}</p>
      </div>
      <div className="metric">
        <p className="metricLabel">Generalizability</p>
        <p className="metricValue">{formatLabel(profile.generalizability_level)}</p>
      </div>
    </div>
  );
}

export default function FidelityTab({ result, findings, fidelityScores }) {
  if (!hasAnalysisResult(result)) {
    return (
      <Card title="Fidelity" action={<ScoreBadge label="Pending" />}>
        <div className="empty-state">
          <h2>Fidelity Analysis</h2>
          <p>
            Run Analyze Text or Generate Document to generate single-input
            fidelity scores.
          </p>
        </div>
      </Card>
    );
  }

  const resolvedFindings =
    findings ?? result?.cross_method_consistency_findings ?? {};
  const resolvedScores = fidelityScores ?? result?.fidelity_scores;
  const average = averageScore(resolvedScores);

  return (
    <Card
      title="Fidelity"
      action={
        <ScoreBadge
          label={average ? `${average.toFixed(1)}/5` : "Pending"}
          tone={scoreTone(average)}
        />
      }
    >
      <MethodologyProfile profile={result?.methodology_profile} />
      <ScoringLegend />
      <RiskNotePanel result={result} />
      <FidelityScores fidelityScores={resolvedScores} />
      <FindingList findings={resolvedFindings} />
    </Card>
  );
}
