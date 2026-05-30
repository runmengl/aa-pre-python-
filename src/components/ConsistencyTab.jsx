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
        <li>No cross-method consistency findings detected.</li>
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

function FidelityScores({ fidelityScores }) {
  if (!fidelityScores) {
    return <p className="metricLabel">Fidelity scores are not available yet.</p>;
  }

  const scoreEntries = Object.entries(fidelityScores).filter(([, value]) =>
    Number.isFinite(Number(value)),
  );

  return (
    <div className="metricGrid">
      {scoreEntries.map(([key, score]) => (
        <div className="metric" key={key}>
          <p className="metricLabel">{formatLabel(key)}</p>
          <p className="metricValue">{score}</p>
        </div>
      ))}
      {scoreEntries.length === 0 && (
        <p className="metricLabel">Fidelity scores are not available yet.</p>
      )}
    </div>
  );
}

function averageScore(scores) {
  const values = Object.values(scores ?? {})
    .map(Number)
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

export default function ConsistencyTab({
  result,
  findings,
  fidelityScores,
}) {
  const resolvedFindings =
    findings ?? result?.cross_method_consistency_findings ?? {};
  const resolvedScores = fidelityScores ?? result?.fidelity_scores;

  return (
    <Card
      title="Consistency"
      action={<ScoreBadge score={averageScore(resolvedScores)} />}
    >
      <MethodologyProfile profile={result?.methodology_profile} />
      <FidelityScores fidelityScores={resolvedScores} />
      <FindingList findings={resolvedFindings} />
    </Card>
  );
}
