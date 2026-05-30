import Card from "./Card.jsx";

function SelectControl({ id, label, value, options, onChange }) {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <label className="metric" htmlFor={id}>
      <span className="metricLabel">{label}</span>
      <select
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function InputPanel({
  value,
  defaultValue = "",
  onTextChange,
  onAnalyze,
  onGenerateOutput,
  onGenerateDocument,
  expectedMethodology,
  onExpectedMethodologyChange,
  methodologyOptions = [],
  outputType,
  onOutputTypeChange,
  outputTypeOptions = [],
  targetAudience,
  onTargetAudienceChange,
  targetAudienceOptions = [],
  placeholder = "Paste playbook output here...",
  title = "Input",
  analyzeLabel = "Analyze Text",
  generateLabel = "Generate Output",
  generateDocumentLabel = "Generate Document",
  disabled = false,
}) {
  const textareaProps =
    value === undefined
      ? { defaultValue }
      : {
          value,
          readOnly: !onTextChange,
        };

  return (
    <Card title={title}>
      <label className="inputLabel" htmlFor="research-text">
        Research Text
      </label>
      <textarea
        className="textInput"
        id="research-text"
        aria-label="Research Text"
        disabled={disabled}
        onChange={(event) => onTextChange?.(event.target.value)}
        placeholder={placeholder}
        {...textareaProps}
      />

      {(methodologyOptions.length > 0 ||
        outputTypeOptions.length > 0 ||
        targetAudienceOptions.length > 0 ||
        onAnalyze ||
        onGenerateOutput ||
        onGenerateDocument) && (
        <div className="inputControls">
          <SelectControl
            id="expected-methodology"
            label="Expected Methodology"
            value={expectedMethodology}
            options={methodologyOptions}
            onChange={onExpectedMethodologyChange}
          />
          <SelectControl
            id="output-type"
            label="Desired Output Type"
            value={outputType}
            options={outputTypeOptions}
            onChange={onOutputTypeChange}
          />
          <SelectControl
            id="target-audience"
            label="Target Audience"
            value={targetAudience}
            options={targetAudienceOptions}
            onChange={onTargetAudienceChange}
          />
          {onAnalyze && (
            <button
              className="analyzeButton"
              disabled={disabled}
              onClick={onAnalyze}
              type="button"
            >
              {analyzeLabel}
            </button>
          )}
          {onGenerateOutput && (
            <button
              className="sampleButton"
              disabled={disabled}
              onClick={onGenerateOutput}
              type="button"
            >
              {generateLabel}
            </button>
          )}
          {onGenerateDocument && (
            <button
              className="documentButton"
              disabled={disabled}
              onClick={onGenerateDocument}
              type="button"
            >
              {generateDocumentLabel}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
