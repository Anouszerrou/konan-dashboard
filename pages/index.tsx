import { useState, useEffect } from 'react';
import Head from 'next/head';

// ═══════════════════════════════════════════════════════════════════
//                         TYPES
// ═══════════════════════════════════════════════════════════════════

interface TradingData {
  mt5: {
    status: string;
    balance: number;
    equity: number;
    profit_today: number;
    trades_today: number;
    winrate: number;
    open_positions: number;
    drawdown: number;
    last_update: string;
  };
  bot: {
    status: string;
    last_signal: string;
    last_check: string;
  };
  wave_catcher: {
    status: string;
    last_signal: string;
  };
}

interface KPI {
  cible: number;
  realise: number;
  unite: string;
}

interface Alert {
  id: string;
  type: string;
  priorite: string;
  client: string;
  message: string;
  date_creation: string;
  auto?: boolean;
}

interface RDV {
  id: string;
  client: string;
  date: string;
  heure: string;
  objet: string;
  lieu: string;
  statut: string;
}

interface Relance {
  client: string;
  dernier_contact: string;
  action: string;
  jours: number;
}

interface Client {
  id: string;
  name: string;
  type: string;
  score?: number;
  contact?: string;
  sector?: string;
}

interface Deal {
  id: string;
  title: string;
  client: string;
  value: number;
  stage: string;
}

interface Prediction {
  type: string;
  icon: string;
  message: string;
}

interface DashboardData {
  trading: TradingData;
  alerts: Alert[];
  kpis: Record<string, KPI>;
  planning: {
    rdv_today: RDV[];
    relances: Relance[];
  };
  predictions: Prediction[];
  clients: Client[];
  deals: Deal[];
  skills: Array<{ name: string }>;
  stats: {
    skillsCount: number;
    clientsCount: number;
    activeClients: number;
    prospects: number;
    dealsCount: number;
    pipelineTotal: number;
    alertsCount: number;
    rdvToday: number;
    lastUpdate: string;
  };
}

interface CryptoData {
  bitcoin: { usd: number; usd_24h_change: number };
  ethereum: { usd: number; usd_24h_change: number };
}

// ═══════════════════════════════════════════════════════════════════
//                         COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function KonanDashboard() {
  const [booting, setBooting] = useState(true);
  const [activePanel, setActivePanel] = useState('dashboard');
  const [time, setTime] = useState(new Date());
  const [crypto, setCrypto] = useState<CryptoData | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Boot animation
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Data fetch
  useEffect(() => {
    const fetchData = () => {
      fetch('/data.json')
        .then(r => r.json())
        .then(d => setData(d))
        .catch(() => {});
      
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
        .then(r => r.json())
        .then(setCrypto)
        .catch(() => {});
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = () => time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // ═══════════════════════════════════════════════════════════════════
  //                         BOOT SCREEN
  // ═══════════════════════════════════════════════════════════════════

  if (booting) {
    return (
      <>
        <Head><title>KONAN SYSTEM</title><link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" /></Head>
        <div className="boot-screen">
          <div className="arc-reactor boot-reactor">
            <div className="reactor-core"></div>
            <div className="reactor-ring ring-1"></div>
            <div className="reactor-ring ring-2"></div>
            <div className="reactor-ring ring-3"></div>
          </div>
          <div className="boot-text">
            <span className="boot-line">KONAN SYSTEM v4.0</span>
            <span className="boot-line typing">Initializing CCPRO Command Center...</span>
            <div className="boot-progress"><div className="boot-bar"></div></div>
          </div>
        </div>
        <style jsx>{`
          .boot-screen { min-height: 100vh; background: radial-gradient(ellipse at center, #0a1628 0%, #000 100%); display: flex; flex-direction: column; justify-content: center; align-items: center; color: #00d4ff; font-family: 'Orbitron', sans-serif; }
          .arc-reactor { width: 120px; height: 120px; position: relative; margin-bottom: 40px; }
          .reactor-core { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 30px; height: 30px; border-radius: 50%; background: radial-gradient(circle, #00d4ff, #0066cc); box-shadow: 0 0 30px #00d4ff, 0 0 60px rgba(0,212,255,0.5); animation: pulse 2s infinite; }
          @keyframes pulse { 0%, 100% { box-shadow: 0 0 30px #00d4ff, 0 0 60px rgba(0,212,255,0.5); } 50% { box-shadow: 0 0 50px #00d4ff, 0 0 100px rgba(0,212,255,0.8); } }
          .reactor-ring { position: absolute; top: 50%; left: 50%; border-radius: 50%; border: 2px solid transparent; }
          .ring-1 { width: 50px; height: 50px; margin: -25px 0 0 -25px; border-color: rgba(0,212,255,0.5); animation: rotate 3s linear infinite; }
          .ring-2 { width: 80px; height: 80px; margin: -40px 0 0 -40px; border-color: rgba(0,212,255,0.3); animation: rotate 5s linear infinite reverse; }
          .ring-3 { width: 110px; height: 110px; margin: -55px 0 0 -55px; border-color: rgba(0,212,255,0.2); animation: rotate 7s linear infinite; }
          @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .boot-text { text-align: center; }
          .boot-line { display: block; margin: 10px 0; letter-spacing: 3px; }
          .typing { animation: blink 1s infinite; }
          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .boot-progress { width: 300px; height: 4px; background: rgba(0,212,255,0.2); border-radius: 2px; margin-top: 20px; overflow: hidden; }
          .boot-bar { width: 100%; height: 100%; background: linear-gradient(90deg, #00d4ff, #00ff88); animation: loading 2s ease-in-out; }
          @keyframes loading { from { width: 0%; } to { width: 100%; } }
        `}</style>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  //                         MAIN DASHBOARD
  // ═══════════════════════════════════════════════════════════════════

  const trading = data?.trading;
  const kpis = data?.kpis || {};
  const alerts = data?.alerts || [];
  const planning = data?.planning || { rdv_today: [], relances: [] };
  const predictions = data?.predictions || [];
  const clients = data?.clients || [];
  const deals = data?.deals || [];
  const stats = data?.stats;

  const pipelineTotal = stats?.pipelineTotal || 0;

  return (
    <>
      <Head>
        <title>KONAN | CCPRO Command Center</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="dashboard-container">
        <div className="grid-bg"></div>
        <div className="scan-line"></div>

        {/* ═══════════ HEADER ═══════════ */}
        <header className="hud-top">
          <div className="hud-left">
            <div className="status-indicator">
              <span className={`status-dot ${trading?.mt5?.status === 'online' ? 'online' : 'offline'}`}></span>
              <span className="status-text">MT5 {trading?.mt5?.status?.toUpperCase()}</span>
            </div>
            <div className="status-indicator">
              <span className={`status-dot ${trading?.bot?.status === 'running' ? 'online' : 'offline'}`}></span>
              <span className="status-text">BOT {trading?.bot?.status?.toUpperCase()}</span>
            </div>
          </div>
          <div className="hud-center">
            <h1 className="main-title"><span className="title-k">K</span>ONAN</h1>
            <div className="main-subtitle">CCPRO COMMAND CENTER v4.0</div>
          </div>
          <div className="hud-right">
            <div className="time-display">
              <span className="time-value">{formatTime()}</span>
              <span className="date-value">{formatDate()}</span>
            </div>
          </div>
        </header>

        {/* ═══════════ NAV ═══════════ */}
        <nav className="panel-nav">
          {[
            { id: 'dashboard', icon: '📊', label: 'DASHBOARD' },
            { id: 'trading', icon: '📈', label: 'TRADING' },
            { id: 'crm', icon: '👥', label: 'CLIENTS' },
            { id: 'alerts', icon: '🚨', label: 'ALERTES' },
          ].map(p => (
            <button key={p.id} className={`nav-btn ${activePanel === p.id ? 'active' : ''}`} onClick={() => setActivePanel(p.id)}>
              <span className="nav-icon">{p.icon}</span>{p.label}
            </button>
          ))}
        </nav>

        {/* ═══════════ MAIN CONTENT ═══════════ */}
        <main className="main-content">
          
          {/* ═══════════ DASHBOARD PANEL ═══════════ */}
          {activePanel === 'dashboard' && (
            <div className="dashboard-grid">
              
              {/* TRADING WIDGET */}
              <div className="widget trading-widget">
                <div className="widget-header">
                  <span className="widget-icon">📈</span>
                  <span className="widget-title">TRADING LIVE</span>
                  <span className={`status-badge ${trading?.mt5?.status === 'online' ? 'online' : 'offline'}`}>
                    {trading?.mt5?.status?.toUpperCase()}
                  </span>
                </div>
                <div className="trading-stats">
                  <div className="trading-stat">
                    <span className="stat-label">P&L Jour</span>
                    <span className={`stat-value ${(trading?.mt5?.profit_today || 0) >= 0 ? 'profit' : 'loss'}`}>
                      {(trading?.mt5?.profit_today || 0) >= 0 ? '+' : ''}{trading?.mt5?.profit_today?.toFixed(2) || '0.00'}$
                    </span>
                  </div>
                  <div className="trading-stat">
                    <span className="stat-label">Trades</span>
                    <span className="stat-value">{trading?.mt5?.trades_today || 0}</span>
                  </div>
                  <div className="trading-stat">
                    <span className="stat-label">Win Rate</span>
                    <span className="stat-value">{trading?.mt5?.winrate || 0}%</span>
                  </div>
                  <div className="trading-stat">
                    <span className="stat-label">Positions</span>
                    <span className="stat-value">{trading?.mt5?.open_positions || 0}</span>
                  </div>
                </div>
                <div className="trading-balance">
                  <span className="balance-label">Balance</span>
                  <span className="balance-value">${trading?.mt5?.balance?.toLocaleString() || '0'}</span>
                </div>
              </div>

              {/* KPIs WIDGET */}
              <div className="widget kpis-widget">
                <div className="widget-header">
                  <span className="widget-icon">🎯</span>
                  <span className="widget-title">OBJECTIFS FÉVRIER</span>
                </div>
                <div className="kpis-list">
                  {Object.entries(kpis).slice(0, 4).map(([key, kpi]) => {
                    const pct = kpi.cible > 0 ? (kpi.realise / kpi.cible) * 100 : 0;
                    return (
                      <div key={key} className="kpi-item">
                        <div className="kpi-header">
                          <span className="kpi-name">{key.replace(/_/g, ' ')}</span>
                          <span className="kpi-values">{kpi.realise}/{kpi.cible}</span>
                        </div>
                        <div className="kpi-bar-bg">
                          <div className="kpi-bar" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ALERTS WIDGET */}
              <div className="widget alerts-widget">
                <div className="widget-header">
                  <span className="widget-icon">🚨</span>
                  <span className="widget-title">ALERTES</span>
                  {alerts.length > 0 && <span className="alert-count">{alerts.length}</span>}
                </div>
                <div className="alerts-list">
                  {alerts.length === 0 ? (
                    <div className="empty-alerts">✅ Aucune alerte</div>
                  ) : (
                    alerts.slice(0, 3).map((alert, i) => (
                      <div key={i} className={`alert-item priority-${alert.priorite}`}>
                        <span className="alert-type">{alert.type}</span>
                        <span className="alert-client">{alert.client}</span>
                        <span className="alert-message">{alert.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PLANNING WIDGET */}
              <div className="widget planning-widget">
                <div className="widget-header">
                  <span className="widget-icon">📅</span>
                  <span className="widget-title">AUJOURD'HUI</span>
                </div>
                <div className="planning-content">
                  {planning.rdv_today.length === 0 ? (
                    <div className="no-rdv">Aucun RDV prévu</div>
                  ) : (
                    planning.rdv_today.slice(0, 3).map((rdv, i) => (
                      <div key={i} className="rdv-item">
                        <span className="rdv-time">{rdv.heure}</span>
                        <span className="rdv-client">{rdv.client}</span>
                        <span className="rdv-objet">{rdv.objet}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RELANCES WIDGET */}
              <div className="widget relances-widget">
                <div className="widget-header">
                  <span className="widget-icon">📞</span>
                  <span className="widget-title">À RELANCER</span>
                </div>
                <div className="relances-list">
                  {planning.relances.slice(0, 3).map((r, i) => (
                    <div key={i} className={`relance-item ${r.jours > 14 ? 'urgent' : r.jours > 7 ? 'warning' : ''}`}>
                      <span className="relance-client">{r.client}</span>
                      <span className="relance-days">J+{r.jours}</span>
                      <span className="relance-action">{r.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PIPELINE WIDGET */}
              <div className="widget pipeline-widget">
                <div className="widget-header">
                  <span className="widget-icon">💰</span>
                  <span className="widget-title">PIPELINE</span>
                </div>
                <div className="pipeline-value">
                  <span className="value-amount">{(pipelineTotal / 1000000).toFixed(1)}<span className="value-currency">M MAD</span></span>
                </div>
                <div className="pipeline-count">{stats?.dealsCount || 0} deals en cours</div>
                <div className="pipeline-stages">
                  {['qualification', 'proposal', 'negotiation', 'closing'].map(stage => {
                    const stageDeals = deals.filter(d => d.stage === stage);
                    const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
                    return (
                      <div key={stage} className="stage-item">
                        <span className="stage-name">{stage}</span>
                        <span className="stage-count">{stageDeals.length}</span>
                        <span className="stage-value">{(stageTotal / 1000000).toFixed(1)}M</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CRYPTO WIDGET */}
              <div className="widget crypto-widget">
                <div className="widget-header">
                  <span className="widget-icon">₿</span>
                  <span className="widget-title">CRYPTO</span>
                </div>
                {crypto && (
                  <div className="crypto-prices">
                    <div className="crypto-item">
                      <span className="crypto-symbol btc">BTC</span>
                      <span className="crypto-price">${crypto.bitcoin.usd.toLocaleString()}</span>
                      <span className={`crypto-change ${crypto.bitcoin.usd_24h_change >= 0 ? 'up' : 'down'}`}>
                        {crypto.bitcoin.usd_24h_change >= 0 ? '+' : ''}{crypto.bitcoin.usd_24h_change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="crypto-item">
                      <span className="crypto-symbol eth">ETH</span>
                      <span className="crypto-price">${crypto.ethereum.usd.toLocaleString()}</span>
                      <span className={`crypto-change ${crypto.ethereum.usd_24h_change >= 0 ? 'up' : 'down'}`}>
                        {crypto.ethereum.usd_24h_change >= 0 ? '+' : ''}{crypto.ethereum.usd_24h_change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SKILLS WIDGET */}
              <div className="widget skills-widget">
                <div className="widget-header">
                  <span className="widget-icon">⚡</span>
                  <span className="widget-title">SKILLS ACTIFS</span>
                </div>
                <div className="skills-count">
                  <span className="count-value">{stats?.skillsCount || 0}</span>
                  <span className="count-label">SKILLS</span>
                </div>
              </div>

              {/* PREDICTIONS WIDGET */}
              <div className="widget predictions-widget">
                <div className="widget-header">
                  <span className="widget-icon">🧠</span>
                  <span className="widget-title">PRÉDICTIONS IA</span>
                </div>
                <div className="predictions-list">
                  {predictions.length === 0 ? (
                    <div className="no-predictions">Aucune prédiction</div>
                  ) : (
                    predictions.map((pred, i) => (
                      <div key={i} className={`prediction-item prediction-${pred.type}`}>
                        <span className="prediction-icon">{pred.icon}</span>
                        <span className="prediction-message">{pred.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ═══════════ TRADING PANEL ═══════════ */}
          {activePanel === 'trading' && (
            <div className="trading-panel">
              <div className="panel-header">
                <h2>📈 TRADING CENTER</h2>
              </div>
              <div className="trading-grid">
                <div className="trading-card main-card">
                  <h3>💰 Performance</h3>
                  <div className="perf-stats">
                    <div className="perf-item">
                      <span className="perf-label">Balance</span>
                      <span className="perf-value">${trading?.mt5?.balance?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="perf-item">
                      <span className="perf-label">Equity</span>
                      <span className="perf-value">${trading?.mt5?.equity?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="perf-item">
                      <span className="perf-label">P&L Jour</span>
                      <span className={`perf-value ${(trading?.mt5?.profit_today || 0) >= 0 ? 'profit' : 'loss'}`}>
                        {(trading?.mt5?.profit_today || 0) >= 0 ? '+' : ''}${trading?.mt5?.profit_today?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="perf-item">
                      <span className="perf-label">Drawdown</span>
                      <span className="perf-value">{trading?.mt5?.drawdown || 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="trading-card">
                  <h3>📊 Stats Jour</h3>
                  <div className="day-stats">
                    <div className="stat-row">
                      <span>Trades</span>
                      <span>{trading?.mt5?.trades_today || 0}</span>
                    </div>
                    <div className="stat-row">
                      <span>Win Rate</span>
                      <span>{trading?.mt5?.winrate || 0}%</span>
                    </div>
                    <div className="stat-row">
                      <span>Positions ouvertes</span>
                      <span>{trading?.mt5?.open_positions || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="trading-card">
                  <h3>🤖 Bot Status</h3>
                  <div className="bot-status">
                    <div className={`bot-indicator ${trading?.bot?.status === 'running' ? 'running' : 'stopped'}`}>
                      {trading?.bot?.status === 'running' ? '🟢 RUNNING' : '🔴 STOPPED'}
                    </div>
                    <div className="last-signal">
                      <span>Dernier signal:</span>
                      <span className="signal-text">{trading?.bot?.last_signal || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ CRM PANEL ═══════════ */}
          {activePanel === 'crm' && (
            <div className="crm-panel">
              <div className="panel-header">
                <h2>👥 GESTION CLIENTS</h2>
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input type="text" className="search-input" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="clients-list">
                {clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(client => (
                  <div key={client.id} className="client-card">
                    <div className="client-avatar">{client.name.charAt(0)}</div>
                    <div className="client-info">
                      <div className="client-name">{client.name}</div>
                      <div className="client-meta">{client.sector || 'Non spécifié'}</div>
                    </div>
                    <div className="client-score">
                      <div className="score-ring" style={{ '--score': client.score || 50 } as React.CSSProperties}>
                        <span className="score-value">{client.score || 50}</span>
                      </div>
                    </div>
                    <div className="client-status">
                      <span className={`status-badge ${client.type}`}>{client.type.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════ ALERTS PANEL ═══════════ */}
          {activePanel === 'alerts' && (
            <div className="alerts-panel">
              <div className="panel-header">
                <h2>🚨 CENTRE D'ALERTES</h2>
              </div>
              <div className="alerts-full-list">
                {alerts.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">✅</span>
                    <span>Aucune alerte active</span>
                  </div>
                ) : (
                  alerts.map((alert, i) => (
                    <div key={i} className={`alert-card priority-${alert.priorite}`}>
                      <div className="alert-header">
                        <span className={`priority-badge ${alert.priorite}`}>{alert.priorite.toUpperCase()}</span>
                        <span className="alert-type-badge">{alert.type}</span>
                      </div>
                      <div className="alert-body">
                        <div className="alert-client-name">{alert.client}</div>
                        <div className="alert-message-text">{alert.message}</div>
                      </div>
                      <div className="alert-footer">
                        <span className="alert-date">{alert.date_creation}</span>
                        {alert.auto && <span className="auto-badge">AUTO</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="hud-bottom">
          <span className="version">KONAN v4.0 | CCPRO EDITION</span>
          <span className="last-update">Dernière sync: {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString('fr-FR') : 'N/A'}</span>
          <span className="refresh-info">Auto-refresh: 30s</span>
        </footer>
      </div>

      {/* ═══════════ STYLES ═══════════ */}
      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .dashboard-container { min-height: 100vh; background: linear-gradient(135deg, #0a0e1a 0%, #0d1321 50%, #1a1f2e 100%); color: #00d4ff; font-family: 'Rajdhani', sans-serif; position: relative; overflow-x: hidden; }
        
        .grid-bg { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px); background-size: 50px 50px; pointer-events: none; z-index: 0; }
        
        .scan-line { position: fixed; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #00d4ff, transparent); opacity: 0.3; animation: scan 4s linear infinite; pointer-events: none; z-index: 1000; }
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }

        /* HEADER */
        .hud-top { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: linear-gradient(180deg, rgba(0,20,40,0.9) 0%, transparent 100%); border-bottom: 1px solid rgba(0,212,255,0.2); position: relative; z-index: 10; flex-wrap: wrap; gap: 15px; }
        .hud-left, .hud-right { display: flex; align-items: center; gap: 20px; }
        .status-indicator { display: flex; align-items: center; gap: 8px; padding: 5px 12px; background: rgba(0,0,0,0.3); border-radius: 20px; }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; }
        .status-dot.online { background: #00ff88; box-shadow: 0 0 10px #00ff88; animation: pulse 2s infinite; }
        .status-dot.offline { background: #ff4757; box-shadow: 0 0 10px #ff4757; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .status-text { font-family: 'Orbitron', monospace; font-size: 0.7em; letter-spacing: 1px; }
        .hud-center { text-align: center; }
        .main-title { font-family: 'Orbitron', monospace; font-size: clamp(1.5em, 4vw, 2.5em); font-weight: 900; letter-spacing: 8px; color: #00d4ff; text-shadow: 0 0 20px rgba(0,212,255,0.5); }
        .title-k { color: #00ff88; text-shadow: 0 0 30px #00ff88; }
        .main-subtitle { font-size: 0.75em; letter-spacing: 4px; color: rgba(0,212,255,0.5); margin-top: 5px; }
        .time-display { text-align: right; }
        .time-value { font-family: 'Orbitron', monospace; font-size: 1.3em; font-weight: 700; display: block; }
        .date-value { font-size: 0.75em; color: rgba(0,212,255,0.6); text-transform: capitalize; }

        /* NAV */
        .panel-nav { display: flex; justify-content: center; gap: 10px; padding: 20px; flex-wrap: wrap; position: relative; z-index: 10; }
        .nav-btn { background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.3); color: rgba(0,212,255,0.7); padding: 12px 25px; border-radius: 5px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-family: 'Rajdhani', sans-serif; font-size: 0.9em; font-weight: 600; letter-spacing: 2px; transition: all 0.3s; }
        .nav-btn:hover { background: rgba(0,212,255,0.1); border-color: #00d4ff; color: #00d4ff; transform: translateY(-2px); }
        .nav-btn.active { background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.1)); border-color: #00ff88; color: #00ff88; box-shadow: 0 0 30px rgba(0,255,136,0.2); }
        .nav-icon { font-size: 1.2em; }

        /* MAIN */
        .main-content { padding: 20px 30px; min-height: calc(100vh - 250px); position: relative; z-index: 10; }
        
        /* DASHBOARD GRID */
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; max-width: 1600px; margin: 0 auto; }
        
        /* WIDGETS */
        .widget { background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.2); border-radius: 10px; padding: 20px; backdrop-filter: blur(10px); position: relative; overflow: hidden; transition: all 0.3s; }
        .widget::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #00d4ff, #00ff88, #00d4ff); background-size: 200% 100%; animation: shimmer 3s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .widget:hover { border-color: rgba(0,212,255,0.5); box-shadow: 0 10px 40px rgba(0,212,255,0.15); transform: translateY(-3px); }
        .widget-header { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(0,212,255,0.1); }
        .widget-icon { font-size: 1.3em; }
        .widget-title { font-family: 'Orbitron', monospace; font-size: 0.75em; letter-spacing: 2px; color: rgba(0,212,255,0.8); flex: 1; }

        /* TRADING WIDGET */
        .trading-widget { grid-column: span 2; }
        .trading-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 15px; }
        .trading-stat { text-align: center; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; }
        .stat-label { display: block; font-size: 0.75em; color: rgba(0,212,255,0.6); margin-bottom: 5px; }
        .stat-value { font-family: 'Orbitron', monospace; font-size: 1.3em; font-weight: 700; }
        .stat-value.profit { color: #00ff88; }
        .stat-value.loss { color: #ff4757; }
        .trading-balance { text-align: center; padding: 15px; background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(0,255,136,0.05)); border-radius: 8px; }
        .balance-label { display: block; font-size: 0.8em; color: rgba(0,212,255,0.6); margin-bottom: 5px; }
        .balance-value { font-family: 'Orbitron', monospace; font-size: 2em; font-weight: 900; color: #00ff88; text-shadow: 0 0 20px rgba(0,255,136,0.5); }
        .status-badge { font-size: 0.7em; padding: 3px 10px; border-radius: 10px; font-family: 'Orbitron', monospace; }
        .status-badge.online { background: rgba(0,255,136,0.2); color: #00ff88; }
        .status-badge.offline { background: rgba(255,71,87,0.2); color: #ff4757; }

        /* KPIs WIDGET */
        .kpis-list { display: flex; flex-direction: column; gap: 12px; }
        .kpi-item { }
        .kpi-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .kpi-name { font-size: 0.85em; text-transform: capitalize; color: rgba(0,212,255,0.8); }
        .kpi-values { font-family: 'Orbitron', monospace; font-size: 0.8em; }
        .kpi-bar-bg { height: 6px; background: rgba(0,0,0,0.3); border-radius: 3px; overflow: hidden; }
        .kpi-bar { height: 100%; background: linear-gradient(90deg, #00d4ff, #00ff88); border-radius: 3px; transition: width 0.5s; }

        /* ALERTS WIDGET */
        .alert-count { background: #ff4757; color: #fff; font-size: 0.7em; padding: 2px 8px; border-radius: 10px; font-family: 'Orbitron', monospace; }
        .alerts-list { display: flex; flex-direction: column; gap: 10px; }
        .empty-alerts { text-align: center; color: rgba(0,255,136,0.7); padding: 20px; }
        .alert-item { display: flex; flex-direction: column; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; border-left: 3px solid; }
        .alert-item.priority-haute { border-color: #ff4757; }
        .alert-item.priority-moyenne { border-color: #ffa500; }
        .alert-item.priority-basse { border-color: #00ff88; }
        .alert-type { font-size: 0.7em; text-transform: uppercase; color: rgba(0,212,255,0.5); }
        .alert-client { font-weight: 600; margin: 3px 0; }
        .alert-message { font-size: 0.85em; color: rgba(0,212,255,0.7); }

        /* PLANNING WIDGET */
        .planning-content { display: flex; flex-direction: column; gap: 10px; }
        .no-rdv { text-align: center; color: rgba(0,212,255,0.5); padding: 20px; }
        .rdv-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; }
        .rdv-time { font-family: 'Orbitron', monospace; font-weight: 700; color: #00ff88; min-width: 50px; }
        .rdv-client { flex: 1; font-weight: 600; }
        .rdv-objet { font-size: 0.85em; color: rgba(0,212,255,0.6); }

        /* RELANCES WIDGET */
        .relances-list { display: flex; flex-direction: column; gap: 10px; }
        .relance-item { display: flex; align-items: center; gap: 10px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; border-left: 3px solid rgba(0,212,255,0.3); }
        .relance-item.urgent { border-color: #ff4757; }
        .relance-item.warning { border-color: #ffa500; }
        .relance-client { flex: 1; font-weight: 600; }
        .relance-days { font-family: 'Orbitron', monospace; font-size: 0.8em; padding: 2px 8px; background: rgba(0,0,0,0.3); border-radius: 5px; }
        .relance-action { font-size: 0.85em; color: rgba(0,212,255,0.6); }

        /* PIPELINE WIDGET */
        .pipeline-value { text-align: center; margin: 20px 0; }
        .value-amount { font-family: 'Orbitron', monospace; font-size: 2.5em; font-weight: 700; color: #00ff88; text-shadow: 0 0 20px rgba(0,255,136,0.5); }
        .value-currency { font-size: 0.4em; margin-left: 5px; color: rgba(0,255,136,0.7); }
        .pipeline-count { text-align: center; font-size: 0.9em; color: rgba(0,212,255,0.6); margin-bottom: 15px; }
        .pipeline-stages { display: flex; flex-direction: column; gap: 8px; }
        .stage-item { display: flex; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.2); border-radius: 6px; }
        .stage-name { flex: 1; text-transform: capitalize; font-size: 0.85em; color: rgba(0,212,255,0.7); }
        .stage-count { font-family: 'Orbitron', monospace; font-size: 0.85em; padding: 2px 8px; background: rgba(0,212,255,0.1); border-radius: 10px; margin-right: 10px; }
        .stage-value { font-family: 'Orbitron', monospace; font-size: 0.85em; color: #00ff88; }

        /* CRYPTO WIDGET */
        .crypto-prices { display: flex; flex-direction: column; gap: 10px; }
        .crypto-item { display: flex; align-items: center; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px; }
        .crypto-symbol { font-family: 'Orbitron', monospace; font-weight: 700; padding: 5px 12px; border-radius: 5px; margin-right: 15px; }
        .crypto-symbol.btc { background: rgba(247,147,26,0.2); color: #f7931a; }
        .crypto-symbol.eth { background: rgba(98,126,234,0.2); color: #627eea; }
        .crypto-price { flex: 1; font-family: 'Orbitron', monospace; }
        .crypto-change { font-size: 0.85em; padding: 4px 10px; border-radius: 10px; }
        .crypto-change.up { background: rgba(0,255,136,0.2); color: #00ff88; }
        .crypto-change.down { background: rgba(255,71,87,0.2); color: #ff4757; }

        /* SKILLS WIDGET */
        .skills-count { text-align: center; padding: 20px; }
        .count-value { font-family: 'Orbitron', monospace; font-size: 3em; font-weight: 900; display: block; text-shadow: 0 0 20px rgba(0,212,255,0.5); }
        .count-label { font-size: 0.9em; letter-spacing: 2px; color: rgba(0,212,255,0.6); }

        /* PREDICTIONS WIDGET */
        .predictions-widget { grid-column: span 2; }
        .predictions-list { display: flex; flex-direction: column; gap: 10px; }
        .no-predictions { text-align: center; color: rgba(0,212,255,0.5); padding: 20px; }
        .prediction-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; background: rgba(0,0,0,0.2); border-radius: 8px; border-left: 3px solid; transition: all 0.3s; }
        .prediction-item:hover { transform: translateX(5px); background: rgba(0,0,0,0.3); }
        .prediction-warning { border-color: #ffa500; }
        .prediction-success { border-color: #00ff88; }
        .prediction-opportunity { border-color: #00d4ff; }
        .prediction-info { border-color: #9b59b6; }
        .prediction-icon { font-size: 1.3em; }
        .prediction-message { flex: 1; font-size: 0.95em; color: rgba(0,212,255,0.9); }

        /* TRADING PANEL */
        .trading-panel { max-width: 1200px; margin: 0 auto; }
        .panel-header { margin-bottom: 30px; }
        .panel-header h2 { font-family: 'Orbitron', monospace; font-size: 1.2em; letter-spacing: 3px; }
        .trading-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .trading-card { background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.2); border-radius: 10px; padding: 25px; }
        .trading-card.main-card { grid-column: span 2; }
        .trading-card h3 { margin-bottom: 20px; font-family: 'Orbitron', monospace; font-size: 1em; }
        .perf-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .perf-item { text-align: center; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 10px; }
        .perf-label { display: block; font-size: 0.85em; color: rgba(0,212,255,0.6); margin-bottom: 10px; }
        .perf-value { font-family: 'Orbitron', monospace; font-size: 1.5em; font-weight: 700; }
        .perf-value.profit { color: #00ff88; }
        .perf-value.loss { color: #ff4757; }
        .day-stats { display: flex; flex-direction: column; gap: 15px; }
        .stat-row { display: flex; justify-content: space-between; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 5px; }
        .bot-status { text-align: center; }
        .bot-indicator { font-family: 'Orbitron', monospace; font-size: 1.2em; padding: 20px; margin-bottom: 15px; border-radius: 10px; }
        .bot-indicator.running { background: rgba(0,255,136,0.1); border: 1px solid rgba(0,255,136,0.3); }
        .bot-indicator.stopped { background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.3); }
        .last-signal { font-size: 0.85em; color: rgba(0,212,255,0.6); }
        .signal-text { display: block; margin-top: 5px; font-family: monospace; font-size: 0.9em; }

        /* CRM PANEL */
        .crm-panel { max-width: 1200px; margin: 0 auto; }
        .search-box { display: flex; align-items: center; background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.3); border-radius: 25px; padding: 10px 20px; }
        .search-icon { margin-right: 10px; }
        .search-input { background: transparent; border: none; color: #00d4ff; font-family: 'Rajdhani', sans-serif; font-size: 1em; outline: none; width: 200px; }
        .search-input::placeholder { color: rgba(0,212,255,0.5); }
        .clients-list { display: flex; flex-direction: column; gap: 15px; }
        .client-card { display: flex; align-items: center; background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.2); border-radius: 10px; padding: 20px; gap: 20px; transition: all 0.3s; }
        .client-card:hover { border-color: rgba(0,212,255,0.5); transform: translateX(5px); }
        .client-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #00d4ff, #00ff88); display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', monospace; font-weight: 700; font-size: 1.3em; color: #000; }
        .client-info { flex: 1; }
        .client-name { font-size: 1.1em; font-weight: 700; margin-bottom: 5px; }
        .client-meta { color: rgba(0,212,255,0.6); font-size: 0.9em; }
        .client-score { text-align: center; }
        .score-ring { width: 50px; height: 50px; border-radius: 50%; background: conic-gradient(#00ff88 0deg, #00ff88 calc(var(--score, 50) * 3.6deg), rgba(0,212,255,0.2) calc(var(--score, 50) * 3.6deg)); display: flex; align-items: center; justify-content: center; position: relative; }
        .score-ring::before { content: ''; position: absolute; width: 35px; height: 35px; border-radius: 50%; background: rgba(0,20,40,0.9); }
        .score-ring .score-value { position: relative; font-family: 'Orbitron', monospace; font-weight: 700; font-size: 0.9em; color: #00ff88; }
        .client-status { min-width: 80px; text-align: center; }
        .status-badge.actif { background: rgba(0,255,136,0.2); color: #00ff88; border: 1px solid rgba(0,255,136,0.3); padding: 5px 15px; border-radius: 15px; font-size: 0.75em; }
        .status-badge.prospect { background: rgba(255,165,0,0.2); color: #ffa500; border: 1px solid rgba(255,165,0,0.3); padding: 5px 15px; border-radius: 15px; font-size: 0.75em; }

        /* ALERTS PANEL */
        .alerts-panel { max-width: 1000px; margin: 0 auto; }
        .alerts-full-list { display: flex; flex-direction: column; gap: 15px; }
        .empty-state { text-align: center; padding: 60px; color: rgba(0,212,255,0.5); }
        .empty-icon { font-size: 4em; display: block; margin-bottom: 20px; }
        .alert-card { background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.2); border-radius: 10px; padding: 20px; border-left: 4px solid; }
        .alert-card.priority-haute { border-left-color: #ff4757; }
        .alert-card.priority-moyenne { border-left-color: #ffa500; }
        .alert-card.priority-basse { border-left-color: #00ff88; }
        .alert-header { display: flex; gap: 10px; margin-bottom: 10px; }
        .priority-badge { font-size: 0.7em; padding: 3px 10px; border-radius: 5px; font-family: 'Orbitron', monospace; }
        .priority-badge.haute { background: rgba(255,71,87,0.2); color: #ff4757; }
        .priority-badge.moyenne { background: rgba(255,165,0,0.2); color: #ffa500; }
        .priority-badge.basse { background: rgba(0,255,136,0.2); color: #00ff88; }
        .alert-type-badge { font-size: 0.7em; padding: 3px 10px; border-radius: 5px; background: rgba(0,212,255,0.1); color: rgba(0,212,255,0.8); }
        .alert-client-name { font-size: 1.1em; font-weight: 700; margin-bottom: 5px; }
        .alert-message-text { color: rgba(0,212,255,0.7); }
        .alert-footer { display: flex; gap: 10px; margin-top: 10px; font-size: 0.8em; color: rgba(0,212,255,0.5); }
        .auto-badge { background: rgba(0,212,255,0.1); padding: 2px 8px; border-radius: 3px; }

        /* FOOTER */
        .hud-bottom { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: linear-gradient(0deg, rgba(0,20,40,0.9) 0%, transparent 100%); border-top: 1px solid rgba(0,212,255,0.2); position: relative; z-index: 10; flex-wrap: wrap; gap: 15px; }
        .version { font-family: 'Orbitron', monospace; font-size: 0.75em; color: rgba(0,212,255,0.5); letter-spacing: 2px; }
        .last-update { font-size: 0.8em; color: rgba(0,212,255,0.5); }
        .refresh-info { font-size: 0.8em; color: rgba(0,212,255,0.5); }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .hud-top { flex-direction: column; padding: 15px; }
          .main-content { padding: 15px; }
          .dashboard-grid { grid-template-columns: 1fr; }
          .trading-widget { grid-column: span 1; }
          .trading-stats { grid-template-columns: repeat(2, 1fr); }
          .trading-card.main-card { grid-column: span 1; }
          .perf-stats { grid-template-columns: 1fr; }
          .hud-bottom { flex-direction: column; text-align: center; }
        }
      `}</style>
    </>
  );
}
