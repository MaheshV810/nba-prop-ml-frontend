import React, { useState } from "react";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { SearchBar, Spinner, ErrorMsg, SectionHeading, DataTable } from "../components/UI";

const COLS = [
  { key: "SEASON_ID", label: "Season" },
  { key: "TEAM_ABBREVIATION", label: "Team" },
  { key: "GP", label: "GP" },
  { key: "MIN", label: "MIN" },
  { key: "PTS", label: "PPG" },
  { key: "REB", label: "RPG" },
  { key: "AST", label: "APG" },
  { key: "STL", label: "SPG" },
  { key: "BLK", label: "BPG" },
  { key: "TOV", label: "TOV" },
  { key: "FGM", label: "FGM" },
  { key: "FGA", label: "FGA" },
  { key: "FG_PCT", label: "FG%" },
  { key: "FG3M", label: "3PM" },
  { key: "FG3A", label: "3PA" },
  { key: "FG3_PCT", label: "3P%" },
  { key: "FTM", label: "FTM" },
  { key: "FTA", label: "FTA" },
  { key: "FT_PCT", label: "FT%" },
];

const CAREER_COLS = COLS.filter(c => c.key !== "SEASON_ID" && c.key !== "TEAM_ABBREVIATION");

export default function CareerPage() {
  const [query, setQuery] = useState("");
  const { data, loading, error, run } = useAsync();

  function handleSearch() {
    if (!query.trim()) return;
    run(api.playerCareer(query));
  }

  const pct = (rows) => rows.map(r => ({
    ...r,
    FG_PCT:  r.FG_PCT  != null ? (r.FG_PCT * 100).toFixed(1) + "%" : "—",
    FG3_PCT: r.FG3_PCT != null ? (r.FG3_PCT * 100).toFixed(1) + "%" : "—",
    FT_PCT:  r.FT_PCT  != null ? (r.FT_PCT * 100).toFixed(1) + "%" : "—",
  }));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Career Stats</h1>
        <p className="page-subtitle">Full season-by-season breakdown</p>
      </div>

      <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch}
        placeholder="e.g. LeBron James" loading={loading} />
      {error && <ErrorMsg msg={error} />}
      {loading && <Spinner />}

      {data && (
        <>
          <SectionHeading>Season Totals</SectionHeading>
          <DataTable columns={COLS} rows={pct(data.season_totals_regular_season)} />
          <SectionHeading>Career Totals</SectionHeading>
          <DataTable columns={CAREER_COLS} rows={pct(data.career_totals_regular_season)} />
        </>
      )}
    </div>
  );
}