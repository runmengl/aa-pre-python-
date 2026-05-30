export const outputRiskRules = {
  policy_brief: {
    label: "Policy Brief",
    riskLevel: "high",
    safeguards: [
      "Separate evidence-backed findings from recommendations.",
      "State target population, decision context, and uncertainty.",
      "Avoid causal or cost-benefit claims that exceed the source methodology.",
      "Include implementation tradeoffs and affected stakeholders.",
    ],
  },
  policy_memo: {
    label: "Policy Memo",
    riskLevel: "high",
    safeguards: [
      "Name the decision owner and the decision the memo supports.",
      "Use confidence levels for claims that drive action.",
      "Flag assumptions, unresolved evidence gaps, and legal or operational dependencies.",
      "Keep recommended actions traceable to cited evidence.",
    ],
  },
  executive_summary: {
    label: "Executive Summary",
    riskLevel: "medium",
    safeguards: [
      "Preserve key caveats when compressing detail.",
      "Avoid converting nuanced evidence into overconfident takeaways.",
      "Highlight decision-relevant limits and next checks.",
      "Keep metrics tied to their denominator, timeframe, and source.",
    ],
  },
  fact_sheet: {
    label: "Fact Sheet",
    riskLevel: "medium",
    safeguards: [
      "Use only claims that can be directly sourced.",
      "Avoid interpretation-heavy statements in numeric callouts.",
      "Include dates, sample sizes, and definitions beside statistics.",
      "Mark estimates, projections, and preliminary findings clearly.",
    ],
  },
  linkedin_post: {
    label: "LinkedIn Post",
    riskLevel: "medium-high",
    safeguards: [
      "Do not turn limited evidence into universal advice.",
      "Preserve caveats in plain language.",
      "Avoid sensational claims, inflated certainty, and unsupported causal hooks.",
      "Keep promotional framing separate from empirical claims.",
    ],
  },
  mechanism_map: {
    label: "Mechanism Map",
    riskLevel: "medium",
    safeguards: [
      "Label hypothesized, observed, and validated links distinctly.",
      "Avoid implying causal direction unless the evidence supports it.",
      "Show boundary conditions and missing links.",
      "Keep mechanisms tied to the methodology that supports each link.",
    ],
  },
  technical_note: {
    label: "Technical Note",
    riskLevel: "medium",
    safeguards: [
      "Document assumptions, data sources, and analytic choices.",
      "Distinguish implementation detail from validated finding.",
      "Include limitations that affect replication or interpretation.",
      "Avoid hiding material uncertainty in appendices only.",
    ],
  },
};
