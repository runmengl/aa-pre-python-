function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function listItems(items, fallback = "None detected.") {
  const values = Array.isArray(items)
    ? items.filter(Boolean)
    : String(items ?? "")
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean);

  if (values.length === 0) {
    return `- ${fallback}`;
  }

  return values.map((item) => `- ${item}`).join("\n");
}

function formatScoreValue(value) {
  if (Number.isFinite(Number(value?.score))) {
    return `${value.score}/5 - ${value.label}. ${value.explanation}`;
  }

  if (Number.isFinite(Number(value))) {
    return `${value}/5`;
  }

  return String(value ?? "Not scored");
}

function metadataRows(metadata) {
  return [
    ["Methodology", formatLabel(metadata.methodology)],
    ["Output Type", formatLabel(metadata.output_type)],
    ["Target Audience", formatLabel(metadata.target_audience)],
    ["Paper Title", metadata.paper_title || "Pasted research text"],
    ["Generated At", metadata.generated_at],
  ];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const generatedOutputHeadings = new Set([
  "Title",
  "Audience",
  "Methodology Note",
  "Issue",
  "Key Message",
  "Evidence-Based Summary",
  "Implications",
  "Caution / Limitations",
  "Evidence Summary",
  "Policy Implications",
  "Recommended Actions",
  "Limitations and Fidelity Note",
  "To",
  "From",
  "Subject",
  "Summary",
  "Background",
  "Analysis",
  "Recommendation",
  "Evidence Limit",
  "Overview",
  "Main Finding",
  "Key Findings",
  "Practical Meaning",
  "Methodological Caution",
  "Limitation",
  "Study Focus",
  "Evidence Type",
  "Key Takeaways",
  "What This Does Not Prove",
  "What the study looked at",
  "What it found",
  "What it does not prove",
  "Why it matters",
  "Practical Use",
  "Opening sentence",
  "Short opening line",
  "Three bullet takeaways",
  "3 bullet points",
  "Caution sentence",
  "Hashtags",
  "Conditions",
  "Inputs / Conditions",
  "Possible Process Links",
  "Possible Mechanisms",
  "Observed Themes or Outcomes",
  "Observed or Suggested Outcomes",
  "Causality Warning",
  "Policy or Practice Use",
  "Limitations",
  "Methodology",
  "Inference Rules",
  "Extracted Evidence",
  "Rewritten Evidence Statement",
  "Fidelity Risks",
  "Fidelity Warning",
  "Review Notes",
]);

function markdownToHtml(markdown) {
  const lines = String(markdown ?? "").split("\n");
  const html = [];
  let listItemsOpen = false;

  function closeList() {
    if (listItemsOpen) {
      html.push("</ul>");
      listItemsOpen = false;
    }
  }

  lines.forEach((line) => {
    if (line.startsWith("# ")) {
      closeList();
      html.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      return;
    }

    if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      return;
    }

    if (generatedOutputHeadings.has(line.trim())) {
      closeList();
      html.push(`<h3>${escapeHtml(line.trim())}</h3>`);
      return;
    }

    if (line.startsWith("- ")) {
      if (!listItemsOpen) {
        html.push("<ul>");
        listItemsOpen = true;
      }
      html.push(`<li>${escapeHtml(line.slice(2))}</li>`);
      return;
    }

    if (!line.trim()) {
      closeList();
      return;
    }

    closeList();
    html.push(`<p>${escapeHtml(line)}</p>`);
  });

  closeList();
  return `<article class="generated-document-export">\n${html.join("\n")}\n</article>`;
}

function plainTextFromMarkdown(markdown) {
  return String(markdown ?? "")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^- /gm, "- ");
}

export function buildReadableDocument({
  analysis,
  expectedMethodology,
  outputType,
  targetAudience,
  selectedPaper,
} = {}) {
  const generatedAt = new Date().toISOString();
  const title = "AI Playbook Generated Document";
  const subtitle = "Method-bounded practitioner report";
  const metadata = {
    methodology:
      analysis?.generated_output?.methodology ??
      expectedMethodology ??
      analysis?.methodology_profile?.detected_methodology ??
      "",
    output_type: analysis?.generated_output?.output_type ?? outputType ?? "",
    target_audience:
      analysis?.generated_output?.target_audience ?? targetAudience ?? "",
    paper_title: selectedPaper?.title ?? "",
    generated_at: generatedAt,
  };
  const profile = analysis?.methodology_profile ?? {};
  const findings = analysis?.cross_method_consistency_findings ?? {};
  const scores = analysis?.fidelity_scores ?? {};
  const failureModes = analysis?.failure_modes ?? [];
  const sourceLines = [
    `- Title: ${selectedPaper?.title ?? "Pasted research text"}`,
    `- Authors: ${selectedPaper?.authors ?? "Not provided"}`,
    `- Year: ${selectedPaper?.year ?? "Not provided"}`,
    `- Methodology: ${formatLabel(metadata.methodology)}`,
    `- Target Audience: ${formatLabel(metadata.target_audience)}`,
    `- Output Type: ${formatLabel(metadata.output_type)}`,
  ].join("\n");
  const scoreLines = Object.entries(scores)
    .map(([key, value]) => `- ${formatLabel(key)}: ${formatScoreValue(value)}`)
    .join("\n");
  const findingLines = Object.entries(findings)
    .map(([key, value]) => `- ${formatLabel(key)}: ${value}`)
    .join("\n");
  const failureLines =
    failureModes.length > 0
      ? failureModes
          .map(
            (failureMode) =>
              `- ${formatLabel(failureMode.failure_mode)} (${formatLabel(
                failureMode.risk_level,
              )}): ${failureMode.recommended_fix}`,
          )
          .join("\n")
      : "- No priority failure mode warnings were detected.";

  const markdown = `# ${title}

${subtitle}

## Paper / Source
${sourceLines}

## Purpose
This document converts the selected research text into a readable practitioner-facing report while keeping method limits, fidelity risks, and failure mode warnings visible for review.

## Generated Practitioner Output
${analysis?.generated_output?.text ?? "No generated output is available."}

## Evidence Summary
Main claims:
${listItems(analysis?.evidence_summary?.main_claims)}

Possible causal claims:
${listItems(analysis?.evidence_summary?.possible_causal_claims)}

Limitations found:
${listItems(analysis?.evidence_summary?.limitations_found)}

## Methodology Interpretation
${formatLabel(metadata.methodology)} evidence allows: ${
    profile.allowed_inference_types?.join(", ") || "not specified"
  }.
It forbids or restricts: ${
    profile.forbidden_inference_types?.join(", ") || "not specified"
  }.

## Cross-Method Consistency Findings
${findingLines || "- No consistency findings are available."}

## Fidelity Scores
${scoreLines || "- No fidelity scores are available."}

## Failure Mode Warnings
${failureLines}

## Limitations and Ethical Considerations
This tool does not verify whether the original paper or pasted source is true. Human review is required before policy use. Causal language, scope conditions, implementation feasibility, and affected stakeholders must be checked before using this document for decisions.

## Capstone Talking Points
${analysis?.capstone_summary ?? "No Capstone talking points are available."}`;

  return {
    title,
    subtitle,
    metadata,
    markdown,
    html: markdownToHtml(markdown),
    plain_text: plainTextFromMarkdown(markdown),
  };
}
