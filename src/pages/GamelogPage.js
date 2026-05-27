import React, { useState } from "react";
import { api, CURRENT_SEASON } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { SearchBar, Spinner, ErrorMsg, SectionHeading, DataTable } from "../components/UI";

// Generate last 8 seasons dynamically starting from current season
function generateSeasons(n = 8) {
  const current = CURRENT_SEASON;
  const startYear = parseInt(current.split("-")[0]);
  return Array.from({ length: n }, (_, i) => {
    const y = startYear - i;
    return `${y}-${String(y + 1).slice(2)}`;
  });
}

const SEASONS = generateSeasons(8);

const COLS = [
  { key: "GAME_DATE", label: "Date" },
  { key: "MATCHUP", label: "Matchup" },
  { key: "WL", label: "W/L" },
  { key: "MIN", label: "MIN" },
  { key: "PTS", label: "PTS" },
  { key: "REB", label: "REB" },
  { key: "AST", label: "AST" },
  { key: "STL", label: "STL" },
  { key: "BLK", label: "BLK" },
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
  { key: "PLUS_MINUS", label: "+/-" },
];

export default function GamelogPage() {
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState(CURRENT_SEASON);
  const { data, loading, error, run } = useAsync();

  function handleSearch() {
    if (!query.trim()) return;
    run(api.playerGamelog(query, season));
  }

  const pct = (v) => v != null ? (v * 100).toFixed(1) + "%" : "—";
  const rows = (data?.game_log || []).map(g => ({
    ...g,
    FG_PCT:  pct(g.FG_PCT),
    FG3_PCT: pct(g.FG3_PCT),
    FT_PCT:  pct(g.FT_PCT),
  }));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Game Log</h1>
        <p className="page-subtitle">Every game, every stat</p>
      </div>

      <div className="search-row">
        <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch}
          placeholder="e.g. Nikola Jokic" loading={loading} />
        <select className="season-select" value={season}
          onChange={(e) => setSeason(e.target.value)}>
          {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <ErrorMsg msg={error} />}
      {loading && <Spinner />}

      {data && (
        <>
          <SectionHeading>
            {query} — {season} ({rows.length} games)
          </SectionHeading>
          <DataTable columns={COLS} rows={rows} />
        </>
      )}
    </div>
  );
}