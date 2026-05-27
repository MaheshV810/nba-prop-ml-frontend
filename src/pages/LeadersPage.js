import React, { useState, useEffect } from "react";
import { api, CURRENT_SEASON } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { Spinner, ErrorMsg, SectionHeading, DataTable } from "../components/UI";

const STAT_OPTIONS = [
  { value: "PTS", label: "Points" },
  { value: "REB", label: "Rebounds" },
  { value: "AST", label: "Assists" },
  { value: "STL", label: "Steals" },
  { value: "BLK", label: "Blocks" },
  { value: "FG_PCT", label: "FG%" },
  { value: "FG3_PCT", label: "3P%" },
  { value: "FT_PCT", label: "FT%" },
];

// Generate last 5 seasons dynamically starting from current season
function generateSeasons(n = 5) {
  const current = CURRENT_SEASON;
  const startYear = parseInt(current.split("-")[0]);
  return Array.from({ length: n }, (_, i) => {
    const y = startYear - i;
    return `${y}-${String(y + 1).slice(2)}`;
  });
}

const SEASONS = generateSeasons(5);

const COLS = [
  { key: "RANK", label: "#" },
  { key: "PLAYER", label: "Player" },
  { key: "TEAM", label: "Team" },
  { key: "GP", label: "GP" },
  { key: "PTS", label: "PPG" },
  { key: "REB", label: "RPG" },
  { key: "AST", label: "APG" },
  { key: "STL", label: "SPG" },
  { key: "BLK", label: "BPG" },
  { key: "FG_PCT", label: "FG%" },
  { key: "FG3_PCT", label: "3P%" },
  { key: "FT_PCT", label: "FT%" },
];

export default function LeadersPage() {
  const [stat, setStat] = useState("PTS");
  const [season, setSeason] = useState(CURRENT_SEASON);
  const [top, setTop] = useState(15);
  const { data, loading, error, run } = useAsync();

  useEffect(() => {
    run(api.leagueLeaders(stat, top, season));
  }, [stat, season, top, run]);

  const pct = (v) => v != null ? (v * 100).toFixed(1) + "%" : "—";
  const rows = (data?.leaders || []).map(r => ({
    ...r,
    FG_PCT:  pct(r.FG_PCT),
    FG3_PCT: pct(r.FG3_PCT),
    FT_PCT:  pct(r.FT_PCT),
  }));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">League Leaders</h1>
        <p className="page-subtitle">Top performers across the league</p>
      </div>

      <div className="filters-row">
        <div className="filter-group">
          <label className="filter-label">Stat</label>
          <div className="pill-tabs">
            {STAT_OPTIONS.map(s => (
              <button key={s.value}
                className={"pill-tab" + (stat === s.value ? " active" : "")}
                onClick={() => setStat(s.value)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group filter-right">
          <div className="filter-item">
            <label className="filter-label">Season</label>
            <select className="season-select" value={season}
              onChange={(e) => setSeason(e.target.value)}>
              {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label className="filter-label">Show</label>
            <select className="season-select" value={top}
              onChange={(e) => setTop(Number(e.target.value))}>
              {[10,15,25,50].map(n => <option key={n} value={n}>Top {n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {error && <ErrorMsg msg={error} />}
      {loading && <Spinner />}

      {data && (
        <>
          <SectionHeading>
            Top {top} — {STAT_OPTIONS.find(s => s.value === stat)?.label} ({season})
          </SectionHeading>
          <DataTable columns={COLS} rows={rows} />
        </>
      )}
    </div>
  );
}