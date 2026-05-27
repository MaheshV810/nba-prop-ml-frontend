import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/",        label: "Search" },
  { to: "/career",  label: "Career" },
  { to: "/gamelog", label: "Game Log" },
  { to: "/predict", label: "Predict 🤖" },
  { to: "/picks",   label: "Best Picks 🔥" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">
        <span className="brand-dot" />
        NBAPROP-ML
      </span>
      <ul className="nav-links">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}