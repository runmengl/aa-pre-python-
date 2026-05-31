import Card from "./Card.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function GeneratedOutputTab({ result, selectedPaper }) {
  const generatedOutput = result?.generated_output;

  return (
    <Card
      title="Generated Output"
      action={<ScoreBadge label={generatedOutput?.text ? "Ready" : "Pending"} />}
    >
      {generatedOutput?.text ? (
        <div className="generatedOutputPanel">
          <div className="reportMetaGrid">
            {selectedPaper && (
              <div className="metric">
                <p className="metricLabel">Paper Title</p>
                <p className="reportMetaValue">{selectedPaper.title}</p>
              </div>
            )}
            <div className="metric">
              <p className="metricLabel">Output Type</p>
              <p className="reportMetaValue">
                {formatLabel(generatedOutput.output_type)}
              </p>
            </div>
            <div className="metric">
              <p className="metricLabel">Target Audience</p>
              <p className="reportMetaValue">
                {formatLabel(generatedOutput.target_audience)}
              </p>
            </div>
            <div className="metric">
              <p className="metricLabel">Methodology</p>
              <p className="reportMetaValue">
                {formatLabel(generatedOutput.methodology)}
              </p>
            </div>
          </div>

          <section>
            <h3 className="reportSectionTitle">Rewritten Output</h3>
            <pre className="generatedOutputText">{generatedOutput.text}</pre>
          </section>
        </div>
      ) : (
        <p className="metricLabel">
          Run an analysis to generate a practitioner-facing output.
        </p>
      )}
    </Card>
  );
}
