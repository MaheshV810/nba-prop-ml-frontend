import React, { useState } from "react";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { SearchBar, Spinner, ErrorMsg, StatPill, SectionHeading } from "../components/UI";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const searchAsync = useAsync();
  const infoAsync = useAsync();

  async function handleSearch() {
    if (!query.trim()) return;
    setSelected(null);
    await searchAsync.run(api.searchPlayer(query));
  }

  async function handleSelect(player) {
    setSelected(player);
    infoAsync.run(api.playerInfo(player.full_name));
  }

  const bio = infoAsync.data?.common_player_info;
  const h = infoAsync.data?.player_headline_stats;
  const pct = (v) => v != null ? (v * 100).toFixed(1) + "%" : "—";

  // Show player card from search result even if info call fails
  const showCard = selected && (infoAsync.data || infoAsync.error || infoAsync.loading);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Player Search</h1>
        <p className="page-subtitle">Look up any NBA player by name</p>
      </div>

      <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch}
        placeholder="e.g. Stephen Curry" loading={searchAsync.loading} />
      {searchAsync.error && <ErrorMsg msg={searchAsync.error} />}

      {searchAsync.data && !selected && (
        <div className="results-list">
          <SectionHeading>Results</SectionHeading>
          {searchAsync.data.players.map((p) => (
            <button key={p.id} className="result-row" onClick={() => handleSelect(p)}>
              <span className="result-name">{p.full_name}</span>
              <span className="result-meta">{p.is_active ? "Active" : "Inactive"}</span>
              <span className="result-arrow">→</span>
            </button>
          ))}
        </div>
      )}

      {showCard && (
        <div className="player-card">
          <div className="player-card-header">
            <div>
              <h2 className="player-name">{selected.full_name}</h2>
              <p className="player-meta">{bio?.TEAM_NAME || ""}</p>
            </div>
            <button className="back-btn" onClick={() => { setSelected(null); infoAsync.reset?.(); }}>← Back</button>
          </div>

          {infoAsync.loading && <Spinner />}

          {infoAsync.error && (
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", padding: "16px 0" }}>
              Could not load stats — NBA.com may be slow. Try the Career or Game Log pages.
            </p>
          )}

          {h && Object.keys(h).length > 0 && (
            <>
              <SectionHeading>Season Averages</SectionHeading>
              <div className="stat-grid">
                <StatPill label="PPG"  value={h.PTS} />
                <StatPill label="RPG"  value={h.REB} />
                <StatPill label="APG"  value={h.AST} />
                <StatPill label="SPG"  value={h.STL} />
                <StatPill label="BPG"  value={h.BLK} />
                <StatPill label="GP"   value={h.GP} />
                <StatPill label="FG%"  value={h.FG_PCT != null ? pct(h.FG_PCT) : h.FG_PCT} />
                <StatPill label="3P%"  value={h.FG3_PCT != null ? pct(h.FG3_PCT) : h.FG3_PCT} />
                <StatPill label="FT%"  value={h.FT_PCT != null ? pct(h.FT_PCT) : h.FT_PCT} />
                <StatPill label="MIN"  value={h.MIN} />
                <StatPill label="TOV"  value={h.TOV} />
                <StatPill label="PTS"  value={h.P_R_A} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}