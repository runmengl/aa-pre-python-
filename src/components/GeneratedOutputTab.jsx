import Card from "./Card.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function GeneratedOutputTab({ result }) {
  const generatedOutput = result?.generated_output;

  return (
    <Card
      title="Generated Output"
      action={<ScoreBadge label={generatedOutput?.text ? "Ready" : "Pending"} />}
    >
      {generatedOutput?.text ? (
        <>
          <div className="metricGrid">
            <div className="metric">
              <p className="metricLabel">Methodology</p>
              <p className="metricValue">{formatLabel(generatedOutput.methodology)}</p>
            </div>
            <div className="metric">
              <p className="metricLabel">Output Type</p>
              <p className="metricValue">{formatLabel(generatedOutput.output_type)}</p>
            </div>
            <div className="metric">
              <p className="metricLabel">Target Audience</p>
              <p className="metricValue">
                {formatLabel(generatedOutput.target_audience)}
              </p>
            </div>
          </div>
          <pre className="generatedOutputText">{generatedOutput.text}</pre>
        </>
      ) : (
        <p className="metricLabel">
          Run an analysis to generate a practitioner-facing output.
        </p>
      )}
    </Card>
  );
}
