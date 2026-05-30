function toneFromScore(score) {
  if (score === null || score === undefined) {
    return "neutral";
  }

  if (score >= 85) {
    return "strong";
  }

  if (score >= 70) {
    return "workable";
  }

  if (score >= 50) {
    return "review";
  }

  return "risk";
}

function formatScore(score) {
  if (score === null || score === undefined) {
    return null;
  }

  return Number.isFinite(Number(score)) ? `${Math.round(Number(score))}` : String(score);
}

export default function ScoreBadge({ label, score, tone, title }) {
  const displayLabel = label ?? formatScore(score) ?? "Pending";
  const badgeTone = tone ?? toneFromScore(score);

  return (
    <span className="scoreBadge" data-tone={badgeTone} title={title}>
      {displayLabel}
    </span>
  );
}
