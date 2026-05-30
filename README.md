# AI Playbook Consistency & Failure Mode Analyzer

AI Playbook Consistency & Failure Mode Analyzer is a single-page React + Vite app for reviewing whether an AI-generated playbook output stays faithful to its stated research methodology. It checks visible evidence, methodology alignment, likely failure modes, fidelity scores, and capstone-ready talking points without calling any external model or API.

## Project Purpose

The app helps students and reviewers compare an output against methodological constraints such as causal permission, generalizability, evidence strength, and output-risk safeguards. It is designed for classroom review, capstone preparation, and repeatable critique of AI-assisted writing.

## Install

Install Node.js first, then run:

```bash
npm install
```

## Run

Start the local Vite development server:

```bash
npm run dev
```

Vite will start the dev server and open the app in your default browser.

## One-command open

Install dependencies once:

```bash
npm install
```

Then open and run the app with:

```bash
npm run open
```

You can also use:

```bash
npm run dev
```

Both commands start the Vite dev server and should automatically open the app in your default browser.

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
