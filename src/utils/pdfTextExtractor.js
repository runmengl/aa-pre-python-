import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

function normalizePdfText(text) {
  return String(text ?? "")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isPdfFile(file) {
  const fileName = String(file?.name ?? "").toLowerCase();

  return file?.type === "application/pdf" || fileName.endsWith(".pdf");
}

function textItemString(item) {
  return typeof item?.str === "string" ? item.str : "";
}

function textContentToPageText(textContent) {
  return normalizePdfText(
    (textContent?.items ?? [])
      .map((item) => {
        const value = textItemString(item);

        if (!value) {
          return item?.hasEOL ? "\n" : "";
        }

        return item.hasEOL ? `${value}\n` : `${value} `;
      })
      .join(""),
  );
}

function wordCount(text) {
  const words = normalizePdfText(text).match(/\S+/g);

  return words ? words.length : 0;
}

export async function extractPdfText(file) {
  if (!file) {
    throw new Error("Choose a PDF file before extracting text.");
  }

  if (!isPdfFile(file)) {
    throw new Error("The selected file must be a PDF.");
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  let pdfDocument;

  try {
    pdfDocument = await loadingTask.promise;
    const pageTexts = [];

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContentToPageText(textContent);

      if (pageText) {
        pageTexts.push(pageText);
      }

      page.cleanup();
    }

    const text = normalizePdfText(pageTexts.join("\n\n"));

    if (!text) {
      throw new Error(
        "No selectable text was found. This tool supports text-based PDFs only.",
      );
    }

    return {
      text,
      page_count: pdfDocument.numPages,
      word_count: wordCount(text),
      character_count: text.length,
    };
  } finally {
    await pdfDocument?.destroy?.();
  }
}
