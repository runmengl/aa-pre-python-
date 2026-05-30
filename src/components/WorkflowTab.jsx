import Card from "./Card.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function WorkflowTab({ result, workflowTrace }) {
  const trace = workflowTrace ?? result?.workflow_trace;
  const rows = Array.isArray(trace)
    ? trace.map((item, index) => ({
        key: item.step ?? `step_${index + 1}`,
        step: item.step ?? `Step ${index + 1}`,
        detail: item.detail ?? "",
        status: item.status,
      }))
    : Object.entries(trace ?? {}).map(([step, detail]) => ({
        key: step,
        step,
        detail,
      }));

  return (
    <Card title="Workflow" action={<ScoreBadge label={`${rows.length} stages`} />}>
      {rows.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th scope="col">Step</th>
              <th scope="col">Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.key}>
                <th scope="row">{formatLabel(item.step)}</th>
                <td>
                  {item.status && (
                    <ScoreBadge label={formatLabel(item.status)} />
                  )}{" "}
                  {item.detail}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="metricLabel">Run an analysis to see the workflow trace.</p>
      )}
    </Card>
  );
}
