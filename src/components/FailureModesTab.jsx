import Card from "./Card.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function TextList({ title, items }) {
  const values = Array.isArray(items)
    ? items
    : String(items ?? "")
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean);

  if (values.length === 0) {
    return null;
  }

  return (
    <>
      <p className="metricLabel">{title}</p>
      <ul>
        {values.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </>
  );
}

export default function FailureModesTab({ result, failureModes }) {
  const modes = failureModes ?? result?.failure_modes ?? [];

  return (
    <Card title="Failure Modes" action={<ScoreBadge label={`${modes.length} found`} />}>
      {modes.length > 0 ? (
        <div className="sampleGrid">
          {modes.map((mode, index) => (
            <article className="metric" key={mode.failure_mode ?? mode.id ?? index}>
              <div className="cardHeader">
                <h3 className="cardTitle">
                  {formatLabel(mode.failure_mode ?? mode.title)}
                </h3>
                <ScoreBadge label={formatLabel(mode.risk_level ?? mode.severity)} />
              </div>
              <p>{mode.why_it_matters ?? mode.rationale}</p>
              <TextList
                title="Evidence"
                items={mode.evidence_from_text ?? mode.evidence}
              />
              <TextList
                title="Recommended Fix"
                items={mode.recommended_fix ?? mode.safeguards}
              />
            </article>
          ))}
        </div>
      ) : (
        <p className="metricLabel">No failure modes detected.</p>
      )}
    </Card>
  );
}
