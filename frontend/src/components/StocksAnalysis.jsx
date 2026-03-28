import { useState, useEffect } from "react";

const BACKEND = import.meta.env.VITE_API_URL || "http://localhost:8000";
const c = (n) => `var(${n})`;

const STOCK_TABS = ["DLF", "RELIANCE", "INFY", "HDFCBANK", "TCS", "WIPRO", "BAJFINANCE"];

export default function StocksAnalysis() {
  const [activeStock, setActiveStock] = useState("DLF");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStockData(activeStock);
  }, [activeStock]);

  async function fetchStockData(symbol) {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`${BACKEND}/api/opportunity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || `HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleScout() {
    const sym = searchInput.trim().toUpperCase();
    const target = sym || activeStock;
    if (sym && !STOCK_TABS.includes(sym)) {
      setActiveStock(sym);
    }
    fetchStockData(target);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleScout();
  }

  const getSignalType = () => {
    if (!data?.signals) return "Hold";
    const pos = data.signals.filter(s => s.sentiment === "positive").length;
    const caut = data.signals.filter(s => s.sentiment === "caution").length;
    if (pos >= 5) return "Strong Buy";
    if (pos >= 3) return "Buy";
    if (pos >= 1) return "Moderate Buy";
    if (caut > pos) return "Hold";
    return "Buy";
  };

  const signalType = getSignalType();
  const signalBg =
    signalType === "Strong Buy" ? "linear-gradient(135deg,#065f46 0%,#047857 100%)" :
    signalType === "Buy" ? "linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%)" :
    signalType === "Moderate Buy" ? "linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%)" :
    "linear-gradient(135deg,#374151 0%,#4b5563 100%)";

  const positiveSignals = data?.signals?.filter(s => s.sentiment === "positive") || [];
  const cautionSignals  = data?.signals?.filter(s => s.sentiment === "caution")  || [];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 40px", background: c("--bg-base") }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: c("--text-primary"), fontFamily: "Inter, sans-serif", marginBottom: 8 }}>
          Stocks Analysis
        </h1>
        <p style={{ fontSize: 14, color: c("--text-secondary"), fontFamily: "Inter, sans-serif" }}>
          AI-driven algorithmic scoring to identify asymmetric risk-reward setups in the NIFTY 500 universe.
        </p>
      </div>

      {/* Stock Tabs + Search + Scout */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
        <input
          type="text"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Search stock… (e.g. TATAMOTORS)"
          style={{
            padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb",
            background: c("--bg-elevated"), color: c("--text-primary"), fontSize: 13,
            fontFamily: "Inter, sans-serif", width: 220, outline: "none",
          }}
        />
        {STOCK_TABS.map(stock => (
          <button
            key={stock}
            onClick={() => { setSearchInput(""); setActiveStock(stock); }}
            style={{
              padding: "8px 16px", borderRadius: 8,
              border: activeStock === stock && !searchInput ? "2px solid #047857" : `1px solid ${c("--border")}`,
              background: activeStock === stock && !searchInput ? "rgba(4,120,87,0.1)" : c("--bg-elevated"),
              color: activeStock === stock && !searchInput ? "#047857" : c("--text-secondary"),
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              fontFamily: "Inter, sans-serif", transition: "all 0.2s",
            }}
          >{stock}</button>
        ))}
        <button
          onClick={handleScout}
          disabled={loading}
          style={{
            padding: "8px 20px", borderRadius: 8, border: "none",
            background: loading ? "#9ca3af" : "#047857",
            color: "#ffffff", fontSize: 13, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Inter, sans-serif", marginLeft: "auto",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:6}}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          {loading ? "Scanning…" : "Scout"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ width: 40, height: 40, border: "4px solid #e5e7eb", borderTopColor: "#047857", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ color: c("--text-secondary"), fontFamily: "Inter, sans-serif", fontSize: 14 }}>Analyzing {searchInput || activeStock}…</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, color: "#dc2626", fontSize: 14, fontFamily: "Inter, sans-serif" }}>
          {error}
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && data && (
        <div>
          {/* Top Cards Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            {/* Stock Info Card */}
            <div style={{
              background: "linear-gradient(135deg, #047857 0%, #059669 100%)",
              borderRadius: 16, padding: "32px", color: "#ffffff", position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 16, right: 16, padding: "4px 12px",
                background: "rgba(255,255,255,0.2)", borderRadius: 6,
                fontSize: 11, fontWeight: 600, fontFamily: "Inter, sans-serif",
              }}>TOP OPPORTUNITY</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 44, fontWeight: 700, fontFamily: "Inter, sans-serif", marginBottom: 2 }}>{data.display}</div>
                <div style={{ fontSize: 13, opacity: 0.85, fontFamily: "Inter, sans-serif" }}>{data.name || `${data.display}.NS`}</div>
                {data.sector && <div style={{ fontSize: 12, opacity: 0.7, fontFamily: "Inter, sans-serif", marginTop: 4 }}>{data.sector} · {data.industry}</div>}
              </div>
              <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "Inter, sans-serif", marginBottom: 8 }}>
                ₹{data.current_price?.toFixed(2) ?? "—"}
              </div>
              {data.market_cap && (
                <div style={{ fontSize: 12, opacity: 0.8, fontFamily: "Inter, sans-serif" }}>{data.market_cap}</div>
              )}
            </div>

            {/* Analyst Consensus Card */}
            <div style={{ background: signalBg, borderRadius: 16, padding: "32px", color: "#ffffff" }}>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8, fontFamily: "Inter, sans-serif" }}>Analyst Consensus</div>
              <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 20, fontFamily: "Inter, sans-serif" }}>{signalType}</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4, fontFamily: "Inter, sans-serif" }}>
                Based on {data.signals?.length || 0} fundamental signals
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, fontFamily: "Inter, sans-serif" }}>TARGET PRICE</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
                    {data.analyst?.target_mean ? `₹${data.analyst.target_mean.toFixed(1)}` : "N/A"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, fontFamily: "Inter, sans-serif" }}>UPSIDE</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Inter, sans-serif" }}>
                    {data.analyst?.upside_pct != null ? `${data.analyst.upside_pct > 0 ? "+" : ""}${data.analyst.upside_pct.toFixed(1)}%` : "N/A"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, fontFamily: "Inter, sans-serif" }}>RECOMMENDATION</div>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "Inter, sans-serif", textTransform: "capitalize" }}>
                    {data.analyst?.recommendation?.replace("_", " ") || "N/A"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4, fontFamily: "Inter, sans-serif" }}>ANALYSTS</div>
                  <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "Inter, sans-serif" }}>
                    {data.analyst?.num_analysts || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "P/E RATIO",    value: data.fundamentals?.pe ? `${data.fundamentals.pe}x` : "N/A",          sub: "Trailing P/E" },
              { label: "ROE",          value: data.fundamentals?.roe || "N/A",                                      sub: "Quality factor" },
              { label: "REV. GROWTH",  value: data.fundamentals?.revenue_growth || "N/A",                          sub: "YoY increase",  green: true },
              { label: "DEBT/EQUITY",  value: data.fundamentals?.debt_equity || "N/A",                             sub: "Balance sheet" },
              { label: "DIV. YIELD",   value: data.fundamentals?.dividend_yield || "N/A",                          sub: "Dividend payout" },
            ].map((m, i) => (
              <div key={i} style={{ background: c("--bg-elevated"), borderRadius: 12, padding: "20px", border: `1px solid ${c("--border")}` }}>
                <div style={{ fontSize: 11, color: c("--text-muted"), marginBottom: 8, fontFamily: "Inter, sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: m.green ? "#10b981" : c("--text-primary"), fontFamily: "Inter, sans-serif" }}>{m.value}</div>
                <div style={{ fontSize: 11, color: c("--text-muted"), marginTop: 4, fontFamily: "Inter, sans-serif" }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Signals Section */}
          {(positiveSignals.length > 0 || cautionSignals.length > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
              {/* Positive Signals */}
              {positiveSignals.length > 0 && (
                <div style={{ background: c("--bg-elevated"), borderRadius: 16, border: `1px solid ${c("--border")}`, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${c("--border")}`, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: c("--text-primary"), fontFamily: "Inter, sans-serif", letterSpacing: "0.03em" }}>
                      POSITIVE SIGNALS
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#ffffff", background: "#10b981", borderRadius: 20, padding: "2px 8px" }}>
                      {positiveSignals.length}
                    </span>
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {positiveSignals.map((s, i) => (
                      <div key={i} style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)",
                        borderLeft: "3px solid #10b981",
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#10b981", fontFamily: "Inter, sans-serif", marginBottom: 4 }}>
                          {s.type}
                        </div>
                        <div style={{ fontSize: 12, color: c("--text-secondary"), fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
                          {s.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Caution Signals */}
              {cautionSignals.length > 0 && (
                <div style={{ background: c("--bg-elevated"), borderRadius: 16, border: `1px solid ${c("--border")}`, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${c("--border")}`, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: c("--text-primary"), fontFamily: "Inter, sans-serif", letterSpacing: "0.03em" }}>
                      CAUTION SIGNALS
                    </span>
                    <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#ffffff", background: "#f59e0b", borderRadius: 20, padding: "2px 8px" }}>
                      {cautionSignals.length}
                    </span>
                  </div>
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {cautionSignals.map((s, i) => (
                      <div key={i} style={{
                        padding: "12px 14px", borderRadius: 10,
                        background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
                        borderLeft: "3px solid #f59e0b",
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", fontFamily: "Inter, sans-serif", marginBottom: 4 }}>
                          {s.type}
                        </div>
                        <div style={{ fontSize: 12, color: c("--text-secondary"), fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
                          {s.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No signals fallback */}
          {data.signals?.length === 0 && (
            <div style={{ padding: "20px", background: c("--bg-elevated"), border: `1px solid ${c("--border")}`, borderRadius: 12, color: c("--text-muted"), fontSize: 13, fontFamily: "Inter, sans-serif", textAlign: "center" }}>
              No fundamental signals detected for {data.display}. Data may be limited for this stock.
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
