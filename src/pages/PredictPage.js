import React, { useState } from "react";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { SearchBar, Spinner, ErrorMsg, SectionHeading } from "../components/UI";

const STAT_LABELS = {
  PTS: "Points", REB: "Rebounds", AST: "Assists", STL: "Steals", BLK: "Blocks",
};
const COMBO_LABELS = { PR: "P+R", PA: "P+A", PRA: "P+R+A", RA: "R+A" };

function RecBadge({ rec }) {
  if (!rec || rec === "NO LINE") return (
    <span style={{ color: "var(--text-secondary)", fontSize: "12px", fontStyle: "italic" }}>No line today</span>
  );
  const isOver = rec === "OVER";
  return (
    <span style={{
      background: isOver ? "#e6f4ea" : "#fdecea",
      color: isOver ? "#2d7a3a" : "#c0392b",
      border: `1px solid ${isOver ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
      borderRadius: "20px", padding: "4px 14px",
      fontSize: "13px", fontWeight: 700,
    }}>{rec}</span>
  );
}

function ConfBadge({ pct }) {
  if (pct == null) return null;
  const color = pct >= 70 ? "#2d7a3a" : pct >= 50 ? "#b7791f" : "#c0392b";
  return (
    <span style={{
      background: color + "15", color, border: `1px solid ${color}30`,
      borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: 600,
    }}>{pct}% confidence</span>
  );
}

function PredCard({ statKey, data }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px",
      padding: "20px", display: "flex", flexDirection: "column", gap: "10px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {STAT_LABELS[statKey] || statKey}
        </span>
        <RecBadge rec={data.recommendation} />
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "2px" }}>ML Prediction</div>
          <div style={{ fontSize: "30px", fontWeight: 600, fontFamily: "var(--mono)", letterSpacing: "-0.02em" }}>
            {data.ml_prediction ?? "—"}
          </div>
        </div>
        {data.line != null && (
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "2px" }}>Line</div>
            <div style={{ fontSize: "22px", fontWeight: 500, fontFamily: "var(--mono)", color: "var(--text-secondary)" }}>
              {data.line}
            </div>
          </div>
        )}
        {data.edge != null && (
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "2px" }}>Edge</div>
            <div style={{ fontSize: "18px", fontWeight: 600, fontFamily: "var(--mono)" }}>
              +{data.edge}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "14px", fontSize: "11px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
        <span>L10: <strong style={{ color: "var(--text)" }}>{data.recent_avg_10 ?? "—"}</strong></span>
        <span>Season: <strong style={{ color: "var(--text)" }}>{data.season_avg ?? "—"}</strong></span>
        {data.home_away_avg != null && <span>H/A avg: <strong style={{ color: "var(--text)" }}>{data.home_away_avg}</strong></span>}
        {data.series_weight_applied > 0 && (
          <span style={{ color: "#b45309" }}>📊 Series {Math.round(data.series_weight_applied * 100)}% weight</span>
        )}
        <span>σ: <strong style={{ color: "var(--text)" }}>{data.std_dev ?? "—"}</strong></span>
      </div>

      {data.error && <span style={{ fontSize: "11px", color: "var(--red)" }}>{data.error}</span>}
    </div>
  );
}

function ComboCard({ comboKey, data }) {
  return (
    <div style={{
      background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px",
      padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", minWidth: "36px" }}>
          {COMBO_LABELS[comboKey] || comboKey}
        </span>
        <div>
          <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Predicted</div>
          <div style={{ fontSize: "22px", fontWeight: 600, fontFamily: "var(--mono)" }}>{data.ml_prediction}</div>
        </div>
        {data.line != null && (
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Line</div>
            <div style={{ fontSize: "18px", fontWeight: 400, fontFamily: "var(--mono)", color: "var(--text-secondary)" }}>{data.line}</div>
          </div>
        )}
        {data.edge != null && (
          <div>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Edge</div>
            <div style={{ fontSize: "16px", fontWeight: 600, fontFamily: "var(--mono)" }}>+{data.edge}</div>
          </div>
        )}
      </div>
      <RecBadge rec={data.recommendation} />
    </div>
  );
}

function DefenseCard({ defense, opponent }) {
  if (!defense || Object.keys(defense).length === 0) return null;
  const items = [
    { label: "Opp PPG allowed", value: defense.opp_pts },
    { label: "Opp RPG allowed", value: defense.opp_reb },
    { label: "Opp APG allowed", value: defense.opp_ast },
    { label: "Opp 3PM allowed", value: defense.opp_fg3m },
    { label: "Opp SPG",         value: defense.opp_stl },
    { label: "Opp BPG",         value: defense.opp_blk },
  ];
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "14px" }}>
        {opponent} Defense (per game allowed)
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px" }}>
        {items.map(({ label, value }) => (
          <div key={label} style={{ background: "var(--surface2)", borderRadius: "8px", padding: "10px 12px" }}>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "3px" }}>{label}</div>
            <div style={{ fontSize: "18px", fontWeight: 600, fontFamily: "var(--mono)" }}>
              {value != null ? value : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function H2HCard({ h2h, opponent }) {
  if (!h2h || h2h.games === 0) return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 20px" }}>
      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No H2H history found vs {opponent}</span>
    </div>
  );
  const items = [
    { label: "PTS", value: h2h.h2h_pts },
    { label: "REB", value: h2h.h2h_reb },
    { label: "AST", value: h2h.h2h_ast },
    { label: "STL", value: h2h.h2h_stl },
    { label: "BLK", value: h2h.h2h_blk },
  ];
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "14px" }}>
        H2H vs {opponent} ({h2h.games} game{h2h.games !== 1 ? "s" : ""})
      </div>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {items.map(({ label, value }) => (
          <div key={label} style={{ background: "var(--surface2)", borderRadius: "8px", padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "3px" }}>{label}</div>
            <div style={{ fontSize: "20px", fontWeight: 600, fontFamily: "var(--mono)" }}>
              {value != null ? value : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeriesCard({ series }) {
  if (!series || !series.games_played) return null;
  const avgs = series.series_avgs || {};
  const trend = series.series_trend || {};
  return (
    <div style={{
      background: series.is_elimination ? "#fef2f2" : series.is_close_out ? "#f0fdf4" : "#fffbeb",
      border: `1px solid ${series.is_elimination ? "#fecaca" : series.is_close_out ? "#86efac" : "#fde68a"}`,
      borderRadius: "12px", padding: "20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          🏆 Playoff Series — Game {series.game_number}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {series.is_elimination && (
            <span style={{ background: "rgba(239,68,68,0.15)", color: "var(--red)", border: "1px solid #f5c6c2", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: 700 }}>
              ⚠️ Elimination Game
            </span>
          )}
          {series.is_close_out && !series.is_elimination && (
            <span style={{ background: "rgba(34,197,94,0.15)", color: "var(--green)", border: "1px solid #a8d5b0", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: 700 }}>
              🔒 Close-out Game
            </span>
          )}
          <span style={{ background: "#f0f0ec", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: 600 }}>
            {series.wins}–{series.losses} Series
          </span>
        </div>
      </div>

      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px" }}>
        Series averages ({series.games_played} game{series.games_played !== 1 ? "s" : ""} · weighted {Math.round((series.series_weight_applied || 0) * 100)}% in model)
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {[["PTS","pts"],["REB","reb"],["AST","ast"],["STL","stl"],["BLK","blk"]].map(([label, key]) => (
          <div key={key} style={{ background: "var(--surface)", borderRadius: "8px", padding: "10px 14px", textAlign: "center", minWidth: "60px" }}>
            <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginBottom: "3px" }}>{label}</div>
            <div style={{ fontSize: "18px", fontWeight: 600, fontFamily: "var(--mono)" }}>{avgs[key.toUpperCase()] ?? "—"}</div>
            {trend[key.toUpperCase()] !== undefined && (
              <div style={{ fontSize: "10px", color: trend[key.toUpperCase()] > 0 ? "#2d7a3a" : "#c0392b", marginTop: "2px" }}>
                {trend[key.toUpperCase()] > 0 ? "+" : ""}{trend[key.toUpperCase()]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ShotProfileCard({ edge }) {
  if (!edge || !edge.zones || Object.keys(edge.zones).length === 0) return null;
  const interpColor = edge.interpretation === "FAVORABLE" ? "#2d7a3a"
    : edge.interpretation === "UNFAVORABLE" ? "#c0392b" : "#6b6b63";
  const zoneLabels = {
    restricted_area: "Restricted Area",
    paint_non_ra:    "Paint (Non-RA)",
    mid_range:       "Mid-Range",
    corner_3:        "Corner 3",
    above_break_3:   "Above Break 3",
  };
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Shot Profile Matchup
        </div>
        <span style={{
          background: interpColor + "15", color: interpColor,
          border: `1px solid ${interpColor}30`, borderRadius: "20px",
          padding: "3px 12px", fontSize: "12px", fontWeight: 700,
        }}>
          {edge.interpretation} ({edge.score > 0 ? "+" : ""}{edge.score})
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {Object.entries(edge.zones).map(([zone, zdata]) => (
          <div key={zone} style={{
            display: "grid", gridTemplateColumns: "140px 60px 70px 70px 1fr",
            gap: "8px", alignItems: "center", padding: "8px 10px",
            background: "var(--surface2)", borderRadius: "8px", fontSize: "12px",
          }}>
            <span style={{ fontWeight: 500 }}>{zoneLabels[zone] || zone}</span>
            <span style={{ color: "var(--text-secondary)" }}>Freq: <strong style={{ color: "var(--text)" }}>{zdata.player_freq}</strong></span>
            <span style={{ color: "var(--text-secondary)" }}>Player: <strong style={{ color: "var(--text)" }}>{zdata.player_fg_pct}</strong></span>
            <span style={{ color: "var(--text-secondary)" }}>Opp: <strong style={{ color: "var(--text)" }}>{zdata.opp_allows}</strong></span>
            <span style={{
              color: zdata.zone_edge > 0 ? "#2d7a3a" : zdata.zone_edge < 0 ? "#c0392b" : "#6b6b63",
              fontWeight: 600,
            }}>
              {zdata.vs_league} vs avg
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InjuryCard({ injuries }) {
  if (!injuries || injuries.length === 0) return null;
  const statusColor = (s) => {
    const sl = (s || "").toLowerCase();
    if (sl === "out") return "#c0392b";
    if (sl === "doubtful") return "#b7791f";
    if (sl === "questionable") return "#d97706";
    return "#6b6b63";
  };
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
        Injury Report
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {injuries.map((inj, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px" }}>
            <div>
              <span style={{ fontWeight: 500, fontSize: "13px" }}>{inj.player_name}</span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginLeft: "8px" }}>{inj.team}</span>
              {inj.reason && <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginLeft: "6px" }}>· {inj.reason}</span>}
            </div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: statusColor(inj.status) }}>{inj.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeammateCard({ context }) {
  if (!context || !context.out_players?.length) return null;
  return (
    <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: "12px", padding: "16px 20px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
        ⚡ Teammate Absence — Usage Bump
      </div>
      <div style={{ fontSize: "13px", color: "var(--text)", marginBottom: "8px" }}>
        <strong>{context.out_players.join(", ")}</strong> {context.out_players.length === 1 ? "is" : "are"} out
      </div>
      <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--text-secondary)", flexWrap: "wrap" }}>
        {context.estimated_pts_bump > 0 && <span>+{context.estimated_pts_bump} est. PTS</span>}
        {context.estimated_ast_bump > 0 && <span>+{context.estimated_ast_bump} est. AST</span>}
        {context.estimated_reb_bump > 0 && <span>+{context.estimated_reb_bump} est. REB</span>}
        {context.target_usg_pct && <span>Player USG%: {context.target_usg_pct}%</span>}
        <span>Vacated MIN: {context.vacated_min}</span>
      </div>
    </div>
  );
}

export default function PredictPage() {
  const [query, setQuery] = useState("");
  const { data, loading, error, run } = useAsync();

  function handleSearch() {
    if (!query.trim()) return;
    run(api.predict(query));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">ML Predictions</h1>
        <p className="page-subtitle">
          GradientBoosting · Per-36 rates · Usage trend · Clutch stats · Opp rest · Travel fatigue · Shot profile · H2H · Injuries · Lines from The Odds API
        </p>
      </div>

      <div className="search-row">
        <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch}
          placeholder="e.g. Stephen Curry" loading={loading} />
      </div>

      {error && <ErrorMsg msg={error} />}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Spinner />
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "12px" }}>
            Fetching game logs · Training model · Loading opponent data…
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Header */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px",
            padding: "16px 20px", marginBottom: "20px",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px"
          }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 600 }}>
                {data.player.full_name}
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {data.today_game
                  ? `${data.today_game.away} @ ${data.today_game.home} · vs ${data.opponent || "unknown"} · ${data.is_home ? "Home" : "Away"}`
                  : "No game found today"}
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "12px", flexWrap: "wrap" }}>
                {data.expected_min && (
                  <span style={{ background: "#f0f0ec", borderRadius: "20px", padding: "2px 10px", color: "var(--text)", fontWeight: 500 }}>
                    ⏱ {data.expected_min} exp. MIN
                  </span>
                )}
                {data.is_playoffs && (
                  <span style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "20px", padding: "2px 10px", color: "#b45309", fontWeight: 600 }}>
                    🏆 Playoffs
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {data.props_found} prop line{data.props_found !== 1 ? "s" : ""} found · {data.predictions?.PTS?.games_used ?? 0} games trained
            </div>
          </div>

          {/* Stat predictions */}
          <SectionHeading>Stat Predictions</SectionHeading>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "12px", marginBottom: "24px"
          }}>
            {Object.entries(data.predictions).map(([k, v]) => (
              <PredCard key={k} statKey={k} data={v} />
            ))}
          </div>

          {/* Combo predictions */}
          <SectionHeading>Combo Predictions</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
            {Object.entries(data.combos).map(([k, v]) => (
              <ComboCard key={k} comboKey={k} data={v} />
            ))}
          </div>

          {/* Context cards */}
          <SectionHeading>Context Used in Model</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Playoff series — show first if in playoffs */}
            {data.series_context?.games_played > 0 && (
              <SeriesCard series={{ ...data.series_context, series_weight_applied: data.predictions?.PTS?.series_weight_applied }} />
            )}

            {/* Usage trend */}
            {data.usage_data?.usg_trend !== undefined && (
              <div style={{ background: data.usage_data.trending_up ? "#f0fdf4" : "#fafafa", border: `1px solid ${data.usage_data.trending_up ? "#86efac" : "#e8e8e4"}`, borderRadius: "10px", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Usage Trend</span>
                  <div style={{ fontSize: "13px", marginTop: "4px" }}>
                    L10 usage: <strong>{data.usage_data.last10?.usg_pct ?? "—"}%</strong> · Season: <strong>{data.usage_data.season?.usg_pct ?? "—"}%</strong>
                  </div>
                </div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: data.usage_data.trending_up ? "#2d7a3a" : "#c0392b" }}>
                  {data.usage_data.usg_trend > 0 ? "+" : ""}{data.usage_data.usg_trend}% {data.usage_data.trending_up ? "↑ trending up" : "↓ trending down"}
                </span>
              </div>
            )}

            {/* Opponent rest + recent form */}
            {data.opp_rest_days !== undefined && (
              <div style={{ background: data.opp_rest_days === 0 ? "#f0fdf4" : "#fafafa", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 20px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Opponent Rest</div>
                  <div style={{ fontSize: "20px", fontWeight: 600, fontFamily: "var(--mono)", marginTop: "4px" }}>
                    {data.opp_rest_days === 0 ? "🏃 Back-to-back" : `${data.opp_rest_days} day${data.opp_rest_days !== 1 ? "s" : ""}`}
                  </div>
                </div>
                {data.opp_recent_defense?.recent_pts_allowed_avg && (
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Opp Recent Defense (L10)</div>
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      {data.opp_recent_defense.recent_pts_allowed_avg} PTS allowed · {data.opp_recent_defense.recent_wins}W-{data.opp_recent_defense.recent_losses}L · {data.opp_recent_defense.recent_form_score > 0 ? "+" : ""}{data.opp_recent_defense.recent_form_score} avg +/-
                    </div>
                  </div>
                )}
                {data.travel_fatigue > 0 && (
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Travel Fatigue</div>
                    <div style={{ fontSize: "13px", marginTop: "4px", color: "var(--accent)" }}>
                      {data.travel_fatigue >= 2 ? "🛫 Cross-country" : "✈️ Moderate travel"}
                      {data.opponent_abbr === "DEN" ? " + Altitude" : ""}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Clutch stats */}
            {data.clutch_data?.clutch_gp > 0 && (
              <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 20px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Clutch Stats</div>
                <div style={{ display: "flex", gap: "20px", fontSize: "13px", flexWrap: "wrap" }}>
                  <span>PTS: <strong>{data.clutch_data.clutch_pts}</strong></span>
                  <span>USG%: <strong>{data.clutch_data.clutch_usg}%</strong></span>
                  <span>+/-: <strong style={{ color: data.clutch_data.clutch_plus_minus >= 0 ? "#2d7a3a" : "#c0392b" }}>{data.clutch_data.clutch_plus_minus > 0 ? "+" : ""}{data.clutch_data.clutch_plus_minus}</strong></span>
                  <span>GP: <strong>{data.clutch_data.clutch_gp}</strong></span>
                </div>
              </div>
            )}

            {/* Lineup news */}
            {data.lineup_news?.length > 0 && (
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 20px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>📋 Lineup News</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {data.lineup_news.map((n, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", background: "var(--surface2)", borderRadius: "7px", fontSize: "12px" }}>
                      <div><strong>{n.player}</strong>{n.description ? ` — ${n.description}` : ""}</div>
                      <span style={{ color: n.status?.toLowerCase() === "out" ? "#c0392b" : "#b7791f", fontWeight: 600 }}>{n.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.teammate_context?.out_players?.length > 0 && (
              <TeammateCard context={data.teammate_context} />
            )}
            {data.relevant_injuries?.length > 0 && (
              <InjuryCard injuries={data.relevant_injuries} />
            )}
            {data.opponent && <H2HCard h2h={data.h2h} opponent={data.opponent} />}
            {data.shot_profile_edge?.zones && Object.keys(data.shot_profile_edge.zones).length > 0 && (
              <ShotProfileCard edge={data.shot_profile_edge} />
            )}
            {data.opponent && <DefenseCard defense={data.opponent_defense} opponent={data.opponent} />}
          </div>

          <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "20px", fontStyle: "italic" }}>
            {data.note}
          </p>
        </>
      )}
    </div>
  );
}