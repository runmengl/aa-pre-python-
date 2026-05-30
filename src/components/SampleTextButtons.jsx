import { sampleTexts } from "../data/sampleTexts.js";
import Card from "./Card.jsx";

export default function SampleTextButtons({
  samples = sampleTexts,
  onSelectSample,
  selectedSampleId,
  title = "Samples",
}) {
  return (
    <Card title={title}>
      <div className="sampleGrid">
        {samples.map((sample) => (
          <button
            aria-pressed={selectedSampleId === sample.id}
            className="sampleButton"
            key={sample.id}
            onClick={() => onSelectSample?.(sample)}
            type="button"
          >
            {sample.label}
          </button>
        ))}
        {samples.length === 0 && (
          <p className="metricLabel">No sample texts are available.</p>
        )}
      </div>
    </Card>
  );
}
