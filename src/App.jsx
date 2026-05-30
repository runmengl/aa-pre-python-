import { useState } from "react";
import InputPanel from "./components/InputPanel.jsx";
import SampleTextButtons from "./components/SampleTextButtons.jsx";
import ResultsTabs from "./components/ResultsTabs.jsx";
import { analyzeText } from "./logic/analyzeText.js";
import {
  methodologyOptions,
  outputTypeOptions,
  targetAudienceOptions,
} from "./utils/constants.js";

export default function App() {
  const [text, setText] = useState("");
  const [expectedMethodology, setExpectedMethodology] = useState("auto_detect");
  const [outputType, setOutputType] = useState("executive_summary");
  const [targetAudience, setTargetAudience] = useState("public_administrators");
  const [result, setResult] = useState(null);
  const [selectedSampleId, setSelectedSampleId] = useState(null);

  function handleTextChange(nextText) {
    setText(nextText);
    setSelectedSampleId(null);
    setResult(null);
  }

  function handleSampleSelect(sample) {
    setText(sample.text);
    setExpectedMethodology(sample.methodology ?? "auto_detect");
    setSelectedSampleId(sample.id);
    setResult(null);
  }

  function handleExpectedMethodologyChange(nextMethodology) {
    setExpectedMethodology(nextMethodology);
    setResult(null);
  }

  function handleOutputTypeChange(nextOutputType) {
    setOutputType(nextOutputType);
    setResult(null);
  }

  function handleTargetAudienceChange(nextTargetAudience) {
    setTargetAudience(nextTargetAudience);
    setResult(null);
  }

  function handleAnalyze() {
    setResult(
      analyzeText({
        text,
        expectedMethodology,
        outputType,
        targetAudience,
      }),
    );
  }

  return (
    <main className="app">
      <header className="appHeader">
        <p className="eyebrow">AI Review Desk</p>
        <h1>AI Playbook Consistency & Failure Mode Analyzer</h1>
      </header>

      <section className="workspace" aria-label="Analyzer workspace">
        <div className="inputColumn">
          <InputPanel
            value={text}
            onTextChange={handleTextChange}
            onAnalyze={handleAnalyze}
            expectedMethodology={expectedMethodology}
            onExpectedMethodologyChange={handleExpectedMethodologyChange}
            methodologyOptions={methodologyOptions}
            outputType={outputType}
            onOutputTypeChange={handleOutputTypeChange}
            outputTypeOptions={outputTypeOptions}
            targetAudience={targetAudience}
            onTargetAudienceChange={handleTargetAudienceChange}
            targetAudienceOptions={targetAudienceOptions}
          />
          <SampleTextButtons
            onSelectSample={handleSampleSelect}
            selectedSampleId={selectedSampleId}
          />
        </div>
        <ResultsTabs result={result} />
      </section>
    </main>
  );
}
