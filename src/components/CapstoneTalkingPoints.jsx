import Card from "./Card.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

export default function CapstoneTalkingPoints({ result, capstoneSummary }) {
  const summary = capstoneSummary ?? result?.capstone_summary;

  return (
    <Card
      title="Capstone Talking Points"
      action={<ScoreBadge label={summary ? "Ready" : "Pending"} />}
    >
      {summary ? (
        <p>{summary}</p>
      ) : (
        <p className="metricLabel">Run an analysis to generate capstone talking points.</p>
      )}
    </Card>
  );
}
