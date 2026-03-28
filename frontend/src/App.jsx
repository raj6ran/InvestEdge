import { useState, Component, createContext, useContext, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ChatUI from "./components/ChatUI.jsx";
import StocksAnalysis from "./components/StocksAnalysis.jsx";
import OpportunityRadarNew from "./components/OpportunityRadarNew.jsx";
import ChartIntelligence from "./components/ChartIntelligence.jsx";
import Portfolio from "./components/Portfolio.jsx";
import NewsRAG from "./components/NewsRAG.jsx";
import VideoEngine from "./components/VideoEngine.jsx";
import EarningsPredictor from "./components/EarningsPredictor.jsx";
import MarketRegime from "./components/MarketRegime.jsx";

export const ThemeContext = createContext({ dark: false, toggle: () => {} });

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("[ErrorBoundary]", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: "100%", flexDirection: "column", gap: 12,
          background: "#fff7f7", color: "#dc2626",
          fontFamily: "JetBrains Mono, monospace", padding: 32,
        }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Something went wrong</div>
          <div style={{ fontSize: 11, color: "#64748b", maxWidth: 480, textAlign: "center", lineHeight: 1.6 }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              marginTop: 8, padding: "8px 20px", borderRadius: 8, border: "1px solid #fecaca",
              background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontSize: 12,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const VIEWS = {
  home:      Dashboard,
  chat:      ChatUI,
  stocks:    StocksAnalysis,
  radar:     OpportunityRadarNew,
  chart:     ChartIntelligence,
  portfolio: Portfolio,
  news:      NewsRAG,
  video:     VideoEngine,
  earnings:  EarningsPredictor,
  regime:    MarketRegime,
};

export default function App() {
  const [view, setView] = useState("home");
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = { name: "Investor", email: "investor@investedge.in" };
  const View = VIEWS[view] || Dashboard;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      <div className="app-shell">
        <Sidebar 
          active={view} 
          onNav={setView} 
          user={user}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(o => !o)}
        />
        <main className="main-content">
          <ErrorBoundary key={view}>
            <View onNav={setView} />
          </ErrorBoundary>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
