import { useState, useEffect } from 'react'
import Head from 'next/head'

interface Client {
  id: string
  nom: string
  type: string
  secteur: string
  contact: string
  score: number
  statut: string
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

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [crypto, setCrypto] = useState<CryptoData>({})
  const [forex, setForex] = useState<ForexData>({ usd: 10.05, eur: 10.85 })
  const [weather, setWeather] = useState<{ temp: number; description: string }>({ temp: 0, description: '' })
  const [lastRefresh, setLastRefresh] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'deals'>('overview')

  useEffect(() => {
    // Charger les données
    fetch('/data.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)

    // Charger crypto
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
      .then(res => res.json())
      .then(setCrypto)
      .catch(console.error)

    // Charger forex
    fetch('https://api.exchangerate-api.com/v4/latest/MAD')
      .then(res => res.json())
      .then(data => {
        if (data.rates) {
          setForex({
            usd: 1 / (data.rates.USD || 0.099),
            eur: 1 / (data.rates.EUR || 0.092)
          })
        }
      })
      .catch(console.error)

    // Météo Oujda
    fetch('https://api.open-meteo.com/v1/forecast?latitude=34.68&longitude=-1.91&current_weather=true')
      .then(res => res.json())
      .then(data => {
        if (data.current_weather) {
          const codes: Record<number, string> = {
            0: 'Ensoleillé ☀️', 1: 'Principalement clair 🌤️', 2: 'Partiellement nuageux ⛅',
            3: 'Nuageux ☁️', 45: 'Brouillard 🌫️', 61: 'Pluie légère 🌧️', 80: 'Averses 🌦️'
          }
          setWeather({
            temp: data.current_weather.temperature,
            description: codes[data.current_weather.weathercode] || 'Variable'
          })
        }
      })
      .catch(console.error)

    setLastRefresh(new Date().toLocaleString('fr-FR'))

    // Auto-refresh toutes les 5 minutes
    const interval = setInterval(() => {
      fetch('/data.json').then(res => res.json()).then(setData)
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
        .then(res => res.json()).then(setCrypto)
      setLastRefresh(new Date().toLocaleString('fr-FR'))
    }, 300000)

    return () => clearInterval(interval)
  }, [])

  if (!data) {
    return (
      <div className="loading">
        <span>Chargement...</span>
        <style jsx>{`
          .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
            color: #fff;
            font-size: 1.5em;
          }
        `}</style>
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
        <title>Konan Dashboard</title>
        <meta name="description" content="Dashboard Konan - Assistant IA" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>" />
      </Head>

      <div className="container">
        <header className="header">
          <h1 className="title">🤖 KONAN DASHBOARD</h1>
          <p className="subtitle">Dernière MAJ: {lastRefresh}</p>
          
          {/* Tabs pour mobile */}
          <div className="tabs">
            <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Vue d'ensemble</button>
            <button className={`tab ${activeTab === 'clients' ? 'active' : ''}`} onClick={() => setActiveTab('clients')}>Clients</button>
            <button className={`tab ${activeTab === 'deals' ? 'active' : ''}`} onClick={() => setActiveTab('deals')}>Deals</button>
          </div>
        </header>

        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div className="grid">
            {/* Météo Oujda */}
            <div className="card weather-card">
              <h3 className="card-title">🌤️ Météo Oujda</h3>
              <p className="card-value">{weather.temp}°C</p>
              <p className="card-subtitle">{weather.description}</p>
            </div>

            {/* Skills */}
            <div className="card">
              <h3 className="card-title">🛠️ Skills Actifs</h3>
              <p className="card-value">{data.stats.skills}</p>
              <p className="card-subtitle">Skills disponibles</p>
            </div>

            {/* Clients */}
            <div className="card">
              <h3 className="card-title">👥 Clients CRM</h3>
              <p className="card-value">{clients.length}</p>
              <p className="card-subtitle">Dans la base</p>
            </div>

            {/* Pipeline */}
            <div className="card pipeline-card">
              <h3 className="card-title">💼 Pipeline Total</h3>
              <p className="card-value">{pipelineValue.toLocaleString()} MAD</p>
              <p className="card-subtitle">{deals.length} deals en cours</p>
              {/* Mini bar chart */}
              <div className="mini-chart">
                {deals.map((deal, i) => (
                  <div key={i} className="chart-bar" style={{ height: `${(deal.montant / pipelineValue) * 100}%` }} title={`${deal.titre}: ${deal.montant.toLocaleString()} MAD`}></div>
                ))}
              </div>
            </div>

            {/* Crypto */}
            <div className="card crypto-card">
              <h3 className="card-title">📈 Crypto</h3>
              <div className="crypto-row">
                <span className="crypto-icon">₿</span>
                <span className="crypto-name">Bitcoin</span>
                <span className="crypto-price">${btcPrice.toLocaleString()}</span>
                <span className={`crypto-change ${btcChange > 0 ? 'positive' : 'negative'}`}>
                  {btcChange > 0 ? '↑' : '↓'} {Math.abs(btcChange).toFixed(1)}%
                </span>
              </div>
              <div className="crypto-row">
                <span className="crypto-icon">Ξ</span>
                <span className="crypto-name">Ethereum</span>
                <span className="crypto-price">${ethPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Forex */}
            <div className="card forex-card">
              <h3 className="card-title">💱 Forex MAD</h3>
              <div className="forex-row">
                <span>🇺🇸 USD</span>
                <span className="forex-rate">{forex.usd.toFixed(2)} MAD</span>
              </div>
              <div className="forex-row">
                <span>🇪🇺 EUR</span>
                <span className="forex-rate">{forex.eur.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        )}

        {/* Clients */}
        {activeTab === 'clients' && (
          <div className="list-container">
            <h2 className="section-title">👥 Clients CRM</h2>
            {clients.map(client => (
              <div key={client.id} className="list-item">
                <div className="list-item-main">
                  <strong>{client.nom}</strong>
                  <p className="list-subtext">{client.type} - {client.secteur}</p>
                </div>
                <div className="score-badge">
                  <span className="score-value">{client.score}</span>
                  <span className="score-label">Score</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Deals */}
        {activeTab === 'deals' && (
          <div className="list-container">
            <h2 className="section-title">💰 Pipeline - {pipelineValue.toLocaleString()} MAD</h2>
            {deals.map((deal, i) => (
              <div key={i} className="deal-item">
                <div className="deal-main">
                  <strong>{deal.titre}</strong>
                  <p className="list-subtext">{deal.client}</p>
                </div>
                <div className="deal-info">
                  <p className="deal-amount">{deal.montant.toLocaleString()} MAD</p>
                  <span className={`deal-stage stage-${deal.stage.toLowerCase().replace(' ', '-')}`}>{deal.stage}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="footer">
          <p>Konan Dashboard v2.0</p>
          <p className="footer-sub">
            🤖 Powered by Moltbot | 🔄 Auto-refresh 5min
          </p>
        </footer>
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
          color: #fff;
          padding: 15px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .header {
          text-align: center;
          padding: 20px 0;
          margin-bottom: 20px;
        }
        
        .title {
          font-size: clamp(1.5em, 5vw, 2.5em);
          background: linear-gradient(90deg, #00d4ff, #7b2cbf, #ff6b6b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .subtitle {
          color: #666;
          margin-top: 8px;
          font-size: 0.85em;
        }
        
        .tabs {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        
        .tab {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #888;
          padding: 10px 20px;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.9em;
        }
        
        .tab:hover, .tab.active {
          background: linear-gradient(90deg, #00d4ff, #7b2cbf);
          color: #fff;
          border-color: transparent;
        }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .card {
          background: rgba(255,255,255,0.03);
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0,212,255,0.1);
        }
        
        .card-title {
          font-size: 0.8em;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        
        .card-value {
          font-size: clamp(1.5em, 4vw, 2.5em);
          font-weight: bold;
          margin: 8px 0;
          background: linear-gradient(90deg, #fff, #00d4ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .card-subtitle {
          color: #555;
          font-size: 0.85em;
        }
        
        .weather-card {
          background: linear-gradient(135deg, rgba(255,165,0,0.1), rgba(255,100,0,0.05));
        }
        
        .pipeline-card {
          background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(123,44,191,0.05));
        }
        
        .crypto-card, .forex-card {
          background: linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,100,255,0.05));
        }
        
        .mini-chart {
          display: flex;
          align-items: flex-end;
          gap: 5px;
          height: 40px;
          margin-top: 15px;
        }
        
        .chart-bar {
          flex: 1;
          background: linear-gradient(to top, #00d4ff, #7b2cbf);
          border-radius: 3px 3px 0 0;
          min-height: 10px;
          transition: height 0.5s;
        }
        
        .crypto-row, .forex-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .crypto-icon {
          font-size: 1.2em;
          width: 25px;
        }
        
        .crypto-name {
          flex: 1;
          margin-left: 10px;
          color: #888;
        }
        
        .crypto-price {
          font-weight: bold;
          margin-right: 10px;
        }
        
        .crypto-change {
          font-size: 0.85em;
          padding: 3px 8px;
          border-radius: 10px;
        }
        
        .crypto-change.positive {
          background: rgba(0,255,136,0.2);
          color: #00ff88;
        }
        
        .crypto-change.negative {
          background: rgba(255,71,87,0.2);
          color: #ff4757;
        }
        
        .forex-rate {
          font-weight: bold;
          color: #00d4ff;
        }
        
        .list-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .section-title {
          font-size: 1.3em;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid rgba(0,212,255,0.3);
        }
        
        .list-item, .deal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.03);
          border-radius: 15px;
          padding: 15px 20px;
          margin-bottom: 10px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .list-subtext {
          color: #666;
          font-size: 0.85em;
          margin: 5px 0 0;
        }
        
        .score-badge {
          text-align: center;
          background: linear-gradient(135deg, #00d4ff, #7b2cbf);
          border-radius: 12px;
          padding: 8px 15px;
        }
        
        .score-value {
          display: block;
          font-size: 1.3em;
          font-weight: bold;
        }
        
        .score-label {
          font-size: 0.7em;
          opacity: 0.8;
        }
        
        .deal-amount {
          font-size: 1.2em;
          font-weight: bold;
          color: #00d4ff;
          margin: 0;
        }
        
        .deal-stage {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75em;
          margin-top: 5px;
        }
        
        .stage-proposition {
          background: rgba(255,165,0,0.2);
          color: #ffa500;
        }
        
        .stage-qualification {
          background: rgba(0,212,255,0.2);
          color: #00d4ff;
        }
        
        .footer {
          text-align: center;
          padding: 30px;
          color: #444;
          margin-top: 30px;
        }
        
        .footer-sub {
          font-size: 0.8em;
          margin-top: 5px;
        }
      `}</style>
    </>
  )
}

