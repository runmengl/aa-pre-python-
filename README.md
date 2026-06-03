# Policy Crawler and Analyzer

A browser-based tool for policy source discovery, PDF/file analysis, fidelity scoring, consistency testing, failure mode detection, and audience-adapted document generation.

Policy Crawler and Analyzer is a single-page React + Vite app for reviewing whether a policy-facing generated output stays faithful to its stated research methodology. It checks visible evidence, methodology alignment, likely failure modes, fidelity scores, and capstone-ready talking points without calling any external model or API.

## Project Purpose

The app helps students and reviewers compare an output against methodological constraints such as causal permission, generalizability, evidence strength, and output-risk safeguards. It is designed for classroom review, capstone preparation, and repeatable critique of AI-assisted writing.

## How to Run the React App

Install Node.js first, then install dependencies:

```bash
npm install
```

Start the local Vite development server:

```bash
npm run dev
```

Vite will start the dev server and open the app in your default browser.

To run the React app together with the local terminal logging server, use:

```bash
npm run dev:full
```

That command starts the browser app and the local Node logging server used by the Generate Document demo.

## Use Sample Texts

Seven sample texts are defined in `src/data/sampleTexts.js`:

- `quantitative`
- `qualitative`
- `mixed_methods`
- `theoretical`
- `experimental`
- `meta_analysis`
- `systematic_review`

Use these samples to test how the analyzer handles different evidence standards. In the UI, sample buttons can load a text into the input panel; then choose or confirm the expected methodology and output type, run the analysis, and review the Workflow, Consistency, Failure Modes, and Capstone Talking Points sections.

## No External API Required

The analyzer is deterministic JavaScript. It does not send text to OpenAI, a remote model, or any third-party service. All rules, sample texts, and analysis functions live inside the project source code.

## Capstone Support

This tool supports Capstone requirement 2 by making the research methodology explicit and showing whether output claims match the allowed inference type.

It supports Capstone requirement 3 by extracting evidence signals, surfacing cross-method consistency findings, and showing where claims need caveats or stronger support.

It supports Capstone requirement 5 by generating a capstone summary with talking points, reviewer questions, and recommended next steps that can guide final presentation or reflection.
