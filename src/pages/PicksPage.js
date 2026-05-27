import React, { useState } from "react";
import { api } from "../api/client";
import { useAsync } from "../hooks/useAsync";
import { Spinner, ErrorMsg } from "../components/UI";

const STAT_LABELS = {
  PTS: "Points", REB: "Rebounds", AST: "Assists", STL: "Steals", BLK: "Blocks",
};

function PickCard({ pick, rank }) {
  const isOver = pick.recommendation === "OVER";

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "14px",
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: "20px",
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.2s, transform 0.15s",
      cursor: "default",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = isOver ? "var(--green)" : "var(--red)";
      e.currentTarget.style.transform = "translateX(4px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.transform = "translateX(0)";
    }}>
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "4px",
        background: isOver ? "var(--green)" : "var(--red)",
        borderRadius: "14px 0 0 14px",
      }} />

      {/* Rank */}
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "36px",
        color: "var(--border-hover)",
        lineHeight: 1,
        minWidth: "48px",
        textAlign: "center",
        letterSpacing: "1px",
      }}>
        {rank}
      </div>

      {/* Player + matchup */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "22px",
          letterSpacing: "1px",
          color: "var(--text)",
          lineHeight: 1,
        }}>
          {pick.player}
        </div>
        <div style={{
          fontFamily: "var(--font-ui)",
          fontSize: "12px",
          color: "var(--text-secondary)",
          marginTop: "5px",
          letterSpacing: "0.05em",
        }}>
          {pick.matchup}
          {pick.is_playoffs && (
            <span style={{ marginLeft: "8px", color: "var(--accent)", fontWeight: 700 }}>
              {pick.is_elimination ? "⚠️ ELIM" : pick.series_game ? `· GAME ${pick.series_game}` : "· PLAYOFFS"}
            </span>
          )}
        </div>
      </div>

      {/* Stat */}
      <div style={{ textAlign: "center", minWidth: "80px" }}>
        <div style={{
          fontFamily: "var(--font-ui)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          marginBottom: "4px",
        }}>
          {STAT_LABELS[pick.stat]}
        </div>
        <div style={{
          fontFamily: "var(--mono)",
          fontSize: "13px",
          color: "var(--text-secondary)",
        }}>
          Line: <strong style={{ color: "var(--text)" }}>{pick.line}</strong>
        </div>
        <div style={{
          fontFamily: "var(--mono)",
          fontSize: "13px",
          color: "var(--text-secondary)",
        }}>
          Pred: <strong style={{ color: "var(--text)" }}>{pick.prediction}</strong>
        </div>
      </div>

      {/* Edge + rec */}
      <div style={{ textAlign: "right", minWidth: "100px" }}>
        <div style={{
          fontFamily: "var(--font-display)",
          fontSize: "32px",
          letterSpacing: "1px",
          color: isOver ? "var(--green)" : "var(--red)",
          lineHeight: 1,
        }}>
          +{pick.edge}
        </div>
        <div style={{
          display: "inline-block",
          marginTop: "6px",
          background: isOver ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
          color: isOver ? "var(--green)" : "var(--red)",
          border: `1px solid ${isOver ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          borderRadius: "20px",
          padding: "3px 12px",
          fontFamily: "var(--font-ui)",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.1em",
        }}>
          {pick.recommendation}
        </div>
      </div>
    </div>
  );
}

export default function PicksPage() {
  const { data, loading, error, run } = useAsync();
  const [scanned, setScanned] = useState(false);

  function handleScan() {
    setScanned(true);
    run(api.bestPicks(0.5, 10, false));
  }

  const picks = (data?.picks || []).slice(0, 10);
  const overs  = picks.filter(p => p.recommendation === "OVER").length;
  const unders = picks.filter(p => p.recommendation === "UNDER").length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Best Picks Today</h1>
        <p className="page-subtitle">
          ML model · Ranked by edge · Top 10 plays of the day
        </p>
      </div>

      {/* Big CTA button */}
      {!scanned && !loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0 60px" }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            letterSpacing: "3px",
            color: "var(--text-secondary)",
            marginBottom: "32px",
            textAlign: "center",
          }}>
            SCAN TODAY'S PROP LINES
          </div>
          <button
            onClick={handleScan}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "28px",
              letterSpacing: "4px",
              padding: "24px 64px",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              color: "#000",
              border: "none",
              borderRadius: "14px",
              cursor: "pointer",
              boxShadow: "0 8px 40px rgba(245,166,35,0.35)",
              transition: "transform 0.15s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 16px 60px rgba(245,166,35,0.5)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 40px rgba(245,166,35,0.35)";
            }}
          >
            🔥 GET TODAY'S BEST PICKS
          </button>
          <div style={{
            fontFamily: "var(--font-ui)",
            fontSize: "12px",
            letterSpacing: "0.1em",
            color: "var(--text-secondary)",
            marginTop: "20px",
            textAlign: "center",
          }}>
            Scans all today's NBA props · Takes ~60 seconds
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Spinner />
          <div style={{
            fontFamily: "var(--font-ui)",
            fontSize: "13px",
            letterSpacing: "0.1em",
            color: "var(--text-secondary)",
            marginTop: "16px",
            textTransform: "uppercase",
          }}>
            Fetching props · Running ML model · Building your picks…
          </div>
        </div>
      )}

      {error && <ErrorMsg msg={error} />}

      {/* Results */}
      {data && !loading && (
        <>
          {/* Summary */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}>
            <div style={{
              fontFamily: "var(--font-ui)",
              fontSize: "12px",
              letterSpacing: "0.1em",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              display: "flex",
              gap: "20px",
            }}>
              <span>📊 <strong style={{ color: "var(--text)" }}>{data.total_players}</strong> players scanned</span>
              <span style={{ color: "var(--green)" }}>⬆️ <strong>{overs}</strong> OVERs</span>
              <span style={{ color: "var(--red)" }}>⬇️ <strong>{unders}</strong> UNDERs</span>
            </div>
            <button
              onClick={() => { setScanned(false); run(api.bestPicks(0.5, 10, true)); }}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-secondary)",
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "7px 16px",
                cursor: "pointer",
              }}
            >
              🔄 Rescan
            </button>
          </div>

          {picks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "48px", marginBottom: "16px" }}>🏀</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                No props available yet — check back closer to tip-off
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {picks.map((pick, i) => (
                <PickCard key={i} pick={pick} rank={i + 1} />
              ))}
            </div>
          )}

          <p style={{
            fontFamily: "var(--font-ui)",
            fontSize: "11px",
            letterSpacing: "0.05em",
            color: "var(--text-secondary)",
            marginTop: "32px",
            fontStyle: "italic",
          }}>
            Predictions use ML trained on historical NBA data. Not financial advice. Bet responsibly.
          </p>
        </>
      )}
    </div>
  );
}