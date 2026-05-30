import Card from "./Card.jsx";
import ReadableReport from "./ReadableReport.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

export default function GeneratedOutputTab({ result, selectedPaper }) {
  const generatedOutput = result?.generated_output;

  return (
    <Card
      title="Generated Output"
      action={<ScoreBadge label={generatedOutput?.text ? "Ready" : "Pending"} />}
    >
      {generatedOutput?.text ? (
        <>
          <ReadableReport result={result} selectedPaper={selectedPaper} />
          <details className="rawOutputDetails">
            <summary>Show raw generated text</summary>
            <pre className="generatedOutputText">{generatedOutput.text}</pre>
          </details>
        </>
      ) : (
        <p className="metricLabel">
          Run an analysis to generate a practitioner-facing output.
        </p>
      )}
    </Card>
  );
}
