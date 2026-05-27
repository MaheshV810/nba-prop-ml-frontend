// Auto-detect current NBA season based on date
// Oct-June = current year season, July-Sept = previous season
function currentSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  if (month >= 10) return `${year}-${String(year + 1).slice(2)}`;
  return `${year - 1}-${String(year).slice(2)}`;
}

const CURRENT_SEASON = currentSeason();
const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function request(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  searchPlayer: (name) =>
    request(`/player/search?name=${encodeURIComponent(name)}`),
  playerInfo: (name) =>
    request(`/player/${encodeURIComponent(name)}/info`),
  playerCareer: (name) =>
    request(`/player/${encodeURIComponent(name)}/career`),
  playerGamelog: (name, season = CURRENT_SEASON) =>
    request(`/player/${encodeURIComponent(name)}/gamelog?season=${season}`),
  leagueLeaders: (statCategory = "PTS", top = 15, season = CURRENT_SEASON) =>
    request(`/league/leaders?stat_category=${statCategory}&top=${top}&season=${season}`),
  predict: (name) =>
    request(`/predict/${encodeURIComponent(name)}`),
  bestPicks: (minEdge = 1.5, top = 10, forceRefresh = false) =>
    request(`/picks/today?min_edge=${minEdge}&top=${top}&force_refresh=${forceRefresh}`),
};

export { CURRENT_SEASON };