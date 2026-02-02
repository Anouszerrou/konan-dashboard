import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

// ═══════════════════════════════════════════════════════════════════
//                    INTERFACES
// ═══════════════════════════════════════════════════════════════════

interface Client {
  id: string
  nom: string
  type: string
  secteur: string
  contact: string
  score: number
  statut: string
  ca_annuel?: number
  ville?: string
}

interface Deal {
  titre: string
  client: string
  montant: number
  stage: string
}

interface DashboardData {
  clients: Record<string, Client>
  pipeline: Record<string, Deal>
  stats: {
    skills: number
    lastUpdate: string
  }
}

interface CryptoData {
  bitcoin?: { usd: number; usd_24h_change?: number }
  ethereum?: { usd: number; usd_24h_change?: number }
}

interface ForexData {
  usd: number
  eur: number
}

// ═══════════════════════════════════════════════════════════════════
//                    COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export default function KonanJarvis() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [crypto, setCrypto] = useState<CryptoData>({})
  const [forex, setForex] = useState<ForexData>({ usd: 10.05, eur: 10.85 })
  const [weather, setWeather] = useState<{ temp: number; description: string; icon: string }>({ temp: 0, description: '', icon: '☀️' })
  const [time, setTime] = useState(new Date())
  const [activePanel, setActivePanel] = useState<'dashboard' | 'crm' | 'credits' | 'intel'>('dashboard')
  const [systemStatus, setSystemStatus] = useState('ONLINE')
  const [voiceActive, setVoiceActive] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/data.json')
        const json = await res.json()
        setData(json)
      } catch (e) {
        console.error('Data load error:', e)
      }
    }

    const loadCrypto = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
        const json = await res.json()
        setCrypto(json)
      } catch (e) {}
    }

    const loadForex = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/MAD')
        const json = await res.json()
        if (json.rates) {
          setForex({
            usd: 1 / (json.rates.USD || 0.099),
            eur: 1 / (json.rates.EUR || 0.092)
          })
        }
      } catch (e) {}
    }

    const loadWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.68&longitude=-1.91&current_weather=true')
        const json = await res.json()
        if (json.current_weather) {
          const codes: Record<number, { text: string; icon: string }> = {
            0: { text: 'Clair', icon: '☀️' },
            1: { text: 'Dégagé', icon: '🌤️' },
            2: { text: 'Nuageux', icon: '⛅' },
            3: { text: 'Couvert', icon: '☁️' },
            45: { text: 'Brouillard', icon: '🌫️' },
            61: { text: 'Pluie', icon: '🌧️' },
            80: { text: 'Averses', icon: '🌦️' }
          }
          const w = codes[json.current_weather.weathercode] || { text: 'Variable', icon: '🌈' }
          setWeather({
            temp: json.current_weather.temperature,
            description: w.text,
            icon: w.icon
          })
        }
      } catch (e) {}
    }

    loadData()
    loadCrypto()
    loadForex()
    loadWeather()

    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      loadData()
      loadCrypto()
      loadForex()
    }, 120000)

    return () => clearInterval(interval)
  }, [])

  // Startup sound effect
  useEffect(() => {
    setSystemStatus('INITIALIZING...')
    setTimeout(() => setSystemStatus('ONLINE'), 2000)
  }, [])

  if (!data) {
    return (
      <div className="boot-screen">
        <div className="boot-logo">
          <div className="arc-reactor"></div>
        </div>
        <div className="boot-text">
          <span className="boot-line">KONAN SYSTEM v3.0</span>
          <span className="boot-line typing">Initializing neural networks...</span>
          <div className="boot-progress">
            <div className="boot-bar"></div>
          </div>
        </div>
        <style jsx>{\
          .boot-screen {
            min-height: 100vh;
            background: radial-gradient(ellipse at center, #0a1628 0%, #000 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #00d4ff;
            font-family: 'Orbitron', 'Segoe UI', sans-serif;
          }
          .arc-reactor {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: radial-gradient(circle, #00d4ff 0%, #0066cc 50%, transparent 70%);
            box-shadow: 0 0 60px #00d4ff, 0 0 100px #00d4ff, inset 0 0 40px rgba(0,212,255,0.5);
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
          .boot-text {
            margin-top: 40px;
            text-align: center;
          }
          .boot-line {
            display: block;
            margin: 10px 0;
            font-size: 1.2em;
            letter-spacing: 3px;
          }
          .typing {
            font-size: 0.9em;
            color: #00ff88;
            animation: blink 0.5s infinite;
          }
          @keyframes blink {
            50% { opacity: 0.5; }
          }
          .boot-progress {
            width: 300px;
            height: 4px;
            background: rgba(0,212,255,0.2);
            border-radius: 2px;
            margin-top: 30px;
            overflow: hidden;
          }
          .boot-bar {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #00d4ff, #00ff88);
            animation: loading 2s ease-out forwards;
          }
          @keyframes loading {
            to { width: 100%; }
          }
        \}</style>
      </div>
    )
  }

  const clients = Object.values(data.clients)
  const deals = Object.values(data.pipeline)
  const pipelineValue = deals.reduce((sum, d) => sum + d.montant, 0)
  const btcPrice = crypto.bitcoin?.usd || 0
  const btcChange = crypto.bitcoin?.usd_24h_change || 0
  const ethPrice = crypto.ethereum?.usd || 0

  return (
    <>
      <Head>
        <title>KONAN // JARVIS DASHBOARD</title>
        <meta name="description" content="KONAN - Advanced AI Assistant Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>" />
      </Head>

      <div className="jarvis-container">
        {/* Animated background grid */}
        <div className="grid-background"></div>
        <div className="scan-line"></div>

        {/* Top HUD */}
        <header className="hud-top">
          <div className="hud-left">
            <div className="status-indicator">
              <span className={\status-dot \\}></span>
              <span className="status-text">{systemStatus}</span>
            </div>
            <div className="location-info">
              <span className="location-icon">📍</span>
              <span>OUJDA, MAROC</span>
            </div>
          </div>

          <div className="hud-center">
            <h1 className="main-title">
              <span className="title-k">K</span>ONAN
            </h1>
            <p className="main-subtitle">CCPRO COMMAND CENTER</p>
          </div>

          <div className="hud-right">
            <div className="time-display">
              <span className="time-value">{time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span className="date-value">{time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="weather-mini">
              <span className="weather-icon">{weather.icon}</span>
              <span className="weather-temp">{weather.temp}°C</span>
            </div>
          </div>
        </header>

        {/* Navigation Panels */}
        <nav className="panel-nav">
          {[
            { id: 'dashboard', icon: '◉', label: 'DASHBOARD' },
            { id: 'crm', icon: '◈', label: 'CLIENTS CRM' },
            { id: 'credits', icon: '◆', label: 'CRÉDITS PRO' },
            { id: 'intel', icon: '◇', label: 'BUSINESS INTEL' },
          ].map(item => (
            <button
              key={item.id}
              className={\
av-btn \\}
              onClick={() => setActivePanel(item.id as any)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {activePanel === 'dashboard' && (
            <div className="dashboard-grid">
              {/* Arc Reactor Stats */}
              <div className="widget reactor-widget">
                <div className="arc-reactor-mini">
                  <div className="reactor-core"></div>
                  <div className="reactor-ring ring-1"></div>
                  <div className="reactor-ring ring-2"></div>
                  <div className="reactor-ring ring-3"></div>
                </div>
                <div className="reactor-stats">
                  <span className="stat-value">{data.stats.skills}</span>
                  <span className="stat-label">SKILLS ACTIFS</span>
                </div>
              </div>

              {/* Pipeline Widget */}
              <div className="widget pipeline-widget">
                <div className="widget-header">
                  <span className="widget-icon">💼</span>
                  <span className="widget-title">PIPELINE DEALS</span>
                </div>
                <div className="pipeline-value">
                  <span className="value-amount">{pipelineValue.toLocaleString()}</span>
                  <span className="value-currency">MAD</span>
                </div>
                <div className="pipeline-bar-container">
                  {deals.map((deal, i) => (
                    <div
                      key={i}
                      className="pipeline-segment"
                      style={{ width: \\%\ }}
                      title={\\: \ MAD\}
                    />
                  ))}
                </div>
                <div className="pipeline-count">{deals.length} deals en cours</div>
              </div>

              {/* Clients Widget */}
              <div className="widget clients-widget">
                <div className="widget-header">
                  <span className="widget-icon">👥</span>
                  <span className="widget-title">PORTEFEUILLE CLIENTS</span>
                </div>
                <div className="clients-count">
                  <span className="count-value">{clients.length}</span>
                  <span className="count-label">CLIENTS</span>
                </div>
                <div className="clients-breakdown">
                  <div className="breakdown-item">
                    <span className="breakdown-dot active"></span>
                    <span>Actifs</span>
                    <span className="breakdown-value">{clients.filter(c => c.statut === 'actif').length}</span>
                  </div>
                  <div className="breakdown-item">
                    <span className="breakdown-dot prospect"></span>
                    <span>Prospects</span>
                    <span className="breakdown-value">{clients.filter(c => c.statut === 'prospect').length}</span>
                  </div>
                </div>
              </div>

              {/* Crypto Widget */}
              <div className="widget crypto-widget">
                <div className="widget-header">
                  <span className="widget-icon">₿</span>
                  <span className="widget-title">CRYPTO MARKETS</span>
                </div>
                <div className="crypto-item">
                  <span className="crypto-symbol btc">BTC</span>
                  <span className="crypto-price">\</span>
                  <span className={\crypto-change \\}>
                    {btcChange >= 0 ? '▲' : '▼'} {Math.abs(btcChange).toFixed(2)}%
                  </span>
                </div>
                <div className="crypto-item">
                  <span className="crypto-symbol eth">ETH</span>
                  <span className="crypto-price">\</span>
                </div>
              </div>

              {/* Forex Widget */}
              <div className="widget forex-widget">
                <div className="widget-header">
                  <span className="widget-icon">💱</span>
                  <span className="widget-title">FOREX MAD</span>
                </div>
                <div className="forex-item">
                  <span className="forex-flag">🇺🇸</span>
                  <span className="forex-pair">USD/MAD</span>
                  <span className="forex-rate">{forex.usd.toFixed(4)}</span>
                </div>
                <div className="forex-item">
                  <span className="forex-flag">🇪🇺</span>
                  <span className="forex-pair">EUR/MAD</span>
                  <span className="forex-rate">{forex.eur.toFixed(4)}</span>
                </div>
              </div>

              {/* CCPRO Quick Actions */}
              <div className="widget actions-widget">
                <div className="widget-header">
                  <span className="widget-icon">⚡</span>
                  <span className="widget-title">ACTIONS RAPIDES</span>
                </div>
                <div className="actions-grid">
                  <button className="action-btn">
                    <span className="action-icon">📊</span>
                    <span>Simuler Crédit</span>
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">🔍</span>
                    <span>Recherche Entreprise</span>
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">📄</span>
                    <span>Générer PDF</span>
                  </button>
                  <button className="action-btn">
                    <span className="action-icon">💬</span>
                    <span>Post LinkedIn</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePanel === 'crm' && (
            <div className="crm-panel">
              <div className="panel-header">
                <h2>GESTION PORTEFEUILLE CLIENTS</h2>
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input type="text" placeholder="Rechercher un client..." className="search-input" />
                </div>
              </div>
              <div className="clients-list">
                {clients.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <p>Aucun client dans le CRM</p>
                    <p className="empty-hint">Utilisez 'konan client add' pour ajouter des clients</p>
                  </div>
                ) : (
                  clients.map(client => (
                    <div key={client.id} className="client-card">
                      <div className="client-avatar">
                        <span>{client.nom.charAt(0)}</span>
                      </div>
                      <div className="client-info">
                        <h3 className="client-name">{client.nom}</h3>
                        <p className="client-meta">{client.type} • {client.secteur}</p>
                        <p className="client-contact">{client.contact}</p>
                      </div>
                      <div className="client-score">
                        <div className="score-ring" style={{ '--score': client.score } as any}>
                          <span className="score-value">{client.score}</span>
                        </div>
                        <span className="score-label">SCORE</span>
                      </div>
                      <div className="client-status">
                        <span className={\status-badge \\}>{client.statut.toUpperCase()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activePanel === 'credits' && (
            <div className="credits-panel">
              <div className="panel-header">
                <h2>SIMULATEUR CRÉDITS PRO</h2>
              </div>
              <div className="simulator-container">
                <div className="sim-card">
                  <h3>💰 Crédit Professionnel</h3>
                  <p className="sim-rate">Taux indicatif: 5.5%</p>
                  <div className="sim-fields">
                    <div className="sim-field">
                      <label>Montant (MAD)</label>
                      <input type="number" defaultValue={500000} className="sim-input" />
                    </div>
                    <div className="sim-field">
                      <label>Durée (mois)</label>
                      <input type="number" defaultValue={60} className="sim-input" />
                    </div>
                  </div>
                  <button className="sim-calculate">CALCULER</button>
                </div>
                <div className="sim-card">
                  <h3>🏢 Crédit Équipement</h3>
                  <p className="sim-rate">Taux indicatif: 5.0%</p>
                  <button className="sim-select">SÉLECTIONNER</button>
                </div>
                <div className="sim-card">
                  <h3>🏠 Crédit Immobilier Pro</h3>
                  <p className="sim-rate">Taux indicatif: 4.5%</p>
                  <button className="sim-select">SÉLECTIONNER</button>
                </div>
              </div>
            </div>
          )}

          {activePanel === 'intel' && (
            <div className="intel-panel">
              <div className="panel-header">
                <h2>BUSINESS INTELLIGENCE MAROC</h2>
              </div>
              <div className="intel-search">
                <input type="text" placeholder="Rechercher une entreprise (RC, ICE, Nom)..." className="intel-input" />
                <button className="intel-btn">RECHERCHER</button>
              </div>
              <div className="intel-sources">
                <h4>Sources de données</h4>
                <div className="source-grid">
                  <div className="source-item connected">
                    <span className="source-icon">🔗</span>
                    <span>Charika.ma</span>
                    <span className="source-status">CONNECTÉ</span>
                  </div>
                  <div className="source-item connected">
                    <span className="source-icon">🔗</span>
                    <span>DirectInfo</span>
                    <span className="source-status">CONNECTÉ</span>
                  </div>
                  <div className="source-item connected">
                    <span className="source-icon">🔗</span>
                    <span>Societe-maroc</span>
                    <span className="source-status">CONNECTÉ</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom HUD */}
        <footer className="hud-bottom">
          <div className="hud-bottom-left">
            <span className="version">KONAN v3.0 // JARVIS EDITION</span>
          </div>
          <div className="hud-bottom-center">
            <button className="voice-btn" onClick={() => setVoiceActive(!voiceActive)}>
              <span className={\oice-icon \\}>🎙️</span>
              <span>{voiceActive ? 'ÉCOUTE...' : 'ACTIVER VOIX'}</span>
            </button>
          </div>
          <div className="hud-bottom-right">
            <span className="refresh-info">🔄 Auto-refresh: 2min</span>
          </div>
        </footer>
      </div>

      <style jsx>{\
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&display=swap');

        :global(*) {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :global(body) {
          background: #000;
          overflow-x: hidden;
        }

        .jarvis-container {
          min-height: 100vh;
          background: radial-gradient(ellipse at top, #0a1628 0%, #000510 50%, #000 100%);
          color: #00d4ff;
          font-family: 'Rajdhani', 'Segoe UI', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Animated Grid Background */
        .grid-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        /* Scan Line Effect */
        .scan-line {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, #00d4ff, transparent);
          opacity: 0.3;
          animation: scan 4s linear infinite;
          pointer-events: none;
          z-index: 1000;
        }

        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        /* TOP HUD */
        .hud-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          background: linear-gradient(180deg, rgba(0,20,40,0.9) 0%, transparent 100%);
          border-bottom: 1px solid rgba(0,212,255,0.2);
          position: relative;
          z-index: 10;
        }

        .hud-left, .hud-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          animation: statusPulse 2s infinite;
        }

        .status-dot.online {
          background: #00ff88;
          box-shadow: 0 0 10px #00ff88;
        }

        .status-dot.loading {
          background: #ffa500;
          box-shadow: 0 0 10px #ffa500;
        }

        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .status-text {
          font-family: 'Orbitron', monospace;
          font-size: 0.8em;
          letter-spacing: 2px;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.85em;
          color: rgba(0,212,255,0.7);
        }

        .hud-center {
          text-align: center;
        }

        .main-title {
          font-family: 'Orbitron', monospace;
          font-size: clamp(1.5em, 4vw, 2.5em);
          font-weight: 900;
          letter-spacing: 8px;
          color: #00d4ff;
          text-shadow: 0 0 20px rgba(0,212,255,0.5);
        }

        .title-k {
          color: #00ff88;
          text-shadow: 0 0 30px #00ff88;
        }

        .main-subtitle {
          font-size: 0.75em;
          letter-spacing: 4px;
          color: rgba(0,212,255,0.5);
          margin-top: 5px;
        }

        .time-display {
          text-align: right;
        }

        .time-value {
          font-family: 'Orbitron', monospace;
          font-size: 1.3em;
          font-weight: 700;
          display: block;
        }

        .date-value {
          font-size: 0.75em;
          color: rgba(0,212,255,0.6);
          text-transform: capitalize;
        }

        .weather-mini {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 15px;
          background: rgba(0,212,255,0.1);
          border-radius: 20px;
          border: 1px solid rgba(0,212,255,0.2);
        }

        .weather-icon {
          font-size: 1.3em;
        }

        .weather-temp {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
        }

        /* NAVIGATION */
        .panel-nav {
          display: flex;
          justify-content: center;
          gap: 10px;
          padding: 20px;
          flex-wrap: wrap;
          position: relative;
          z-index: 10;
        }

        .nav-btn {
          background: rgba(0,212,255,0.05);
          border: 1px solid rgba(0,212,255,0.3);
          color: rgba(0,212,255,0.7);
          padding: 12px 25px;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.9em;
          font-weight: 600;
          letter-spacing: 2px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .nav-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent);
          transition: left 0.5s;
        }

        .nav-btn:hover::before {
          left: 100%;
        }

        .nav-btn:hover {
          background: rgba(0,212,255,0.1);
          border-color: #00d4ff;
          color: #00d4ff;
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0,212,255,0.2);
        }

        .nav-btn.active {
          background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,255,136,0.1));
          border-color: #00ff88;
          color: #00ff88;
          box-shadow: 0 0 30px rgba(0,255,136,0.2), inset 0 0 20px rgba(0,255,136,0.1);
        }

        .nav-icon {
          font-size: 1.2em;
        }

        /* MAIN CONTENT */
        .main-content {
          padding: 20px 30px;
          min-height: calc(100vh - 250px);
          position: relative;
          z-index: 10;
        }

        /* DASHBOARD GRID */
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .widget {
          background: rgba(0,20,40,0.6);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 10px;
          padding: 25px;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
        }

        .widget::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #00d4ff, #00ff88, #00d4ff);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .widget:hover {
          border-color: rgba(0,212,255,0.5);
          box-shadow: 0 10px 40px rgba(0,212,255,0.15);
          transform: translateY(-3px);
        }

        .widget-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(0,212,255,0.1);
        }

        .widget-icon {
          font-size: 1.5em;
        }

        .widget-title {
          font-family: 'Orbitron', monospace;
          font-size: 0.8em;
          letter-spacing: 2px;
          color: rgba(0,212,255,0.8);
        }

        /* Arc Reactor Widget */
        .reactor-widget {
          display: flex;
          align-items: center;
          gap: 30px;
          background: linear-gradient(135deg, rgba(0,50,100,0.4), rgba(0,20,40,0.6));
        }

        .arc-reactor-mini {
          width: 100px;
          height: 100px;
          position: relative;
        }

        .reactor-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: radial-gradient(circle, #00d4ff, #0066cc);
          box-shadow: 0 0 30px #00d4ff, 0 0 60px rgba(0,212,255,0.5);
        }

        .reactor-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          border: 2px solid transparent;
        }

        .ring-1 {
          width: 50px;
          height: 50px;
          margin: -25px 0 0 -25px;
          border-color: rgba(0,212,255,0.5);
          animation: rotate 3s linear infinite;
        }

        .ring-2 {
          width: 70px;
          height: 70px;
          margin: -35px 0 0 -35px;
          border-color: rgba(0,212,255,0.3);
          animation: rotate 5s linear infinite reverse;
        }

        .ring-3 {
          width: 90px;
          height: 90px;
          margin: -45px 0 0 -45px;
          border-color: rgba(0,212,255,0.2);
          animation: rotate 7s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .reactor-stats {
          text-align: center;
        }

        .stat-value {
          font-family: 'Orbitron', monospace;
          font-size: 3em;
          font-weight: 900;
          display: block;
          text-shadow: 0 0 20px rgba(0,212,255,0.5);
        }

        .stat-label {
          font-size: 0.9em;
          letter-spacing: 2px;
          color: rgba(0,212,255,0.6);
        }

        /* Pipeline Widget */
        .pipeline-value {
          text-align: center;
          margin-bottom: 20px;
        }

        .value-amount {
          font-family: 'Orbitron', monospace;
          font-size: 2.2em;
          font-weight: 700;
          color: #00ff88;
          text-shadow: 0 0 20px rgba(0,255,136,0.5);
        }

        .value-currency {
          font-size: 1em;
          margin-left: 5px;
          color: rgba(0,255,136,0.7);
        }

        .pipeline-bar-container {
          display: flex;
          height: 20px;
          border-radius: 10px;
          overflow: hidden;
          background: rgba(0,0,0,0.3);
          margin-bottom: 10px;
        }

        .pipeline-segment {
          height: 100%;
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          transition: width 0.5s;
          border-right: 1px solid rgba(0,0,0,0.3);
        }

        .pipeline-segment:hover {
          filter: brightness(1.2);
        }

        .pipeline-count {
          text-align: center;
          font-size: 0.85em;
          color: rgba(0,212,255,0.6);
        }

        /* Clients Widget */
        .clients-count {
          text-align: center;
          margin-bottom: 20px;
        }

        .count-value {
          font-family: 'Orbitron', monospace;
          font-size: 3em;
          font-weight: 900;
          display: block;
        }

        .count-label {
          font-size: 0.9em;
          letter-spacing: 2px;
          color: rgba(0,212,255,0.6);
        }

        .clients-breakdown {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: rgba(0,0,0,0.2);
          border-radius: 5px;
        }

        .breakdown-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .breakdown-dot.active {
          background: #00ff88;
          box-shadow: 0 0 10px #00ff88;
        }

        .breakdown-dot.prospect {
          background: #ffa500;
          box-shadow: 0 0 10px #ffa500;
        }

        .breakdown-value {
          margin-left: auto;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
        }

        /* Crypto Widget */
        .crypto-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0,212,255,0.1);
        }

        .crypto-symbol {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 5px;
          margin-right: 15px;
        }

        .crypto-symbol.btc {
          background: rgba(247,147,26,0.2);
          color: #f7931a;
        }

        .crypto-symbol.eth {
          background: rgba(98,126,234,0.2);
          color: #627eea;
        }

        .crypto-price {
          flex: 1;
          font-family: 'Orbitron', monospace;
          font-size: 1.1em;
        }

        .crypto-change {
          font-size: 0.85em;
          padding: 4px 10px;
          border-radius: 10px;
        }

        .crypto-change.up {
          background: rgba(0,255,136,0.2);
          color: #00ff88;
        }

        .crypto-change.down {
          background: rgba(255,71,87,0.2);
          color: #ff4757;
        }

        /* Forex Widget */
        .forex-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0,212,255,0.1);
        }

        .forex-flag {
          font-size: 1.5em;
          margin-right: 10px;
        }

        .forex-pair {
          flex: 1;
          color: rgba(0,212,255,0.7);
        }

        .forex-rate {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: #00d4ff;
        }

        /* Actions Widget */
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .action-btn {
          background: rgba(0,212,255,0.1);
          border: 1px solid rgba(0,212,255,0.3);
          color: #00d4ff;
          padding: 15px 10px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.85em;
          transition: all 0.3s;
        }

        .action-btn:hover {
          background: rgba(0,212,255,0.2);
          border-color: #00d4ff;
          transform: scale(1.05);
          box-shadow: 0 5px 20px rgba(0,212,255,0.2);
        }

        .action-icon {
          font-size: 1.5em;
        }

        /* CRM Panel */
        .crm-panel, .credits-panel, .intel-panel {
          max-width: 1200px;
          margin: 0 auto;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .panel-header h2 {
          font-family: 'Orbitron', monospace;
          font-size: 1.2em;
          letter-spacing: 3px;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: rgba(0,20,40,0.6);
          border: 1px solid rgba(0,212,255,0.3);
          border-radius: 25px;
          padding: 10px 20px;
        }

        .search-icon {
          margin-right: 10px;
        }

        .search-input {
          background: transparent;
          border: none;
          color: #00d4ff;
          font-family: 'Rajdhani', sans-serif;
          font-size: 1em;
          outline: none;
          width: 250px;
        }

        .search-input::placeholder {
          color: rgba(0,212,255,0.5);
        }

        .clients-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .client-card {
          display: flex;
          align-items: center;
          background: rgba(0,20,40,0.6);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 10px;
          padding: 20px;
          gap: 20px;
          transition: all 0.3s;
        }

        .client-card:hover {
          border-color: rgba(0,212,255,0.5);
          box-shadow: 0 5px 30px rgba(0,212,255,0.1);
          transform: translateX(5px);
        }

        .client-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00d4ff, #00ff88);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 1.3em;
          color: #000;
        }

        .client-info {
          flex: 1;
        }

        .client-name {
          font-size: 1.1em;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .client-meta {
          color: rgba(0,212,255,0.6);
          font-size: 0.9em;
        }

        .client-contact {
          color: rgba(0,212,255,0.5);
          font-size: 0.85em;
        }

        .client-score {
          text-align: center;
        }

        .score-ring {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: conic-gradient(#00ff88 0deg, #00ff88 calc(var(--score, 50) * 3.6deg), rgba(0,212,255,0.2) calc(var(--score, 50) * 3.6deg));
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .score-ring::before {
          content: '';
          position: absolute;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: rgba(0,20,40,0.9);
        }

        .score-ring .score-value {
          position: relative;
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 1.1em;
          color: #00ff88;
        }

        .score-label {
          display: block;
          font-size: 0.7em;
          margin-top: 5px;
          color: rgba(0,212,255,0.6);
        }

        .client-status {
          min-width: 80px;
          text-align: center;
        }

        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 15px;
          font-size: 0.75em;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .status-badge.actif {
          background: rgba(0,255,136,0.2);
          color: #00ff88;
          border: 1px solid rgba(0,255,136,0.3);
        }

        .status-badge.prospect {
          background: rgba(255,165,0,0.2);
          color: #ffa500;
          border: 1px solid rgba(255,165,0,0.3);
        }

        .empty-state {
          text-align: center;
          padding: 60px;
          color: rgba(0,212,255,0.5);
        }

        .empty-icon {
          font-size: 4em;
          display: block;
          margin-bottom: 20px;
        }

        .empty-hint {
          font-size: 0.9em;
          margin-top: 10px;
          color: rgba(0,212,255,0.3);
        }

        /* Credits Panel */
        .simulator-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .sim-card {
          background: rgba(0,20,40,0.6);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 10px;
          padding: 25px;
        }

        .sim-card h3 {
          margin-bottom: 10px;
        }

        .sim-rate {
          color: rgba(0,212,255,0.6);
          margin-bottom: 20px;
        }

        .sim-fields {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .sim-field label {
          display: block;
          color: rgba(0,212,255,0.7);
          margin-bottom: 5px;
          font-size: 0.9em;
        }

        .sim-input {
          width: 100%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(0,212,255,0.3);
          border-radius: 5px;
          padding: 12px;
          color: #00d4ff;
          font-family: 'Orbitron', monospace;
          font-size: 1.1em;
        }

        .sim-input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 10px rgba(0,212,255,0.3);
        }

        .sim-calculate, .sim-select {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 5px;
          font-family: 'Orbitron', monospace;
          font-size: 0.9em;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .sim-calculate {
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          color: #000;
        }

        .sim-calculate:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0,212,255,0.4);
        }

        .sim-select {
          background: rgba(0,212,255,0.1);
          color: #00d4ff;
          border: 1px solid rgba(0,212,255,0.3);
        }

        .sim-select:hover {
          background: rgba(0,212,255,0.2);
          border-color: #00d4ff;
        }

        /* Intel Panel */
        .intel-search {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }

        .intel-input {
          flex: 1;
          background: rgba(0,20,40,0.6);
          border: 1px solid rgba(0,212,255,0.3);
          border-radius: 5px;
          padding: 15px 20px;
          color: #00d4ff;
          font-size: 1em;
        }

        .intel-input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 10px rgba(0,212,255,0.3);
        }

        .intel-btn {
          background: linear-gradient(90deg, #00d4ff, #00ff88);
          border: none;
          padding: 15px 30px;
          border-radius: 5px;
          font-family: 'Orbitron', monospace;
          font-size: 0.9em;
          letter-spacing: 2px;
          cursor: pointer;
          color: #000;
          transition: all 0.3s;
        }

        .intel-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(0,212,255,0.4);
        }

        .intel-sources h4 {
          margin-bottom: 15px;
          color: rgba(0,212,255,0.7);
        }

        .source-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .source-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,20,40,0.6);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 8px;
          padding: 15px;
        }

        .source-item.connected {
          border-color: rgba(0,255,136,0.3);
        }

        .source-status {
          margin-left: auto;
          font-size: 0.75em;
          color: #00ff88;
          font-weight: 600;
        }

        /* BOTTOM HUD */
        .hud-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          background: linear-gradient(0deg, rgba(0,20,40,0.9) 0%, transparent 100%);
          border-top: 1px solid rgba(0,212,255,0.2);
          position: relative;
          z-index: 10;
        }

        .version {
          font-family: 'Orbitron', monospace;
          font-size: 0.75em;
          color: rgba(0,212,255,0.5);
          letter-spacing: 2px;
        }

        .voice-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,212,255,0.1);
          border: 1px solid rgba(0,212,255,0.3);
          color: #00d4ff;
          padding: 12px 25px;
          border-radius: 25px;
          cursor: pointer;
          font-family: 'Orbitron', monospace;
          font-size: 0.85em;
          transition: all 0.3s;
        }

        .voice-btn:hover {
          background: rgba(0,212,255,0.2);
          border-color: #00d4ff;
        }

        .voice-icon {
          font-size: 1.2em;
          transition: all 0.3s;
        }

        .voice-icon.active {
          animation: voicePulse 1s infinite;
        }

        @keyframes voicePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .refresh-info {
          font-size: 0.8em;
          color: rgba(0,212,255,0.5);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hud-top {
            flex-direction: column;
            gap: 15px;
            padding: 15px;
          }

          .hud-left, .hud-right {
            width: 100%;
            justify-content: center;
          }

          .main-content {
            padding: 15px;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .reactor-widget {
            flex-direction: column;
            text-align: center;
          }

          .panel-header {
            flex-direction: column;
            text-align: center;
          }

          .search-box {
            width: 100%;
          }

          .search-input {
            width: 100%;
          }

          .client-card {
            flex-wrap: wrap;
          }

          .hud-bottom {
            flex-direction: column;
            gap: 15px;
          }

          .intel-search {
            flex-direction: column;
          }
        }
      \}</style>
    </>
  )
}
