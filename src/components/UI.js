import React from "react";

export function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
    </div>
  );
}

export function ErrorMsg({ msg }) {
  return <p className="error-msg">⚠ {msg}</p>;
}

export function StatPill({ label, value }) {
  return (
    <div className="stat-pill">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value ?? "—"}</span>
    </div>
  );
}

export function SectionHeading({ children }) {
  return <h2 className="section-heading">{children}</h2>;
}

export function DataTable({ columns, rows }) {
  if (!rows || rows.length === 0)
    return <p className="no-data">No data available.</p>;
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key}>{row[c.key] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SearchBar({ value, onChange, onSubmit, placeholder, loading }) {
  return (
    <form
      className="search-bar"
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search…"}
        className="search-input"
      />
      <button type="submit" className="search-btn" disabled={loading}>
        {loading ? "…" : "Search"}
      </button>
    </form>
  );
}