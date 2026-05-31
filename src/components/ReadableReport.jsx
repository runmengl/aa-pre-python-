import ScoreBadge from "./ScoreBadge.jsx";

const sectionHeadings = new Set([
  "Title",
  "Audience",
  "Methodology Note",
  "Issue",
  "Evidence Summary",
  "Policy Implications",
  "Recommended Actions",
  "Limitations and Fidelity Note",
  "To",
  "From",
  "Subject",
  "Background",
  "Analysis",
  "Recommendation",
  "Overview",
  "Key Findings",
  "Practical Meaning",
  "Methodological Caution",
  "Study Focus",
  "Evidence Type",
  "Key Takeaways",
  "What This Does Not Prove",
  "Practical Use",
  "Opening sentence",
  "Three bullet takeaways",
  "Caution sentence",
  "Hashtags",
  "Inputs / Conditions",
  "Possible Mechanisms",
  "Observed or Suggested Outcomes",
  "Causality Warning",
  "Policy or Practice Use",
  "Limitations",
  "Methodology",
  "Inference Rules",
  "Extracted Evidence",
  "Fidelity Risks",
  "Review Notes",
  "Limitation Note",
  "Fidelity Note",
]);

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function averageScore(scores) {
  const values = Object.values(scores ?? {})
    .map(Number)
    .filter(Number.isFinite);

  if (values.length === 0) {
    return undefined;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function documentBlocks(text) {
  const blocks = [];
  let listItems = [];

  function flushList() {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  }

  String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .forEach((line) => {
      if (!line) {
        flushList();
        return;
      }

      if (line.startsWith("- ")) {
        listItems.push(line.slice(2));
        return;
      }

      flushList();
      blocks.push({
        type: sectionHeadings.has(line) ? "heading" : "paragraph",
        text: line,
      });
    });

  flushList();
  return blocks;
}

function GeneratedDocument({ text }) {
  const blocks = documentBlocks(text);

  return (
    <article className="readableDocument">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return <h3 key={`${block.text}-${index}`}>{block.text}</h3>;
        }

        if (block.type === "list") {
          return (
            <ul key={`list-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }

        return <p key={`${block.text}-${index}`}>{block.text}</p>;
      })}
    </article>
  );
}

export default function ReadableReport({ result, selectedPaper }) {
  const generatedOutput = result?.generated_output;
  const scores = result?.fidelity_scores ?? {};
  const failureModes = result?.failure_modes ?? [];

  if (!generatedOutput?.text) {
    return (
      <p className="metricLabel">
        Run an analysis to generate a practitioner-facing output.
      </p>
    );
  }

  return (
    <div className="readableReport">
      <div className="reportMetaGrid">
        {selectedPaper && (
          <div className="metric">
            <p className="metricLabel">Paper Title</p>
            <p className="reportMetaValue">{selectedPaper.title}</p>
          </div>
        )}
        <div className="metric">
          <p className="metricLabel">Methodology</p>
          <p className="reportMetaValue">{formatLabel(generatedOutput.methodology)}</p>
        </div>
        <div className="metric">
          <p className="metricLabel">Output Type</p>
          <p className="reportMetaValue">{formatLabel(generatedOutput.output_type)}</p>
        </div>
        <div className="metric">
          <p className="metricLabel">Target Audience</p>
          <p className="reportMetaValue">
            {formatLabel(generatedOutput.target_audience)}
          </p>
        </div>
      </div>

      <section>
        <h3 className="reportSectionTitle">Generated Document Text</h3>
        <GeneratedDocument text={generatedOutput.text} />
      </section>

      <section>
        <div className="reportSectionHeader">
          <h3 className="reportSectionTitle">Fidelity Scores Summary</h3>
          <ScoreBadge score={averageScore(scores)} />
        </div>
        <div className="scoreSummaryGrid">
          {Object.entries(scores).map(([key, value]) => (
            <div className="scoreSummaryItem" key={key}>
              <span>{formatLabel(key)}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="reportSectionTitle">Failure Mode Warnings</h3>
        {failureModes.length > 0 ? (
          <ul className="placeholderList">
            {failureModes.map((mode, index) => (
              <li key={mode.failure_mode ?? index}>
                <strong>{formatLabel(mode.failure_mode)}:</strong>{" "}
                {mode.recommended_fix}
              </li>
            ))}
          </ul>
        ) : (
          <p>No priority failure mode warnings were detected.</p>
        )}
      </section>

      <section>
        <h3 className="reportSectionTitle">Capstone Talking Points</h3>
        <p>{result?.capstone_summary}</p>
      </section>
    </div>
  );
}
