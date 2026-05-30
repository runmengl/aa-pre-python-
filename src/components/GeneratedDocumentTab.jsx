import Card from "./Card.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function GeneratedDocumentTab({ result }) {
  const document = result?.generated_document;

  return (
    <Card
      title="Generated Document"
      action={<ScoreBadge label={document ? "Ready" : "Pending"} />}
    >
      {document ? (
        <div className="generatedDocumentPanel">
          <div>
            <h3 className="documentPreviewTitle">{document.title}</h3>
            <p className="documentPreviewSubtitle">{document.subtitle}</p>
          </div>

          <div className="documentMetadataGrid">
            {Object.entries(document.metadata ?? {}).map(([key, value]) => (
              <div className="metric" key={key}>
                <p className="metricLabel">{formatLabel(key)}</p>
                <p className="reportMetaValue">{formatLabel(value)}</p>
              </div>
            ))}
          </div>

          <div
            className="generatedDocumentPreview"
            dangerouslySetInnerHTML={{ __html: document.html }}
          />
        </div>
      ) : (
        <p className="metricLabel">
          Click Generate Document to create a readable report and terminal log.
        </p>
      )}
    </Card>
  );
}
