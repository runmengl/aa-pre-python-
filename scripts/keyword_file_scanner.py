#!/usr/bin/env python3
"""Deterministic local keyword scanner for the AI Playbook demo."""

from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Pattern, Tuple


SUPPORTED_EXTENSIONS = {".txt", ".md", ".html"}
SKIPPED_FOLDERS = {"node_modules", "dist", ".git", "exports"}
REPORT_PATH = Path("exports") / "keyword_scan_report.md"


@dataclass
class SearchResult:
    path: Path
    match_count: int
    preview: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scan local demo files for a keyword and print readable results.",
    )
    parser.add_argument(
        "--keyword",
        required=True,
        help="Keyword or phrase to search for.",
    )
    parser.add_argument(
        "--folder",
        default="./sample_files",
        help="Folder to scan. Defaults to ./sample_files.",
    )
    parser.add_argument(
        "--export",
        action="store_true",
        help="Export results to exports/keyword_scan_report.md.",
    )
    return parser.parse_args()


def display_path(path: Path) -> str:
    try:
        return path.relative_to(Path.cwd()).as_posix()
    except ValueError:
        return path.as_posix()


def iter_supported_files(folder: Path) -> List[Path]:
    files: List[Path] = []

    if not folder.exists() or not folder.is_dir():
        return files

    for current_root, folder_names, file_names in os.walk(folder):
        folder_names[:] = [
            name for name in folder_names if name not in SKIPPED_FOLDERS
        ]

        for file_name in file_names:
            file_path = Path(current_root) / file_name
            if file_path.suffix.lower() in SUPPORTED_EXTENSIONS:
                files.append(file_path)

    return sorted(files, key=lambda path: display_path(path).lower())


def normalize_preview(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def build_preview(text: str, match: re.Match[str], radius: int = 72) -> str:
    start = max(match.start() - radius, 0)
    end = min(match.end() + radius, len(text))

    if start > 0:
        next_space = text.find(" ", start)
        if next_space != -1 and next_space < match.start():
            start = next_space + 1

    if end < len(text):
        next_space = text.find(" ", end)
        if next_space != -1 and next_space - end <= 40:
            end = next_space

    preview = normalize_preview(text[start:end])

    if start > 0:
        preview = f"... {preview}"

    if end < len(text):
        preview = f"{preview} ..."

    return preview


def scan_file(path: Path, keyword_pattern: Pattern[str]) -> Optional[SearchResult]:
    text = path.read_text(encoding="utf-8", errors="replace")
    matches = list(keyword_pattern.finditer(text))

    if not matches:
        return None

    return SearchResult(
        path=path,
        match_count=len(matches),
        preview=build_preview(text, matches[0]),
    )


def scan_folder(keyword: str, folder: Path) -> Tuple[List[Path], List[SearchResult]]:
    keyword_pattern = re.compile(re.escape(keyword), re.IGNORECASE)
    files = iter_supported_files(folder)
    results = []
    for file_path in files:
        result = scan_file(file_path, keyword_pattern)
        if result is not None:
            results.append(result)
    return files, results


def print_result(result: SearchResult) -> None:
    print(f"[FOUND] {display_path(result.path)}")
    print(f"Matches: {result.match_count}")
    print("Preview:")
    print(result.preview)
    print()


def build_markdown_report(
    keyword: str,
    folder: Path,
    files_scanned: int,
    results: List[SearchResult],
) -> str:
    total_matches = sum(result.match_count for result in results)
    result_sections = []

    for result in results:
        result_sections.append(
            "\n".join(
                [
                    f"### {display_path(result.path)}",
                    "",
                    f"- Matches: {result.match_count}",
                    f"- Preview: {result.preview}",
                ],
            ),
        )

    if not result_sections:
        result_sections.append(f"No matching files found for keyword: {keyword}")

    return "\n".join(
        [
            "# AI Playbook Keyword Scan Report",
            "",
            f"- Keyword: {keyword}",
            f"- Folder: {folder.as_posix()}",
            f"- Files scanned: {files_scanned}",
            f"- Files with matches: {len(results)}",
            f"- Total matches: {total_matches}",
            "",
            "## Results",
            "",
            "\n\n".join(result_sections),
            "",
        ],
    )


def export_report(
    keyword: str,
    folder: Path,
    files_scanned: int,
    results: List[SearchResult],
) -> Path:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        build_markdown_report(keyword, folder, files_scanned, results),
        encoding="utf-8",
    )
    return REPORT_PATH


def main() -> int:
    args = parse_args()
    keyword = args.keyword.strip()
    folder = Path(args.folder)

    print("========================================")
    print("AI Playbook Keyword File Scanner")
    print("========================================")
    print()
    print(f"Keyword: {keyword}")
    print(f"Folder: {args.folder}")
    print()

    if not keyword:
        print("Keyword cannot be empty.")
        print()
        print("========================================")
        print("Done")
        print("========================================")
        return 1

    print("Scanning files...")
    print()

    files, results = scan_folder(keyword, folder)

    for result in results:
        print_result(result)

    if not results:
        print(f"No matching files found for keyword: {keyword}")
        print()

    total_matches = sum(result.match_count for result in results)
    print("Summary")
    print(f"- Files scanned: {len(files)}")
    print(f"- Files with matches: {len(results)}")
    print(f"- Total matches: {total_matches}")
    print()

    if args.export:
        report_path = export_report(keyword, folder, len(files), results)
        print("Report saved to:")
        print(display_path(report_path))
        print()

    print("========================================")
    print("Done")
    print("========================================")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
