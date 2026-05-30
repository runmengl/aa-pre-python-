import { useState } from "react";
import InputPanel from "./components/InputPanel.jsx";
import PaperSearch from "./components/PaperSearch.jsx";
import SampleTextButtons from "./components/SampleTextButtons.jsx";
import ResultsTabs from "./components/ResultsTabs.jsx";
import { analyzeText } from "./logic/analyzeText.js";
import { buildReadableDocument } from "./logic/buildReadableDocument.js";
import { logGenerationEvent } from "./utils/generationLogger.js";
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
  const [selectedPaper, setSelectedPaper] = useState(null);

  function handleTextChange(nextText) {
    setText(nextText);
    setSelectedSampleId(null);
    setSelectedPaper(null);
    setResult(null);
  }

  function handleSampleSelect(sample) {
    setText(sample.text);
    setExpectedMethodology(sample.methodology ?? "auto_detect");
    setSelectedSampleId(sample.id);
    setSelectedPaper(null);
    setResult(null);
  }

  function handleUsePaper(paper) {
    setText(paper.research_text);
    setExpectedMethodology(paper.methodology);
    setSelectedPaper(paper);
    setSelectedSampleId(null);
    setResult(null);
    console.log("Use This Paper selected", {
      paperId: paper.id,
      title: paper.title,
      methodology: paper.methodology,
    });
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
    console.log("Analyze Text clicked", {
      textLength: text.length,
      expectedMethodology,
      outputType,
      targetAudience,
    });

    const analysis = analyzeText({
      text,
      expectedMethodology,
      outputType,
      targetAudience,
    });

    console.log("Analysis result", analysis);
    setResult(analysis);
  }

  function handleGenerateOutput() {
    console.log("Generate Output clicked", {
      textLength: text.length,
      expectedMethodology,
      outputType,
      targetAudience,
    });

    const analysis = analyzeText({
      text,
      expectedMethodology,
      outputType,
      targetAudience,
    });

    console.log("Generated output result", analysis.generated_output);
    setResult(analysis);
  }

  function handleGenerateDocument() {
    console.log("Generate Document clicked", {
      textLength: text.length,
      expectedMethodology,
      outputType,
      targetAudience,
    });

    const analysis = analyzeText({
      text,
      expectedMethodology,
      outputType,
      targetAudience,
    });
    const document = buildReadableDocument({
      analysis,
      text,
      expectedMethodology,
      outputType,
      targetAudience,
      selectedPaper,
    });
    const nextResult = {
      ...analysis,
      generated_document: document,
    };

    setResult(nextResult);

    void logGenerationEvent({
      event: "Generate Document",
      methodology: document.metadata.methodology,
      outputType: document.metadata.output_type,
      targetAudience: document.metadata.target_audience,
      workflowTrace: analysis.workflow_trace,
      fidelityScores: analysis.fidelity_scores,
      failureModes: analysis.failure_modes,
      generatedDocumentTitle: document.title,
    });
  }

  return (
    <main className="app">
      <header className="appHeader">
        <p className="eyebrow">AI Review Desk</p>
        <h1>AI Playbook Consistency & Failure Mode Analyzer</h1>
      </header>

      <section className="workspace" aria-label="Analyzer workspace">
        <div className="inputColumn">
          <PaperSearch onUsePaper={handleUsePaper} />
          <InputPanel
            value={text}
            onTextChange={handleTextChange}
            onAnalyze={handleAnalyze}
            onGenerateOutput={handleGenerateOutput}
            onGenerateDocument={handleGenerateDocument}
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
        <ResultsTabs result={result} selectedPaper={selectedPaper} />
      </section>
    </main>
  );
}
