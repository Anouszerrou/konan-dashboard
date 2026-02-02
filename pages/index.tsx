import { useState, useEffect } from 'react';
import Head from 'next/head';

interface CryptoData {
  bitcoin: { usd: number; usd_24h_change: number };
  ethereum: { usd: number; usd_24h_change: number };
}

interface ForexData {
  conversion_rates: { USD: number; EUR: number };
}

interface WeatherData {
  current: { temperature_2m: number; weather_code: number };
}

interface DashboardData {
  clients: Array<{ id: string; name: string; type: string; score?: number; contact?: string; sector?: string }>;
  deals: Array<{ id: string; value: number; stage: string }>;
  skills: Array<{ name: string }>;
}

export default function KonanDashboard() {
  const [booting, setBooting] = useState(true);
  const [activePanel, setActivePanel] = useState('dashboard');
  const [time, setTime] = useState(new Date());
  const [crypto, setCrypto] = useState<CryptoData | null>(null);
  const [forex, setForex] = useState<ForexData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [data, setData] = useState<DashboardData>({ clients: [], deals: [], skills: [] });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/data.json').then(r => r.json()).then(d => setData({ clients: Array.isArray(d.clients) ? d.clients : [], deals: Array.isArray(d.deals) ? d.deals : [], skills: Array.isArray(d.skills) ? d.skills : [] })).catch(() => {});
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
      .then(r => r.json()).then(setCrypto).catch(() => {});
    fetch('https://v6.exchangerate-api.com/v6/demo/latest/MAD')
      .then(r => r.json()).then(setForex).catch(() => {});
    fetch('https://api.open-meteo.com/v1/forecast?latitude=34.68&longitude=-1.91&current=temperature_2m,weather_code')
      .then(r => r.json()).then(setWeather).catch(() => {});
  }, []);

  const formatTime = () => time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = () => time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const getWeatherIcon = (code: number) => code < 3 ? '☀️' : code < 50 ? '⛅' : code < 70 ? '🌧️' : '🌨️';

  const activeClients = data.clients.filter(c => c.type === 'actif').length;
  const prospects = data.clients.filter(c => c.type === 'prospect').length;
  const pipelineTotal = data.deals.reduce((sum, d) => sum + d.value, 0);

  const filteredClients = data.clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.sector && c.sector.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (booting) {
    return (
      <>
        <Head>
          <title>KONAN SYSTEM</title>
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" />
        </Head>
        <div className="boot-screen">
          <div className="arc-reactor boot-reactor">
            <div className="reactor-core"></div>
            <div className="reactor-ring ring-1"></div>
            <div className="reactor-ring ring-2"></div>
            <div className="reactor-ring ring-3"></div>
          </div>
          <div className="boot-text">
            <span className="boot-line">KONAN SYSTEM v3.0</span>
            <span className="boot-line typing">Initializing neural networks...</span>
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
          .typing { animation: typing 1s steps(30) infinite; overflow: hidden; white-space: nowrap; }
          @keyframes typing { from, to { width: 0; } 50% { width: 100%; } }
          .boot-progress { width: 300px; height: 4px; background: rgba(0,212,255,0.2); border-radius: 2px; margin-top: 20px; overflow: hidden; }
          .boot-bar { width: 100%; height: 100%; background: linear-gradient(90deg, #00d4ff, #00ff88); animation: loading 2s ease-in-out; }
          @keyframes loading { from { width: 0%; } to { width: 100%; } }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>KONAN | JARVIS Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="dashboard-container">
        <div className="grid-bg"></div>
        <div className="scan-line"></div>

        <header className="hud-top">
          <div className="hud-left">
            <div className="status-indicator"><span className="status-dot online"></span><span className="status-text">ONLINE</span></div>
            <div className="location-info">📍 Oujda, MA</div>
          </div>
          <div className="hud-center">
            <h1 className="main-title"><span className="title-k">K</span>ONAN</h1>
            <div className="main-subtitle">CCPRO COMMAND CENTER</div>
          </div>
          <div className="hud-right">
            <div className="time-display"><span className="time-value">{formatTime()}</span><span className="date-value">{formatDate()}</span></div>
            {weather && <div className="weather-mini"><span className="weather-icon">{getWeatherIcon(weather.current.weather_code)}</span><span className="weather-temp">{Math.round(weather.current.temperature_2m)}°C</span></div>}
          </div>
        </header>

        <nav className="panel-nav">
          {[{ id: 'dashboard', icon: '📊', label: 'DASHBOARD' }, { id: 'crm', icon: '👥', label: 'CLIENTS CRM' }, { id: 'credits', icon: '💳', label: 'CRÉDITS PRO' }, { id: 'intel', icon: '🔍', label: 'BUSINESS INTEL' }].map(p => (
            <button key={p.id} className={`nav-btn ${activePanel === p.id ? 'active' : ''}`} onClick={() => setActivePanel(p.id)}>
              <span className="nav-icon">{p.icon}</span>{p.label}
            </button>
          ))}
        </nav>

        <main className="main-content">
          {activePanel === 'dashboard' && (
            <div className="dashboard-grid">
              <div className="widget reactor-widget">
                <div className="arc-reactor-mini"><div className="reactor-core"></div><div className="reactor-ring ring-1"></div><div className="reactor-ring ring-2"></div><div className="reactor-ring ring-3"></div></div>
                <div className="reactor-stats"><span className="stat-value">{data.skills.length}</span><span className="stat-label">SKILLS ACTIVE</span></div>
              </div>
              <div className="widget"><div className="widget-header"><span className="widget-icon">📈</span><span className="widget-title">PIPELINE DEALS</span></div><div className="pipeline-value"><span className="value-amount">{(pipelineTotal / 1000000).toFixed(1)}<span className="value-currency">M MAD</span></span></div><div className="pipeline-bar-container">{data.deals.map((d, i) => <div key={i} className="pipeline-segment" style={{ width: `${(d.value / pipelineTotal) * 100}%` }}></div>)}</div><div className="pipeline-count">{data.deals.length} deals en cours</div></div>
              <div className="widget"><div className="widget-header"><span className="widget-icon">👥</span><span className="widget-title">CLIENTS PORTEFEUILLE</span></div><div className="clients-count"><span className="count-value">{data.clients.length}</span><span className="count-label">TOTAL</span></div><div className="clients-breakdown"><div className="breakdown-item"><span className="breakdown-dot active"></span>Actifs<span className="breakdown-value">{activeClients}</span></div><div className="breakdown-item"><span className="breakdown-dot prospect"></span>Prospects<span className="breakdown-value">{prospects}</span></div></div></div>
              <div className="widget"><div className="widget-header"><span className="widget-icon">₿</span><span className="widget-title">CRYPTO MARKETS</span></div>{crypto && <><div className="crypto-item"><span className="crypto-symbol btc">BTC</span><span className="crypto-price">${crypto.bitcoin.usd.toLocaleString()}</span><span className={`crypto-change ${crypto.bitcoin.usd_24h_change >= 0 ? 'up' : 'down'}`}>{crypto.bitcoin.usd_24h_change >= 0 ? '+' : ''}{crypto.bitcoin.usd_24h_change.toFixed(1)}%</span></div><div className="crypto-item"><span className="crypto-symbol eth">ETH</span><span className="crypto-price">${crypto.ethereum.usd.toLocaleString()}</span><span className={`crypto-change ${crypto.ethereum.usd_24h_change >= 0 ? 'up' : 'down'}`}>{crypto.ethereum.usd_24h_change >= 0 ? '+' : ''}{crypto.ethereum.usd_24h_change.toFixed(1)}%</span></div></>}</div>
              <div className="widget"><div className="widget-header"><span className="widget-icon">💱</span><span className="widget-title">FOREX MAD</span></div>{forex && <><div className="forex-item"><span className="forex-flag">🇺🇸</span><span className="forex-pair">USD/MAD</span><span className="forex-rate">{(1/forex.conversion_rates.USD).toFixed(2)}</span></div><div className="forex-item"><span className="forex-flag">🇪🇺</span><span className="forex-pair">EUR/MAD</span><span className="forex-rate">{(1/forex.conversion_rates.EUR).toFixed(2)}</span></div></>}</div>
              <div className="widget"><div className="widget-header"><span className="widget-icon">⚡</span><span className="widget-title">QUICK ACTIONS</span></div><div className="actions-grid"><button className="action-btn"><span className="action-icon">💳</span>Simuler Crédit</button><button className="action-btn"><span className="action-icon">🔍</span>Recherche Entreprise</button><button className="action-btn"><span className="action-icon">📄</span>Générer PDF</button><button className="action-btn"><span className="action-icon">💼</span>Post LinkedIn</button></div></div>
            </div>
          )}

          {activePanel === 'crm' && (
            <div className="crm-panel">
              <div className="panel-header"><h2>👥 GESTION CLIENTS</h2><div className="search-box"><span className="search-icon">🔍</span><input type="text" className="search-input" placeholder="Rechercher un client..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div></div>
              <div className="clients-list">
                {filteredClients.length > 0 ? filteredClients.map(client => (
                  <div key={client.id} className="client-card">
                    <div className="client-avatar">{client.name.charAt(0)}</div>
                    <div className="client-info"><div className="client-name">{client.name}</div><div className="client-meta">{client.sector || 'Non spécifié'}</div>{client.contact && <div className="client-contact">📧 {client.contact}</div>}</div>
                    <div className="client-score"><div className="score-ring" style={{ '--score': client.score || 50 } as React.CSSProperties}><span className="score-value">{client.score || 50}</span></div><span className="score-label">SCORE</span></div>
                    <div className="client-status"><span className={`status-badge ${client.type}`}>{client.type.toUpperCase()}</span></div>
                  </div>
                )) : <div className="empty-state"><span className="empty-icon">📭</span>Aucun client trouvé<div className="empty-hint">Utilisez konan client add pour ajouter des clients</div></div>}
              </div>
            </div>
          )}

          {activePanel === 'credits' && (
            <div className="credits-panel">
              <div className="panel-header"><h2>💳 SIMULATEUR CRÉDITS PRO</h2></div>
              <div className="simulator-container">
                {[{ type: 'Crédit Équipement', rate: '5.5%', icon: '🏭' }, { type: 'Crédit Trésorerie', rate: '6.2%', icon: '💵' }, { type: 'Crédit Investissement', rate: '4.8%', icon: '📈' }].map(credit => (
                  <div key={credit.type} className="sim-card">
                    <h3>{credit.icon} {credit.type}</h3><div className="sim-rate">Taux à partir de {credit.rate}</div>
                    <div className="sim-fields"><div className="sim-field"><label>Montant (MAD)</label><input type="number" className="sim-input" placeholder="500000" /></div><div className="sim-field"><label>Durée (mois)</label><input type="number" className="sim-input" placeholder="60" /></div></div>
                    <button className="sim-calculate">CALCULER</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel === 'intel' && (
            <div className="intel-panel">
              <div className="panel-header"><h2>🔍 BUSINESS INTELLIGENCE</h2></div>
              <div className="intel-search"><input type="text" className="intel-input" placeholder="Rechercher une entreprise, secteur, RC..." /><button className="intel-btn">ANALYSER</button></div>
              <div className="intel-sources"><h4>Sources connectées</h4><div className="source-grid">{['Registre Commerce', 'Infogreffe', 'LinkedIn', 'Pappers'].map(src => <div key={src} className="source-item connected"><span>📡</span>{src}<span className="source-status">✓</span></div>)}</div></div>
            </div>
          )}
        </main>

        <footer className="hud-bottom">
          <span className="version">KONAN v3.0 | JARVIS EDITION</span>
          <button className="voice-btn"><span className="voice-icon">🎤</span>VOICE COMMAND</button>
          <span className="refresh-info">Auto-refresh: 30s</span>
        </footer>
      </div>

      <style jsx>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .dashboard-container { min-height: 100vh; background: linear-gradient(135deg, #0a0e1a 0%, #0d1321 50%, #1a1f2e 100%); color: #00d4ff; font-family: 'Rajdhani', sans-serif; position: relative; overflow-x: hidden; }
        .grid-bg { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px); background-size: 50px 50px; animation: gridMove 20s linear infinite; pointer-events: none; z-index: 0; }
        @keyframes gridMove { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
        .scan-line { position: fixed; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #00d4ff, transparent); opacity: 0.3; animation: scan 4s linear infinite; pointer-events: none; z-index: 1000; }
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        .hud-top { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: linear-gradient(180deg, rgba(0,20,40,0.9) 0%, transparent 100%); border-bottom: 1px solid rgba(0,212,255,0.2); position: relative; z-index: 10; flex-wrap: wrap; gap: 15px; }
        .hud-left, .hud-right { display: flex; align-items: center; gap: 20px; }
        .status-indicator { display: flex; align-items: center; gap: 8px; }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; animation: statusPulse 2s infinite; }
        .status-dot.online { background: #00ff88; box-shadow: 0 0 10px #00ff88; }
        @keyframes statusPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .status-text { font-family: 'Orbitron', monospace; font-size: 0.8em; letter-spacing: 2px; }
        .location-info { display: flex; align-items: center; gap: 5px; font-size: 0.85em; color: rgba(0,212,255,0.7); }
        .hud-center { text-align: center; }
        .main-title { font-family: 'Orbitron', monospace; font-size: clamp(1.5em, 4vw, 2.5em); font-weight: 900; letter-spacing: 8px; color: #00d4ff; text-shadow: 0 0 20px rgba(0,212,255,0.5); }
        .title-k { color: #00ff88; text-shadow: 0 0 30px #00ff88; }
        .main-subtitle { font-size: 0.75em; letter-spacing: 4px; color: rgba(0,212,255,0.5); margin-top: 5px; }
        .time-display { text-align: right; }
        .time-value { font-family: 'Orbitron', monospace; font-size: 1.3em; font-weight: 700; display: block; }
        .date-value { font-size: 0.75em; color: rgba(0,212,255,0.6); text-transform: capitalize; }
        .weather-mini { display: flex; align-items: center; gap: 8px; padding: 8px 15px; background: rgba(0,212,255,0.1); border-radius: 20px; border: 1px solid rgba(0,212,255,0.2); }
        .weather-icon { font-size: 1.3em; }
        .weather-temp { font-family: 'Orbitron', monospace; font-weight: 700; }
        .panel-nav { display: flex; justify-content: center; gap: 10px; padding: 20px; flex-wrap: wrap; position: relative; z-index: 10; }
        .nav-btn { background: rgba(0,212,255,0.05); border: 1px solid rgba(0,212,255,0.3); color: rgba(0,212,255,0.7); padding: 12px 25px; border-radius: 5px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-family: 'Rajdhani', sans-serif; font-size: 0.9em; font-weight: 600; letter-spacing: 2px; transition: all 0.3s; position: relative; overflow: hidden; }
        .nav-btn:hover { background: rgba(0,212,255,0.1); border-color: #00d4ff; color: #00d4ff; transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,212,255,0.2); }
        .nav-btn.active { background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.1)); border-color: #00ff88; color: #00ff88; box-shadow: 0 0 30px rgba(0,255,136,0.2); }
        .nav-icon { font-size: 1.2em; }
        .main-content { padding: 20px 30px; min-height: calc(100vh - 250px); position: relative; z-index: 10; }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; max-width: 1400px; margin: 0 auto; }
        .widget { background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.2); border-radius: 10px; padding: 25px; backdrop-filter: blur(10px); position: relative; overflow: hidden; transition: all 0.3s; }
        .widget::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #00d4ff, #00ff88, #00d4ff); background-size: 200% 100%; animation: shimmer 3s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .widget:hover { border-color: rgba(0,212,255,0.5); box-shadow: 0 10px 40px rgba(0,212,255,0.15); transform: translateY(-3px); }
        .widget-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid rgba(0,212,255,0.1); }
        .widget-icon { font-size: 1.5em; }
        .widget-title { font-family: 'Orbitron', monospace; font-size: 0.8em; letter-spacing: 2px; color: rgba(0,212,255,0.8); }
        .reactor-widget { display: flex; align-items: center; gap: 30px; background: linear-gradient(135deg, rgba(0,50,100,0.4), rgba(0,20,40,0.6)); }
        .arc-reactor-mini { width: 100px; height: 100px; position: relative; }
        .reactor-core { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 30px; height: 30px; border-radius: 50%; background: radial-gradient(circle, #00d4ff, #0066cc); box-shadow: 0 0 30px #00d4ff, 0 0 60px rgba(0,212,255,0.5); }
        .reactor-ring { position: absolute; top: 50%; left: 50%; border-radius: 50%; border: 2px solid transparent; }
        .ring-1 { width: 50px; height: 50px; margin: -25px 0 0 -25px; border-color: rgba(0,212,255,0.5); animation: rotate 3s linear infinite; }
        .ring-2 { width: 70px; height: 70px; margin: -35px 0 0 -35px; border-color: rgba(0,212,255,0.3); animation: rotate 5s linear infinite reverse; }
        .ring-3 { width: 90px; height: 90px; margin: -45px 0 0 -45px; border-color: rgba(0,212,255,0.2); animation: rotate 7s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .reactor-stats { text-align: center; }
        .stat-value { font-family: 'Orbitron', monospace; font-size: 3em; font-weight: 900; display: block; text-shadow: 0 0 20px rgba(0,212,255,0.5); }
        .stat-label { font-size: 0.9em; letter-spacing: 2px; color: rgba(0,212,255,0.6); }
        .pipeline-value { text-align: center; margin-bottom: 20px; }
        .value-amount { font-family: 'Orbitron', monospace; font-size: 2.2em; font-weight: 700; color: #00ff88; text-shadow: 0 0 20px rgba(0,255,136,0.5); }
        .value-currency { font-size: 1em; margin-left: 5px; color: rgba(0,255,136,0.7); }
        .pipeline-bar-container { display: flex; height: 20px; border-radius: 10px; overflow: hidden; background: rgba(0,0,0,0.3); margin-bottom: 10px; }
        .pipeline-segment { height: 100%; background: linear-gradient(90deg, #00d4ff, #00ff88); transition: width 0.5s; border-right: 1px solid rgba(0,0,0,0.3); }
        .pipeline-count { text-align: center; font-size: 0.85em; color: rgba(0,212,255,0.6); }
        .clients-count { text-align: center; margin-bottom: 20px; }
        .count-value { font-family: 'Orbitron', monospace; font-size: 3em; font-weight: 900; display: block; }
        .count-label { font-size: 0.9em; letter-spacing: 2px; color: rgba(0,212,255,0.6); }
        .clients-breakdown { display: flex; flex-direction: column; gap: 10px; }
        .breakdown-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: rgba(0,0,0,0.2); border-radius: 5px; }
        .breakdown-dot { width: 10px; height: 10px; border-radius: 50%; }
        .breakdown-dot.active { background: #00ff88; box-shadow: 0 0 10px #00ff88; }
        .breakdown-dot.prospect { background: #ffa500; box-shadow: 0 0 10px #ffa500; }
        .breakdown-value { margin-left: auto; font-family: 'Orbitron', monospace; font-weight: 700; }
        .crypto-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,212,255,0.1); }
        .crypto-symbol { font-family: 'Orbitron', monospace; font-weight: 700; padding: 5px 12px; border-radius: 5px; margin-right: 15px; }
        .crypto-symbol.btc { background: rgba(247,147,26,0.2); color: #f7931a; }
        .crypto-symbol.eth { background: rgba(98,126,234,0.2); color: #627eea; }
        .crypto-price { flex: 1; font-family: 'Orbitron', monospace; font-size: 1.1em; }
        .crypto-change { font-size: 0.85em; padding: 4px 10px; border-radius: 10px; }
        .crypto-change.up { background: rgba(0,255,136,0.2); color: #00ff88; }
        .crypto-change.down { background: rgba(255,71,87,0.2); color: #ff4757; }
        .forex-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,212,255,0.1); }
        .forex-flag { font-size: 1.5em; margin-right: 10px; }
        .forex-pair { flex: 1; color: rgba(0,212,255,0.7); }
        .forex-rate { font-family: 'Orbitron', monospace; font-weight: 700; color: #00d4ff; }
        .actions-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .action-btn { background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); color: #00d4ff; padding: 15px 10px; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; font-family: 'Rajdhani', sans-serif; font-size: 0.85em; transition: all 0.3s; }
        .action-btn:hover { background: rgba(0,212,255,0.2); border-color: #00d4ff; transform: scale(1.05); box-shadow: 0 5px 20px rgba(0,212,255,0.2); }
        .action-icon { font-size: 1.5em; }
        .crm-panel, .credits-panel, .intel-panel { max-width: 1200px; margin: 0 auto; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px; }
        .panel-header h2 { font-family: 'Orbitron', monospace; font-size: 1.2em; letter-spacing: 3px; }
        .search-box { display: flex; align-items: center; background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.3); border-radius: 25px; padding: 10px 20px; }
        .search-icon { margin-right: 10px; }
        .search-input { background: transparent; border: none; color: #00d4ff; font-family: 'Rajdhani', sans-serif; font-size: 1em; outline: none; width: 250px; }
        .search-input::placeholder { color: rgba(0,212,255,0.5); }
        .clients-list { display: flex; flex-direction: column; gap: 15px; }
        .client-card { display: flex; align-items: center; background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.2); border-radius: 10px; padding: 20px; gap: 20px; transition: all 0.3s; flex-wrap: wrap; }
        .client-card:hover { border-color: rgba(0,212,255,0.5); box-shadow: 0 5px 30px rgba(0,212,255,0.1); transform: translateX(5px); }
        .client-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #00d4ff, #00ff88); display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', monospace; font-weight: 700; font-size: 1.3em; color: #000; flex-shrink: 0; }
        .client-info { flex: 1; min-width: 150px; }
        .client-name { font-size: 1.1em; font-weight: 700; margin-bottom: 5px; }
        .client-meta { color: rgba(0,212,255,0.6); font-size: 0.9em; }
        .client-contact { color: rgba(0,212,255,0.5); font-size: 0.85em; }
        .client-score { text-align: center; }
        .score-ring { width: 60px; height: 60px; border-radius: 50%; background: conic-gradient(#00ff88 0deg, #00ff88 calc(var(--score, 50) * 3.6deg), rgba(0,212,255,0.2) calc(var(--score, 50) * 3.6deg)); display: flex; align-items: center; justify-content: center; position: relative; }
        .score-ring::before { content: ''; position: absolute; width: 45px; height: 45px; border-radius: 50%; background: rgba(0,20,40,0.9); }
        .score-ring .score-value { position: relative; font-family: 'Orbitron', monospace; font-weight: 700; font-size: 1.1em; color: #00ff88; }
        .score-label { display: block; font-size: 0.7em; margin-top: 5px; color: rgba(0,212,255,0.6); }
        .client-status { min-width: 80px; text-align: center; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 15px; font-size: 0.75em; font-weight: 600; letter-spacing: 1px; }
        .status-badge.actif { background: rgba(0,255,136,0.2); color: #00ff88; border: 1px solid rgba(0,255,136,0.3); }
        .status-badge.prospect { background: rgba(255,165,0,0.2); color: #ffa500; border: 1px solid rgba(255,165,0,0.3); }
        .empty-state { text-align: center; padding: 60px; color: rgba(0,212,255,0.5); }
        .empty-icon { font-size: 4em; display: block; margin-bottom: 20px; }
        .empty-hint { font-size: 0.9em; margin-top: 10px; color: rgba(0,212,255,0.3); }
        .simulator-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .sim-card { background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.2); border-radius: 10px; padding: 25px; }
        .sim-card h3 { margin-bottom: 10px; }
        .sim-rate { color: rgba(0,212,255,0.6); margin-bottom: 20px; }
        .sim-fields { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; }
        .sim-field label { display: block; color: rgba(0,212,255,0.7); margin-bottom: 5px; font-size: 0.9em; }
        .sim-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,212,255,0.3); border-radius: 5px; padding: 12px; color: #00d4ff; font-family: 'Orbitron', monospace; font-size: 1.1em; }
        .sim-input:focus { outline: none; border-color: #00d4ff; box-shadow: 0 0 10px rgba(0,212,255,0.3); }
        .sim-calculate { width: 100%; padding: 15px; border: none; border-radius: 5px; font-family: 'Orbitron', monospace; font-size: 0.9em; letter-spacing: 2px; cursor: pointer; transition: all 0.3s; background: linear-gradient(90deg, #00d4ff, #00ff88); color: #000; }
        .sim-calculate:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,212,255,0.4); }
        .intel-search { display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; }
        .intel-input { flex: 1; min-width: 200px; background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.3); border-radius: 5px; padding: 15px 20px; color: #00d4ff; font-size: 1em; }
        .intel-input:focus { outline: none; border-color: #00d4ff; box-shadow: 0 0 10px rgba(0,212,255,0.3); }
        .intel-btn { background: linear-gradient(90deg, #00d4ff, #00ff88); border: none; padding: 15px 30px; border-radius: 5px; font-family: 'Orbitron', monospace; font-size: 0.9em; letter-spacing: 2px; cursor: pointer; color: #000; transition: all 0.3s; }
        .intel-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,212,255,0.4); }
        .intel-sources h4 { margin-bottom: 15px; color: rgba(0,212,255,0.7); }
        .source-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .source-item { display: flex; align-items: center; gap: 10px; background: rgba(0,20,40,0.6); border: 1px solid rgba(0,212,255,0.2); border-radius: 8px; padding: 15px; }
        .source-item.connected { border-color: rgba(0,255,136,0.3); }
        .source-status { margin-left: auto; font-size: 0.75em; color: #00ff88; font-weight: 600; }
        .hud-bottom { display: flex; justify-content: space-between; align-items: center; padding: 15px 30px; background: linear-gradient(0deg, rgba(0,20,40,0.9) 0%, transparent 100%); border-top: 1px solid rgba(0,212,255,0.2); position: relative; z-index: 10; flex-wrap: wrap; gap: 15px; }
        .version { font-family: 'Orbitron', monospace; font-size: 0.75em; color: rgba(0,212,255,0.5); letter-spacing: 2px; }
        .voice-btn { display: flex; align-items: center; gap: 10px; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); color: #00d4ff; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-family: 'Orbitron', monospace; font-size: 0.85em; transition: all 0.3s; }
        .voice-btn:hover { background: rgba(0,212,255,0.2); border-color: #00d4ff; }
        .voice-icon { font-size: 1.2em; }
        .refresh-info { font-size: 0.8em; color: rgba(0,212,255,0.5); }
        @media (max-width: 768px) { .hud-top { flex-direction: column; padding: 15px; } .main-content { padding: 15px; } .dashboard-grid { grid-template-columns: 1fr; } .reactor-widget { flex-direction: column; text-align: center; } .panel-header { flex-direction: column; text-align: center; } .search-input { width: 100%; } .hud-bottom { flex-direction: column; } .intel-search { flex-direction: column; } }
      `}</style>
    </>
  );
}

