function searchableText(paper) {
  return [
    paper?.title,
    paper?.abstract,
    paper?.methodology,
    ...(paper?.keywords ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

export function searchPapers({ query = "", papers = [] } = {}) {
  const normalizedQuery = String(query ?? "").trim().toLowerCase();

  if (!normalizedQuery) {
    return papers.slice(0, 4);
  }

  return papers.filter((paper) => searchableText(paper).includes(normalizedQuery));
}
