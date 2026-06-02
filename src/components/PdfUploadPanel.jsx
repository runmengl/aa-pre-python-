import { useState } from "react";
import { extractPdfText } from "../utils/pdfTextExtractor.js";
import Card from "./Card.jsx";

function formatFileSize(size) {
  if (!Number.isFinite(Number(size))) {
    return "";
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function formatMethodology(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PdfUploadPanel({
  detectedMethodology,
  onTextExtracted,
  onUseExtractedText,
  onAnalyzePdfText,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extraction, setExtraction] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const hasExtractedText = Boolean(extraction?.text?.trim());

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0] ?? null;

    setSelectedFile(nextFile);
    setExtraction(null);
    setStatus(nextFile ? `${nextFile.name} selected.` : "");
    setError("");
    onTextExtracted?.(null);
  }

  async function handleExtractPdfText() {
    if (!selectedFile || isExtracting) {
      return;
    }

    setIsExtracting(true);
    setError("");
    setStatus("Extracting PDF text...");

    try {
      const extracted = await extractPdfText(selectedFile);
      const nextExtraction = {
        ...extracted,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
      };

      setExtraction(nextExtraction);
      setStatus(
        `Extracted ${nextExtraction.word_count} words from ${nextExtraction.page_count} page(s).`,
      );
      onTextExtracted?.(nextExtraction);
    } catch (nextError) {
      setExtraction(null);
      setError(nextError?.message ?? "PDF text extraction failed.");
      setStatus("");
      onTextExtracted?.(null);
    } finally {
      setIsExtracting(false);
    }
  }

  function handleUseExtractedText() {
    if (hasExtractedText) {
      onUseExtractedText?.(extraction);
    }
  }

  function handleAnalyzePdfText() {
    if (hasExtractedText) {
      onAnalyzePdfText?.(extraction);
    }
  }

  return (
    <Card title="PDF Upload">
      <div className="pdfUploadGrid">
        <label className="inputLabel" htmlFor="pdf-upload">
          PDF File
        </label>
        <input
          accept="application/pdf,.pdf"
          className="fileInput"
          id="pdf-upload"
          onChange={handleFileChange}
          type="file"
        />

        {selectedFile && (
          <div className="pdfFileMeta" aria-live="polite">
            <span>{selectedFile.name}</span>
            <span>{formatFileSize(selectedFile.size)}</span>
          </div>
        )}

        <div className="pdfActionRow">
          <button
            className="sampleButton"
            disabled={!selectedFile || isExtracting}
            onClick={handleExtractPdfText}
            type="button"
          >
            Extract PDF Text
          </button>
          <button
            className="sampleButton"
            disabled={!hasExtractedText || isExtracting}
            onClick={handleUseExtractedText}
            type="button"
          >
            Use Extracted Text
          </button>
          <button
            className="analyzeButton"
            disabled={!hasExtractedText || isExtracting}
            onClick={handleAnalyzePdfText}
            type="button"
          >
            Analyze PDF Text
          </button>
        </div>

        {status && (
          <p className="pdfStatus" data-tone="success" aria-live="polite">
            {status}
          </p>
        )}
        {error && (
          <p className="pdfStatus" data-tone="error" aria-live="assertive">
            {error}
          </p>
        )}

        {hasExtractedText && (
          <>
            <div className="pdfMetaGrid">
              <article className="metric">
                <p className="metricLabel">Detected Methodology</p>
                <p className="reportMetaValue">
                  {formatMethodology(detectedMethodology || "auto_detect")}
                </p>
              </article>
              <article className="metric">
                <p className="metricLabel">PDF Pages</p>
                <p className="reportMetaValue">{extraction.page_count}</p>
              </article>
              <article className="metric">
                <p className="metricLabel">Extracted Words</p>
                <p className="reportMetaValue">{extraction.word_count}</p>
              </article>
            </div>

            <label className="inputLabel" htmlFor="pdf-extracted-preview">
              Extracted Text Preview
            </label>
            <textarea
              className="pdfPreview"
              id="pdf-extracted-preview"
              readOnly
              value={extraction.text}
            />
          </>
        )}
      </div>
    </Card>
  );
}
