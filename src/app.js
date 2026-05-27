import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SearchPage from "./pages/SearchPage";
import CareerPage from "./pages/CareerPage";
import GamelogPage from "./pages/GamelogPage";
import PredictPage from "./pages/PredictPage";
import PicksPage from "./pages/PicksPage";
import "./index.css";

function HeroBg() {
  return (
    <div className="hero-bg">
      <div className="player-strip">
        <img className="player-img" src="/players/curry.png"  alt="" />
        <img className="player-img" src="/players/cade.png"   alt="" />
        <img className="player-img" src="/players/lebron.png" alt="" />
        <img className="player-img" src="/players/wemby.png"  alt="" />
        <img className="player-img" src="/players/kobe.png"   alt="" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <HeroBg />
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"        element={<SearchPage />} />
            <Route path="/career"  element={<CareerPage />} />
            <Route path="/gamelog" element={<GamelogPage />} />
            <Route path="/predict" element={<PredictPage />} />
            <Route path="/picks"   element={<PicksPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}