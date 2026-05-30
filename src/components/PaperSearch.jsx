import { useState } from "react";
import {
  searchLocalPapers,
  searchOnlinePapersPlaceholder,
} from "../logic/paperSearchProviders.js";
import Card from "./Card.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

const searchSources = {
  local: "local",
  online_placeholder: "online_placeholder",
};

function formatLabel(value) {
  return String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PaperSearch({ onUsePaper }) {
  const [query, setQuery] = useState("");
  const [searchSource, setSearchSource] = useState(searchSources.local);
  const [results, setResults] = useState(() => searchLocalPapers(""));
  const [placeholderStatus, setPlaceholderStatus] = useState(null);
  const isOnlinePlaceholder = searchSource === searchSources.online_placeholder;

  function handleSearch(event) {
    event.preventDefault();

    if (isOnlinePlaceholder) {
      setResults([]);
      setPlaceholderStatus(searchOnlinePapersPlaceholder(query));
      return;
    }

    setPlaceholderStatus(null);
    setResults(searchLocalPapers(query));
  }

  function handleSearchSourceChange(nextSource) {
    setSearchSource(nextSource);

    if (nextSource === searchSources.online_placeholder) {
      setResults([]);
      setPlaceholderStatus(searchOnlinePapersPlaceholder(query));
      return;
    }

    setPlaceholderStatus(null);
    setResults(searchLocalPapers(query));
  }

  return (
    <Card
      title="Paper Search"
      action={
        <ScoreBadge
          label={isOnlinePlaceholder ? "Placeholder" : `${results.length} shown`}
        />
      }
      className="paperSearchCard"
    >
      <form className="paperSearchForm" onSubmit={handleSearch}>
        <div className="paperSourceControl">
          <label className="inputLabel" htmlFor="paper-search-source">
            Search Source
          </label>
          <select
            id="paper-search-source"
            onChange={(event) => handleSearchSourceChange(event.target.value)}
            value={searchSource}
          >
            <option value={searchSources.local}>Local Demo Library</option>
            <option value={searchSources.online_placeholder}>
              Online Search Placeholder
            </option>
          </select>
        </div>

        <label className="inputLabel" htmlFor="paper-keyword">
          Keyword
        </label>
        <div className="paperSearchControls">
          <input
            className="keywordInput"
            id="paper-keyword"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="motivation, street-level, innovation..."
            type="search"
            value={query}
          />
          <button className="analyzeButton" type="submit">
            Search Papers
          </button>
        </div>
      </form>

      <div className="paperResults" aria-live="polite">
        {isOnlinePlaceholder && (
          <div className="paperResult">
            <h3 className="paperTitle">Online Search Placeholder</h3>
            <p>
              {placeholderStatus?.message ??
                "Online paper search is not enabled in this demo version."}
            </p>
            <p>
              A future version can connect this provider to a public paper
              metadata API while keeping the search UI and provider contract
              stable.
            </p>
          </div>
        )}

        {!isOnlinePlaceholder &&
          results.map((paper) => (
            <article className="paperResult" key={paper.id}>
              <div className="paperResultHeader">
                <div>
                  <h3 className="paperTitle">{paper.title}</h3>
                  <p className="paperMeta">
                    {paper.authors} ({paper.year})
                  </p>
                </div>
                <ScoreBadge label={formatLabel(paper.methodology)} />
              </div>
              <p>{paper.abstract}</p>
              <div className="keywordList" aria-label="Keywords">
                {paper.keywords.map((keyword) => (
                  <span className="keywordPill" key={keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
              <button
                className="sampleButton usePaperButton"
                onClick={() => onUsePaper?.(paper)}
                type="button"
              >
                Use This Paper
              </button>
            </article>
          ))}
        {!isOnlinePlaceholder && results.length === 0 && (
          <p className="metricLabel">No local papers matched this keyword.</p>
        )}
      </div>
    </Card>
  );
}
