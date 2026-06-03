# AGENTS.md

## Project Agent Instructions

This project is a React + Vite single-page web app called:

Policy Crawler and Analyzer

The app supports a Capstone demonstration for a public administration research translation project. It allows users to paste different types of research text and receive a standardized analysis output showing:

1. workflow trace,
2. cross-method consistency findings,
3. failure mode detection.

The app must remain deterministic and must not require an external API.

---

## Core Development Principles

Before making any code change, read and follow these principles:

1. Keep UI and analysis logic separate.
2. Do not put methodology rules inside React components.
3. Do not put JSX inside logic files.
4. Each function should do one thing.
5. The output JSON shape must remain stable.
6. Do not use external API calls.
7. Do not hard-code analysis results inside UI components.
8. Keep the app easy to explain in a classroom demonstration.
9. Preserve consistency across all methodology types.
10. Prefer small, modular files over one large file.

---

## Required Folder Structure

Use this structure unless explicitly asked to change it:

src/
  data/
    sampleTexts.js
    methodologyRules.js
    outputRiskRules.js

  logic/
    analyzeText.js
    detectMethodology.js
    extractEvidence.js
    detectFailureModes.js
    scoreFidelity.js
    buildCapstoneSummary.js

  components/
    InputPanel.jsx
    SampleTextButtons.jsx
    ResultsTabs.jsx
    WorkflowTab.jsx
    ConsistencyTab.jsx
    FailureModesTab.jsx
    CapstoneTalkingPoints.jsx
    Card.jsx
    ScoreBadge.jsx

  utils/
    textUtils.js
    constants.js

  App.jsx
  main.jsx
  styles.css

---

## Layer Responsibilities

### data/

The data folder stores static rules and sample text.

It may contain:
- methodology rules,
- output risk rules,
- sample input texts,
- static labels,
- dropdown options.

It should not contain React components.
It should not contain complex UI logic.

### logic/

The logic folder contains deterministic analysis functions.

It may contain:
- methodology detection,
- evidence extraction,
- failure mode detection,
- fidelity scoring,
- capstone summary generation,
- final analysis object construction.

It must not contain JSX.
It must not import React.
It must not depend on browser UI state.

### components/

The components folder contains React UI components.

Components should receive data through props.
Components should not contain methodology rules.
Components should not perform the main analysis logic.
Components should only display or collect information.

### App.jsx

App.jsx should only compose the page.

It may manage simple React state such as:
- input text,
- selected methodology,
- selected output type,
- analysis result.

It should call analyzeText() but should not contain the analysis logic itself.

---

## Stable Output Contract

The final analyzeText() function must always return this object shape:

{
  workflow_trace: {
    stage_1_input_validation: "",
    stage_2_methodology_classification: "",
    stage_3_evidence_extraction: "",
    stage_4_epistemological_interpretation: "",
    stage_5_output_risk_assessment: "",
    stage_6_fidelity_check: "",
    stage_7_consistency_analysis: "",
    stage_8_failure_mode_detection: ""
  },

  methodology_profile: {
    detected_methodology: "",
    allowed_inference_types: [],
    forbidden_inference_types: [],
    causal_permission_level: "",
    generalizability_level: "",
    recommended_language_controls: []
  },

  evidence_summary: {
    main_claims: [],
    possible_causal_claims: [],
    limitations_found: [],
    scope_conditions_found: [],
    missing_information: []
  },

  cross_method_consistency_findings: {
    claim_accuracy: "",
    causal_precision: "",
    scope_fidelity: "",
    method_transparency: "",
    nuance_preservation: "",
    audience_calibration: "",
    actionability: ""
  },

  failure_modes: [
    {
      failure_mode: "",
      risk_level: "",
      evidence_from_text: "",
      why_it_matters: "",
      recommended_fix: ""
    }
  ],

  fidelity_scores: {
    claim_accuracy: 0,
    causal_precision: 0,
    scope_fidelity: 0,
    method_transparency: 0,
    nuance_preservation: 0,
    audience_calibration: 0,
    actionability: 0
  },

  capstone_summary: ""
}

Do not rename these keys unless explicitly asked.
Do not remove fields from this structure.
Adding optional fields is allowed only if the original structure remains intact.

---

## Methodology Logic Rules

The app supports these methodology types:

quantitative
qualitative
mixed_methods
theoretical
experimental
meta_analysis
systematic_review
auto_detect

### Quantitative

Allowed inference:
- statistical association,
- descriptive patterns,
- limited prediction.

Forbidden inference:
- causality unless experimental or causal design is explicitly stated.

Main risks:
- causal overstatement,
- overgeneralization,
- missing sample limits.

### Qualitative

Allowed inference:
- themes,
- meanings,
- context-bound interpretations.

Forbidden inference:
- statistical generalization,
- universal causal claims.

Main risk:
- treating themes as measurable effects.

### Mixed Methods

Allowed inference:
- integrated qualitative and quantitative findings.

Forbidden inference:
- merging strands without explaining integration.

Main risk:
- losing one evidence strand.

### Theoretical

Allowed inference:
- conceptual argument,
- framework logic.

Forbidden inference:
- empirical claims unless evidence is provided.

Main risk:
- treating theory as tested evidence.

### Experimental

Allowed inference:
- bounded causal claims within treatment, sample, and setting.

Forbidden inference:
- broad generalization beyond design.

Main risk:
- external validity overstatement.

### Meta-analysis

Allowed inference:
- pooled effects,
- heterogeneity-aware interpretation.

Forbidden inference:
- treating pooled average as universal effect.

Main risk:
- ignoring heterogeneity.

### Systematic Review

Allowed inference:
- evidence patterns,
- gaps,
- synthesis.

Forbidden inference:
- causal proof unless review design supports it.

Main risk:
- turning literature patterns into causal claims.

---

## Failure Mode Detection Rules

Implement deterministic rule-based detection for these failure modes:

### causal_overstatement

Detect terms such as:
causes
leads to
proves
guarantees
results in

Flag this especially when the methodology is not experimental and the text does not explicitly mention causal design.

### missing_limitations

Flag when the text lacks terms such as:
limitation
constraint
scope
sample
context
generalizability

### scope_overgeneralization

Detect terms such as:
all agencies
always
universal
guaranteed
everyone

### unsupported_recommendation

Detect strong action language such as:
must
should implement
guarantee improvement

especially when the text lacks evidence markers such as:
evidence
findings
data
study
results
analysis
review

### method_mismatch

Compare selected methodology with language patterns.

Examples:
- selected qualitative but text uses regression/statistical language,
- selected theoretical but text claims empirical proof,
- selected systematic review but text uses direct causal language.

### mechanism_invention

If output type is mechanism_map, flag unsupported causal pathway language when causal evidence is not present.

---

## UI Requirements

The app should display results in three tabs:

1. Workflow Demonstration
2. Cross-Method Consistency
3. Failure Modes

The app should also show a:

Capstone Talking Points

box that converts the analysis into presentation-friendly language.

---

## Design Requirements

Use a clean academic dashboard style.

Prefer:
- cards,
- badges,
- tables,
- tabs,
- readable typography,
- clear headings,
- classroom-friendly contrast.

The interface should be easy to explain during a live Capstone demonstration.

---

## Prohibited Patterns

Avoid these patterns:

Putting all code in App.jsx
Putting methodology rules inside components
Putting React JSX inside logic files
Calling an external API
Changing the final output JSON shape
Hard-coding one sample result into the UI
Mixing UI state with analysis rules
Creating hidden behavior that is hard to explain

---

## Preferred Implementation Pattern

Use this flow:

User input
-> analyzeText()
-> detectMethodology()
-> extractEvidence()
-> detectFailureModes()
-> scoreFidelity()
-> buildCapstoneSummary()
-> stable JSON result
-> React components display the result

---

## Before Editing Checklist

Before making changes, verify:

1. Which layer does this change belong to?
2. Does it affect the stable output JSON shape?
3. Am I putting analysis logic in a UI component?
4. Am I putting JSX in a logic file?
5. Will this remain understandable for a classroom demo?
6. Does the change preserve deterministic behavior?

---

## After Editing Checklist

After making changes, verify:

1. The app still runs.
2. The analysis output still has the required object shape.
3. Sample texts still work.
4. The three result tabs still render.
5. Failure modes are generated from logic, not hard-coded UI.
6. No external API call was added.
