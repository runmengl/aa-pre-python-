const audienceGuidance = {
  policymakers: {
    label: "policymakers",
    focus: "decision relevance, policy options, and policy caution",
    action: "Compare policy options before adopting a broad recommendation.",
    tone: "decision-ready",
  },
  public_administrators: {
    label: "public administrators",
    focus: "implementation, management use, and operational limits",
    action: "Use the finding to guide implementation planning and monitor operational constraints.",
    tone: "implementation-focused",
  },
  communications_staff: {
    label: "communications staff",
    focus: "plain-language messaging and communication cautions",
    action: "Use careful public messaging and avoid overstating certainty.",
    tone: "plain-language",
  },
  program_managers: {
    label: "program managers",
    focus: "program design, implementation steps, and evaluation",
    action: "Translate the evidence into program design choices and evaluation checkpoints.",
    tone: "program-focused",
  },
  research_analysts: {
    label: "research analysts",
    focus: "methodology, evidence quality, and inference limits",
    action: "Review evidence quality and inference boundaries before recommending action.",
    tone: "method-focused",
  },
  general_public: {
    label: "the general public",
    focus: "plain language and minimal jargon",
    action: "Treat the finding as useful information, not as proof of what will happen everywhere.",
    tone: "public-facing",
  },
  students: {
    label: "students",
    focus: "method explanation and why limitations matter",
    action: "Use the example to explain how methods shape what can responsibly be claimed.",
    tone: "teaching-oriented",
  },
};

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function audienceProfile(targetAudience) {
  return audienceGuidance[targetAudience] ?? audienceGuidance.public_administrators;
}

function listItems(items, fallback) {
  const values = items?.filter(Boolean).slice(0, 3) ?? [];

  if (values.length === 0) {
    return `- ${fallback}`;
  }

  return values.map((item) => `- ${item}`).join("\n");
}

function firstValue(items, fallback) {
  return items?.find(Boolean) ?? fallback;
}

function failureNote(failureModes) {
  if (!failureModes || failureModes.length === 0) {
    return "No priority failure mode was detected, but claims should still remain bounded by the method.";
  }

  const firstFailure = failureModes[0];
  return `${formatLabel(firstFailure.failure_mode)}: ${firstFailure.recommended_fix}`;
}

function takeaways(evidenceSummary) {
  return listItems(
    evidenceSummary?.main_claims,
    "The available text contains limited evidence and should be reviewed before use.",
  );
}

function limitations(evidenceSummary, failureModes) {
  const limitationLines = evidenceSummary?.limitations_found?.length
    ? listItems(evidenceSummary.limitations_found, "")
    : listItems(evidenceSummary?.missing_information, "Important limitations are not fully visible.");

  return `${limitationLines}\n- ${failureNote(failureModes)}`;
}

function audienceCaution(targetAudience) {
  const cautions = {
    policymakers:
      "Emphasize policy relevance while keeping decision claims cautious.",
    public_administrators:
      "Emphasize implementation use and operational limits.",
    communications_staff:
      "Use plain language and avoid messaging that sounds more certain than the evidence.",
    program_managers:
      "Connect the evidence to program design, implementation, and evaluation checkpoints.",
    research_analysts:
      "Keep method quality, evidence strength, and inference limits visible.",
    general_public:
      "Use plain language, avoid jargon, and explain uncertainty directly.",
    students:
      "Explain how the method shapes the claim and why limitations matter.",
  };

  return cautions[targetAudience] ?? cautions.public_administrators;
}

function buildDocumentHeader({ outputType, methodology, targetAudience }) {
  const profile = audienceProfile(targetAudience);

  return `Title
${formatLabel(outputType)} for ${formatLabel(methodology)} Evidence

Audience
This draft is written for ${profile.label}. It emphasizes ${profile.focus}. ${audienceCaution(targetAudience)}

Methodology Note
The source evidence is ${formatLabel(methodology)}. Claims should remain aligned with what this method can support.`;
}

function buildLimitationsAndFidelity({
  evidenceSummary,
  failureModes,
  targetAudience,
}) {
  return `${limitations(evidenceSummary, failureModes)}
- Audience adaptation: ${audienceCaution(targetAudience)}`;
}

function buildHashtags(methodology, outputType) {
  return [
    "#PublicAdministration",
    "#EvidenceUse",
    `#${formatLabel(methodology).replaceAll(" ", "")}`,
    `#${formatLabel(outputType).replaceAll(" ", "")}`,
  ].join(" ");
}

export function generateOutput({
  text = "",
  methodology = "unknown",
  outputType = "executive_summary",
  targetAudience = "public_administrators",
  evidenceSummary,
  failureModes = [],
} = {}) {
  const profile = audienceProfile(targetAudience);
  const header = buildDocumentHeader({
    outputType,
    methodology,
    targetAudience,
  });
  const primaryClaim = firstValue(
    evidenceSummary?.main_claims,
    text.trim() || "No source text was provided.",
  );
  const causalClaim = firstValue(
    evidenceSummary?.possible_causal_claims,
    "No explicit causal claim should be added unless the method supports it.",
  );
  const action = profile.action;
  const evidenceType = `${formatLabel(methodology)} evidence`;
  const riskNote = failureNote(failureModes);
  const limitationsAndFidelity = buildLimitationsAndFidelity({
    evidenceSummary,
    failureModes,
    targetAudience,
  });

  if (outputType === "policy_brief") {
    return `${header}

Issue
${primaryClaim}

Evidence Summary
${takeaways(evidenceSummary)}

Policy Implications
- The evidence can inform ${profile.focus}.
- The main practical signal is: ${primaryClaim}
- Causal interpretation should remain bounded: ${causalClaim}

Recommended Actions
- ${action}
- Keep decisions proportional to the strength of the evidence.
- Review failure modes before converting this into policy language.

Limitations and Fidelity Note
${limitationsAndFidelity}`;
  }

  if (outputType === "policy_memo") {
    return `${header}

To
${formatLabel(targetAudience)}

From
AI Playbook Consistency & Failure Mode Analyzer

Subject
Method-bounded interpretation of ${formatLabel(methodology)} evidence

Background
The source text provides evidence that may support ${profile.focus}. This memo should be used as decision support, not as standalone proof.

Analysis
${takeaways(evidenceSummary)}

Recommendation
- ${action}
- Use this memo as a decision support artifact, not as standalone proof.

Limitations and Fidelity Note
${limitationsAndFidelity}`;
  }

  if (outputType === "fact_sheet") {
    return `${header}

Study Focus
${primaryClaim}

Evidence Type
${evidenceType} for ${profile.label}; emphasis: ${profile.focus}.

Key Takeaways
${takeaways(evidenceSummary)}

What This Does Not Prove
- ${causalClaim}
- ${riskNote}

Practical Use
- ${action}
- Use this as a concise evidence summary, not as a complete implementation plan.

Limitations and Fidelity Note
${limitationsAndFidelity}`;
  }

  if (outputType === "linkedin_post") {
    return `${header}

Short Public-Facing Post
Evidence can help public-sector teams make better choices, but only when claims stay within the method. For ${profile.label}, the useful signal is: ${primaryClaim}

3 Bullet Takeaways
${takeaways(evidenceSummary)}

Caution
${riskNote}

Hashtags
${buildHashtags(methodology, outputType)}

Limitations and Fidelity Note
${limitationsAndFidelity}`;
  }

  if (outputType === "mechanism_map") {
    return `${header}

Inputs / Conditions
- Audience: ${profile.label}
- Method: ${formatLabel(methodology)}
- Practical focus: ${profile.focus}

Possible Mechanisms
- The text may suggest a link between evidence, implementation choices, and outcomes.
- Mechanisms should be treated as proposed pathways unless causal evidence is explicit.

Observed or Suggested Outcomes
${takeaways(evidenceSummary)}

Causality Warning
- ${causalClaim}
- ${riskNote}

Failure Mode Warning
- ${riskNote}

Limitations and Fidelity Note
${limitationsAndFidelity}`;
  }

  if (outputType === "technical_note") {
    return `${header}

Methodology
${formatLabel(methodology)}

Evidence Type
${evidenceType}; written for ${profile.label}.

Inference Rules
- Keep claims aligned to the methodology.
- Avoid adding causal or universal claims without support.
- Preserve limitations and scope conditions.

Fidelity Risks
- ${riskNote}

Review Notes
- ${action}
- Confirm that the generated language remains traceable to the source text.

Limitations and Fidelity Note
${limitationsAndFidelity}`;
  }

  return `${header}

Overview
The source text provides a method-bounded evidence signal for ${profile.label}. The draft emphasizes ${profile.focus}.

Key Findings
${takeaways(evidenceSummary)}

Practical Meaning
- ${action}
- The main practical signal is: ${primaryClaim}

Limitations and Fidelity Note
${limitationsAndFidelity}`;
}
