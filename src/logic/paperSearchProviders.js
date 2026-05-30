import { paperLibrary } from "../data/paperLibrary.js";
import { searchPapers } from "./searchPapers.js";

export function searchLocalPapers(query) {
  return searchPapers({ query, papers: paperLibrary });
}

export function searchOnlinePapersPlaceholder(query) {
  return {
    status: "not_implemented",
    message: "Online paper search is not enabled in this demo version.",
  };
}
