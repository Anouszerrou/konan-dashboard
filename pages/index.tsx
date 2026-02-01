import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

// ═══════════════════════════════════════════════════════════════
// 🚀 KONAN DASHBOARD 2400 - FUTURISTIC HOLOGRAPHIC INTERFACE
// ═══════════════════════════════════════════════════════════════

interface Contact {
  nom: string
  tel: string
  email: string
}

interface Client {
  id: string
  nom: string
  type: string
  secteur: string
  contact: Contact | string
  adresse?: string
  produits?: string[]
  chiffre_affaires?: number
  score: number
  statut: string
  date_creation?: string
  derniere_interaction?: string
  notes?: string
}

interface Deal {
  id?: string
  titre: string
  client?: string
  client_id?: string
  montant: number
  stage: string
  probabilite?: number
  date_cloture_prevue?: string
  responsable?: string
  notes?: string
}

interface Task {
  id: string
  titre: string
  type: 'call' | 'meeting' | 'followup' | 'deadline' | 'reminder'
  client?: string
  priority: 'high' | 'medium' | 'low'
  time?: string
  done: boolean
}

interface DashboardData {
  clients: Record<string, Client>
  pipeline: Record<string, Deal>
  deals?: Record<string, Deal>
  tasks?: Task[]
  stats: {
    skills: number
    plugins?: number
    crons?: number
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

// Génère des tâches automatiques basées sur les données CRM
function generateDailyTasks(clients: Client[], deals: Deal[]): Task[] {
  const tasks: Task[] = []
  const today = new Date()
  
  // Tâches de suivi clients
  clients.forEach((client, idx) => {
    if (client.derniere_interaction) {
      const lastInteraction = new Date(client.derniere_interaction)
      const daysSince = Math.floor((today.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSince > 7) {
        tasks.push({
          id: `task_client_${idx}`,
          titre: `📞 Rappeler ${client.nom}`,
          type: 'call',
          client: client.nom,
          priority: daysSince > 14 ? 'high' : 'medium',
          time: '10:00',
          done: false
        })
      }
    }
  })

  // Tâches de suivi deals
  deals.forEach((deal, idx) => {
    if (deal.date_cloture_prevue) {
      const closeDate = new Date(deal.date_cloture_prevue)
      const daysUntil = Math.floor((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil <= 7 && daysUntil >= 0) {
        tasks.push({
          id: `task_deal_${idx}`,
          titre: `🎯 Finaliser: ${deal.titre}`,
          type: 'deadline',
          priority: daysUntil <= 3 ? 'high' : 'medium',
          time: `J-${daysUntil}`,
          done: false
        })
      }
    }
  })

  // Tâches quotidiennes standard
  tasks.push({
    id: 'task_daily_1',
    titre: '☀️ Check emails & messages',
    type: 'reminder',
    priority: 'low',
    time: '09:00',
    done: false
  })

  tasks.push({
    id: 'task_daily_2',
    titre: '📊 Revue pipeline hebdo',
    type: 'meeting',
    priority: 'medium',
    time: '14:00',
    done: today.getDay() !== 1 // Auto-done si pas lundi
  })

  return tasks.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [crypto, setCrypto] = useState<CryptoData>({})
  const [forex, setForex] = useState<ForexData>({ usd: 10.05, eur: 10.85 })
  const [weather, setWeather] = useState<{ temp: number; description: string; icon: string }>({ temp: 0, description: '', icon: '🌡️' })
  const [lastRefresh, setLastRefresh] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'clients' | 'deals' | 'ai'>('overview')
  const [tasks, setTasks] = useState<Task[]>([])
  const [aiStatus, setAiStatus] = useState<'online' | 'offline' | 'thinking'>('online')
  const [particles, setParticles] = useState<{x: number; y: number; size: number; speed: number}[]>([])

  // Générer des particules pour l'effet holographique
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 0.5
    }))
    setParticles(newParticles)
  }, [])

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/data.json')
      const newData = await res.json()
      setData(newData)
      
      // Générer les tâches à partir des données
      const clients = Object.values(newData.clients || {}) as Client[]
      const deals = Object.values(newData.pipeline || newData.deals || {}) as Deal[]
      setTasks(generateDailyTasks(clients, deals))
    } catch (e) {
      console.error('Erreur chargement données:', e)
    }
  }, [])

  useEffect(() => {
    loadData()

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
          const codes: Record<number, { desc: string; icon: string }> = {
            0: { desc: 'Ensoleillé', icon: '☀️' },
            1: { desc: 'Clair', icon: '🌤️' },
            2: { desc: 'Nuageux', icon: '⛅' },
            3: { desc: 'Couvert', icon: '☁️' },
            45: { desc: 'Brouillard', icon: '🌫️' },
            61: { desc: 'Pluie', icon: '🌧️' },
            80: { desc: 'Averses', icon: '🌦️' }
          }
          const info = codes[data.current_weather.weathercode] || { desc: 'Variable', icon: '🌡️' }
          setWeather({
            temp: data.current_weather.temperature,
            description: info.desc,
            icon: info.icon
          })
        }
      })
      .catch(console.error)

    setLastRefresh(new Date().toLocaleString('fr-FR'))

    // Simulation statut IA
    const aiInterval = setInterval(() => {
      setAiStatus(prev => prev === 'online' ? 'online' : 'online')
    }, 5000)

    // Auto-refresh toutes les 5 minutes
    const interval = setInterval(() => {
      loadData()
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
        .then(res => res.json()).then(setCrypto)
      setLastRefresh(new Date().toLocaleString('fr-FR'))
    }, 300000)

    return () => {
      clearInterval(interval)
      clearInterval(aiInterval)
    }
  }, [loadData])

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, done: !t.done } : t
    ))
  }

  if (!data) {
    return (
      <div className="loading">
        <div className="loader-ring"></div>
        <span>INITIALISATION SYSTÈME KONAN...</span>
        <style jsx>{`
          .loading {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background: linear-gradient(135deg, #0a0a15 0%, #0f0f2a 50%, #0a1628 100%);
            color: #00ffff;
            font-size: 1.2em;
            gap: 20px;
            font-family: 'Orbitron', monospace;
          }
          .loader-ring {
            width: 60px;
            height: 60px;
            border: 3px solid rgba(0,255,255,0.1);
            border-top: 3px solid #00ffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  const clients = Object.values(data.clients)
  const deals = Object.values(data.pipeline || data.deals || {})
  const pipelineValue = deals.reduce((sum, d) => sum + d.montant, 0)
  const btcPrice = crypto.bitcoin?.usd || 0
  const btcChange = crypto.bitcoin?.usd_24h_change || 0
  const ethPrice = crypto.ethereum?.usd || 0
  const completedTasks = tasks.filter(t => t.done).length
  const totalTasks = tasks.length

  return (
    <>
      <Head>
        <title>KONAN 2400 | Holographic Dashboard</title>
        <meta name="description" content="Konan AI Dashboard - Système Futuriste 2400" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="universe">
        {/* Particules flottantes */}
        <div className="particles">
          {particles.map((p, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: `${p.speed * 10}s`
              }}
            />
          ))}
        </div>

        <div className="container">
          {/* Header Holographique */}
          <header className="header">
            <div className="status-bar">
              <div className="status-item">
                <span className={`status-dot ${aiStatus}`}></span>
                <span>KONAN AI</span>
              </div>
              <div className="status-item">
                <span className="status-icon">🛡️</span>
                <span>SECURE</span>
              </div>
              <div className="status-item">
                <span className="status-icon">⚡</span>
                <span>v2026.1</span>
              </div>
            </div>

            <h1 className="title">
              <span className="title-glow">K O N A N</span>
              <span className="title-sub">DASHBOARD 2400</span>
            </h1>

            <div className="meta-info">
              <span className="meta-item">{weather.icon} {weather.temp}°C Oujda</span>
              <span className="meta-divider">|</span>
              <span className="meta-item">🔄 {lastRefresh}</span>
            </div>

            {/* Navigation Tabs */}
            <nav className="nav-tabs">
              {[
                { id: 'overview', icon: '🌐', label: 'Overview' },
                { id: 'tasks', icon: '📋', label: 'Tâches', badge: totalTasks - completedTasks },
                { id: 'clients', icon: '👥', label: 'CRM' },
                { id: 'deals', icon: '💎', label: 'Pipeline' },
                { id: 'ai', icon: '🤖', label: 'AI Status' }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="tab-badge">{tab.badge}</span>
                  )}
                </button>
              ))}
            </nav>
          </header>

          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && (
            <div className="grid-container">
              <div className="main-grid">
                {/* Card Stats Konan */}
                <div className="holo-card stat-card konan-card">
                  <div className="card-header">
                    <span className="card-icon">🤖</span>
                    <h3>KONAN STATUS</h3>
                  </div>
                  <div className="stat-grid">
                    <div className="stat-item">
                      <span className="stat-value glow-text">{data.stats.skills}</span>
                      <span className="stat-label">Skills</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{data.stats.plugins || 4}</span>
                      <span className="stat-label">Plugins</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{data.stats.crons || 8}</span>
                      <span className="stat-label">Crons</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '100%' }}></div>
                  </div>
                  <span className="card-status online">● OPERATIONNEL</span>
                </div>

                {/* Tâches du jour - Mini */}
                <div className="holo-card task-preview-card">
                  <div className="card-header">
                    <span className="card-icon">📋</span>
                    <h3>TÂCHES DU JOUR</h3>
                  </div>
                  <div className="task-progress">
                    <div className="task-ring">
                      <svg viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(0,255,255,0.1)" strokeWidth="3"/>
                        <circle 
                          cx="18" cy="18" r="15.9" 
                          fill="none" 
                          stroke="url(#gradient)" 
                          strokeWidth="3"
                          strokeDasharray={`${(completedTasks / totalTasks) * 100}, 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00ffff"/>
                            <stop offset="100%" stopColor="#ff00ff"/>
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="ring-text">{completedTasks}/{totalTasks}</span>
                    </div>
                    <div className="task-list-mini">
                      {tasks.slice(0, 3).map(task => (
                        <div key={task.id} className={`task-mini ${task.done ? 'done' : ''} priority-${task.priority}`}>
                          <span className="task-check">{task.done ? '✓' : '○'}</span>
                          <span className="task-title-mini">{task.titre}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CRM Stats */}
                <div className="holo-card crm-card">
                  <div className="card-header">
                    <span className="card-icon">👥</span>
                    <h3>CRM OVERVIEW</h3>
                  </div>
                  <div className="crm-stats">
                    <div className="crm-stat">
                      <span className="crm-value">{clients.length}</span>
                      <span className="crm-label">Clients</span>
                    </div>
                    <div className="crm-stat">
                      <span className="crm-value">{deals.length}</span>
                      <span className="crm-label">Deals</span>
                    </div>
                    <div className="crm-stat highlight">
                      <span className="crm-value">{(pipelineValue / 1000).toFixed(0)}K</span>
                      <span className="crm-label">Pipeline MAD</span>
                    </div>
                  </div>
                  <div className="pipeline-bars">
                    {deals.map((deal, i) => (
                      <div key={i} className="pipeline-bar-item">
                        <span className="bar-label">{deal.titre.substring(0, 15)}...</span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${(deal.montant / pipelineValue) * 100}%` }}
                          />
                        </div>
                        <span className="bar-value">{(deal.montant/1000).toFixed(0)}K</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Crypto Tracker */}
                <div className="holo-card crypto-card">
                  <div className="card-header">
                    <span className="card-icon">📈</span>
                    <h3>CRYPTO LIVE</h3>
                  </div>
                  <div className="crypto-grid">
                    <div className="crypto-item btc">
                      <span className="crypto-symbol">₿</span>
                      <div className="crypto-info">
                        <span className="crypto-name">Bitcoin</span>
                        <span className="crypto-price">${btcPrice.toLocaleString()}</span>
                      </div>
                      <span className={`crypto-change ${btcChange >= 0 ? 'up' : 'down'}`}>
                        {btcChange >= 0 ? '▲' : '▼'} {Math.abs(btcChange).toFixed(1)}%
                      </span>
                    </div>
                    <div className="crypto-item eth">
                      <span className="crypto-symbol">Ξ</span>
                      <div className="crypto-info">
                        <span className="crypto-name">Ethereum</span>
                        <span className="crypto-price">${ethPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Forex */}
                <div className="holo-card forex-card">
                  <div className="card-header">
                    <span className="card-icon">💱</span>
                    <h3>FOREX MAD</h3>
                  </div>
                  <div className="forex-grid">
                    <div className="forex-item">
                      <span className="forex-flag">🇺🇸</span>
                      <span className="forex-pair">USD/MAD</span>
                      <span className="forex-rate">{forex.usd.toFixed(2)}</span>
                    </div>
                    <div className="forex-item">
                      <span className="forex-flag">🇪🇺</span>
                      <span className="forex-pair">EUR/MAD</span>
                      <span className="forex-rate">{forex.eur.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Météo */}
                <div className="holo-card weather-card">
                  <div className="card-header">
                    <span className="card-icon">{weather.icon}</span>
                    <h3>MÉTÉO OUJDA</h3>
                  </div>
                  <div className="weather-display">
                    <span className="weather-temp">{weather.temp}°</span>
                    <span className="weather-desc">{weather.description}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ TASKS TAB ═══ */}
          {activeTab === 'tasks' && (
            <div className="section-container">
              <div className="section-header">
                <h2>📋 TÂCHES DU JOUR</h2>
                <div className="task-summary">
                  <span className="summary-done">{completedTasks} terminées</span>
                  <span className="summary-pending">{totalTasks - completedTasks} en attente</span>
                </div>
              </div>
              <div className="tasks-list">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`task-item ${task.done ? 'completed' : ''} priority-${task.priority}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className="task-checkbox">
                      <span className={`checkbox ${task.done ? 'checked' : ''}`}>
                        {task.done ? '✓' : ''}
                      </span>
                    </div>
                    <div className="task-content">
                      <span className="task-title">{task.titre}</span>
                      {task.client && <span className="task-client">👤 {task.client}</span>}
                    </div>
                    <div className="task-meta">
                      {task.time && <span className="task-time">⏰ {task.time}</span>}
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="tasks-footer">
                <p className="auto-gen-note">✨ Tâches générées automatiquement par Konan AI</p>
              </div>
            </div>
          )}

          {/* ═══ CLIENTS TAB ═══ */}
          {activeTab === 'clients' && (
            <div className="section-container">
              <div className="section-header">
                <h2>👥 CRM - {clients.length} CLIENTS</h2>
              </div>
              <div className="clients-grid">
                {clients.map(client => {
                  const contactName = typeof client.contact === 'object' ? client.contact.nom : client.contact
                  return (
                    <div key={client.id} className="client-card holo-card">
                      <div className="client-header">
                        <div className="client-avatar">
                          {client.nom.charAt(0)}
                        </div>
                        <div className="client-info">
                          <h4 className="client-name">{client.nom}</h4>
                          <span className="client-type">{client.type} • {client.secteur}</span>
                        </div>
                        <div className="client-score">
                          <svg viewBox="0 0 36 36" className="score-ring">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(0,255,255,0.1)" strokeWidth="2"/>
                            <circle 
                              cx="18" cy="18" r="15.9" 
                              fill="none" 
                              stroke={client.score >= 90 ? '#00ff88' : client.score >= 70 ? '#ffaa00' : '#ff4444'}
                              strokeWidth="2"
                              strokeDasharray={`${client.score}, 100`}
                              strokeLinecap="round"
                              transform="rotate(-90 18 18)"
                            />
                          </svg>
                          <span className="score-text">{client.score}</span>
                        </div>
                      </div>
                      <div className="client-details">
                        <p className="client-contact">👤 {contactName}</p>
                        {client.adresse && <p className="client-address">📍 {client.adresse}</p>}
                        {client.chiffre_affaires && (
                          <p className="client-ca">💰 CA: {(client.chiffre_affaires/1000000).toFixed(1)}M MAD</p>
                        )}
                        {client.derniere_interaction && (
                          <p className="client-interaction">🕐 Dernier contact: {client.derniere_interaction}</p>
                        )}
                      </div>
                      {client.produits && client.produits.length > 0 && (
                        <div className="client-tags">
                          {client.produits.map((p, i) => (
                            <span key={i} className="product-tag">{p}</span>
                          ))}
                        </div>
                      )}
                      <span className={`client-status ${client.statut}`}>{client.statut.toUpperCase()}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══ DEALS TAB ═══ */}
          {activeTab === 'deals' && (
            <div className="section-container">
              <div className="section-header">
                <h2>💎 PIPELINE - {pipelineValue.toLocaleString()} MAD</h2>
              </div>
              <div className="pipeline-stages">
                {['prospect', 'qualification', 'proposition', 'negociation', 'cloture'].map(stage => {
                  const stageDeals = deals.filter(d => d.stage.toLowerCase() === stage)
                  const stageValue = stageDeals.reduce((s, d) => s + d.montant, 0)
                  return (
                    <div key={stage} className="stage-column">
                      <div className="stage-header">
                        <span className="stage-name">{stage.charAt(0).toUpperCase() + stage.slice(1)}</span>
                        <span className="stage-count">{stageDeals.length}</span>
                      </div>
                      <div className="stage-value">{(stageValue/1000).toFixed(0)}K MAD</div>
                      <div className="stage-deals">
                        {stageDeals.map((deal, i) => (
                          <div key={i} className="deal-card">
                            <h4 className="deal-title">{deal.titre}</h4>
                            <p className="deal-amount">{deal.montant.toLocaleString()} MAD</p>
                            {deal.probabilite && (
                              <div className="deal-prob">
                                <div className="prob-bar" style={{ width: `${deal.probabilite}%` }}/>
                                <span>{deal.probabilite}%</span>
                              </div>
                            )}
                            {deal.date_cloture_prevue && (
                              <p className="deal-date">📅 {deal.date_cloture_prevue}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══ AI STATUS TAB ═══ */}
          {activeTab === 'ai' && (
            <div className="section-container ai-section">
              <div className="ai-hero">
                <div className="ai-avatar-large">
                  <div className="ai-ring pulse"></div>
                  <div className="ai-ring pulse delay"></div>
                  <span className="ai-icon">🤖</span>
                </div>
                <h2 className="ai-title">KONAN AI SYSTEM</h2>
                <p className="ai-version">v2026.1.30 | OpenClaw Framework</p>
              </div>
              
              <div className="ai-stats-grid">
                <div className="ai-stat-card">
                  <span className="ai-stat-icon">🛠️</span>
                  <span className="ai-stat-value">{data.stats.skills}</span>
                  <span className="ai-stat-label">Skills Actifs</span>
                </div>
                <div className="ai-stat-card">
                  <span className="ai-stat-icon">🔌</span>
                  <span className="ai-stat-value">{data.stats.plugins || 4}</span>
                  <span className="ai-stat-label">Plugins</span>
                </div>
                <div className="ai-stat-card">
                  <span className="ai-stat-icon">⏰</span>
                  <span className="ai-stat-value">{data.stats.crons || 8}</span>
                  <span className="ai-stat-label">Cron Jobs</span>
                </div>
                <div className="ai-stat-card">
                  <span className="ai-stat-icon">💬</span>
                  <span className="ai-stat-value">WhatsApp</span>
                  <span className="ai-stat-label">Channel Actif</span>
                </div>
              </div>

              <div className="ai-capabilities">
                <h3>Capacités Actives</h3>
                <div className="capability-list">
                  {[
                    '🌐 Web Search (Brave)',
                    '📁 File Management',
                    '🎨 Image Generation',
                    '💻 Code Execution',
                    '📊 CRM Management',
                    '📅 Cron Scheduling',
                    '🔐 Security Layer',
                    '📱 WhatsApp Integration'
                  ].map((cap, i) => (
                    <span key={i} className="capability-item">{cap}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="footer">
            <div className="footer-content">
              <span className="footer-logo">KONAN 2400</span>
              <span className="footer-divider">|</span>
              <span className="footer-text">Powered by Moltbot & OpenClaw</span>
              <span className="footer-divider">|</span>
              <span className="footer-text">🔄 Auto-sync 5min</span>
            </div>
          </footer>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

        .universe {
          min-height: 100vh;
          background: 
            radial-gradient(ellipse at top, rgba(0,50,100,0.3) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(100,0,100,0.2) 0%, transparent 50%),
            linear-gradient(180deg, #050510 0%, #0a0a20 50%, #050515 100%);
          position: relative;
          overflow-x: hidden;
        }

        .particles {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          background: radial-gradient(circle, rgba(0,255,255,0.8) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 20s infinite ease-in-out;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 1; }
          50% { transform: translateY(-10px) translateX(-10px); opacity: 0.7; }
          75% { transform: translateY(-30px) translateX(5px); opacity: 0.9; }
        }

        .container {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          padding: 15px;
          font-family: 'Rajdhani', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #fff;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          padding: 20px 0 30px;
        }

        .status-bar {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75em;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        .status-dot.online { background: #00ff88; box-shadow: 0 0 10px #00ff88; }
        .status-dot.offline { background: #ff4444; }
        .status-dot.thinking { background: #ffaa00; animation: blink 0.5s infinite; }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .title {
          margin: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .title-glow {
          font-family: 'Orbitron', monospace;
          font-size: clamp(2em, 8vw, 4em);
          font-weight: 900;
          letter-spacing: 0.3em;
          background: linear-gradient(90deg, #00ffff, #ff00ff, #00ffff);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 3s linear infinite;
          text-shadow: 0 0 30px rgba(0,255,255,0.5);
          filter: drop-shadow(0 0 20px rgba(0,255,255,0.3));
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .title-sub {
          font-size: 0.9em;
          letter-spacing: 0.5em;
          color: rgba(255,255,255,0.4);
          font-weight: 400;
        }

        .meta-info {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin: 15px 0;
          font-size: 0.85em;
          color: #666;
        }

        .meta-divider { opacity: 0.3; }

        .nav-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 25px;
          flex-wrap: wrap;
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(0,255,255,0.1);
          border-radius: 25px;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Rajdhani', sans-serif;
          font-size: 0.9em;
          font-weight: 600;
          position: relative;
        }

        .nav-tab:hover {
          border-color: rgba(0,255,255,0.3);
          color: #aaa;
          background: rgba(0,255,255,0.05);
        }

        .nav-tab.active {
          background: linear-gradient(135deg, rgba(0,255,255,0.15), rgba(255,0,255,0.1));
          border-color: rgba(0,255,255,0.5);
          color: #00ffff;
          box-shadow: 0 0 20px rgba(0,255,255,0.2), inset 0 0 20px rgba(0,255,255,0.05);
        }

        .tab-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4444;
          color: #fff;
          font-size: 0.7em;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .tab-icon { font-size: 1.1em; }

        @media (max-width: 600px) {
          .tab-label { display: none; }
          .nav-tab { padding: 12px 14px; }
          .tab-icon { font-size: 1.3em; }
        }

        .grid-container { margin-top: 30px; }

        .main-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        @media (min-width: 1024px) {
          .main-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .holo-card {
          background: 
            linear-gradient(135deg, rgba(0,255,255,0.03) 0%, rgba(255,0,255,0.02) 100%),
            rgba(10,10,30,0.6);
          border: 1px solid rgba(0,255,255,0.15);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(10px);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .holo-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,255,255,0.1), transparent);
          transition: left 0.5s ease;
        }

        .holo-card:hover::before { left: 100%; }

        .holo-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0,255,255,0.4);
          box-shadow: 0 10px 40px rgba(0,255,255,0.15), 0 0 0 1px rgba(0,255,255,0.1);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .card-icon { font-size: 1.3em; }

        .card-header h3 {
          font-family: 'Orbitron', monospace;
          font-size: 0.75em;
          letter-spacing: 2px;
          color: rgba(0,255,255,0.8);
          margin: 0;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          text-align: center;
          margin: 20px 0;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .stat-value {
          font-family: 'Orbitron', monospace;
          font-size: 1.8em;
          font-weight: 700;
          color: #fff;
        }

        .stat-value.glow-text {
          color: #00ffff;
          text-shadow: 0 0 20px rgba(0,255,255,0.5);
        }

        .stat-label {
          font-size: 0.75em;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .progress-bar {
          height: 4px;
          background: rgba(0,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
          margin: 15px 0;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ffff, #ff00ff);
          border-radius: 2px;
          animation: progress-glow 2s infinite;
        }

        @keyframes progress-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(0,255,255,0.5); }
          50% { box-shadow: 0 0 20px rgba(0,255,255,0.8); }
        }

        .card-status { font-size: 0.7em; letter-spacing: 1px; }
        .card-status.online { color: #00ff88; }

        .task-progress {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .task-ring {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          position: relative;
        }

        .task-ring svg { width: 100%; height: 100%; }

        .ring-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Orbitron', monospace;
          font-size: 1em;
          color: #00ffff;
        }

        .task-list-mini { flex: 1; }

        .task-mini {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          font-size: 0.85em;
          color: #888;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .task-mini.done { text-decoration: line-through; opacity: 0.5; }
        .task-mini.priority-high .task-check { color: #ff4444; }
        .task-mini.priority-medium .task-check { color: #ffaa00; }
        .task-mini.priority-low .task-check { color: #00ff88; }

        .crm-stats {
          display: flex;
          justify-content: space-around;
          text-align: center;
          margin: 15px 0;
        }

        .crm-stat { display: flex; flex-direction: column; }

        .crm-value {
          font-family: 'Orbitron', monospace;
          font-size: 1.5em;
          font-weight: 700;
        }

        .crm-stat.highlight .crm-value { color: #00ffff; }

        .crm-label {
          font-size: 0.7em;
          color: #666;
          text-transform: uppercase;
        }

        .pipeline-bars { margin-top: 15px; }

        .pipeline-bar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 0.8em;
        }

        .bar-label {
          width: 100px;
          color: #888;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bar-container {
          flex: 1;
          height: 6px;
          background: rgba(0,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ffff, #ff00ff);
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .bar-value {
          width: 50px;
          text-align: right;
          color: #00ffff;
          font-family: 'Orbitron', monospace;
          font-size: 0.9em;
        }

        .crypto-grid { display: flex; flex-direction: column; gap: 15px; }

        .crypto-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .crypto-symbol {
          font-size: 1.5em;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .crypto-item.btc .crypto-symbol { background: linear-gradient(135deg, #f7931a, #c87c1a); }
        .crypto-item.eth .crypto-symbol { background: linear-gradient(135deg, #627eea, #3c4c8a); }

        .crypto-info { flex: 1; display: flex; flex-direction: column; }
        .crypto-name { font-size: 0.8em; color: #888; }

        .crypto-price {
          font-family: 'Orbitron', monospace;
          font-size: 1.1em;
          font-weight: 700;
        }

        .crypto-change {
          font-size: 0.85em;
          padding: 4px 10px;
          border-radius: 15px;
        }

        .crypto-change.up { background: rgba(0,255,136,0.15); color: #00ff88; }
        .crypto-change.down { background: rgba(255,68,68,0.15); color: #ff4444; }

        .forex-grid { display: flex; flex-direction: column; gap: 12px; }

        .forex-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
        }

        .forex-flag { font-size: 1.5em; }
        .forex-pair { flex: 1; color: #888; }

        .forex-rate {
          font-family: 'Orbitron', monospace;
          font-size: 1.1em;
          color: #00ffff;
        }

        .weather-display { text-align: center; padding: 20px 0; }

        .weather-temp {
          font-family: 'Orbitron', monospace;
          font-size: 3em;
          font-weight: 700;
          background: linear-gradient(180deg, #fff, #00ffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .weather-desc {
          display: block;
          font-size: 1em;
          color: #888;
          margin-top: 5px;
        }

        .section-container {
          margin: 30px 0;
          padding: 25px;
          background: rgba(10,10,30,0.4);
          border: 1px solid rgba(0,255,255,0.1);
          border-radius: 25px;
          backdrop-filter: blur(10px);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(0,255,255,0.1);
          flex-wrap: wrap;
          gap: 15px;
        }

        .section-header h2 {
          font-family: 'Orbitron', monospace;
          font-size: 1.2em;
          letter-spacing: 2px;
          color: #00ffff;
          margin: 0;
        }

        .task-summary { display: flex; gap: 15px; font-size: 0.85em; }
        .summary-done { color: #00ff88; }
        .summary-pending { color: #ffaa00; }

        .tasks-list { display: flex; flex-direction: column; gap: 10px; }

        .task-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          background: rgba(0,0,0,0.2);
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .task-item:hover {
          background: rgba(0,255,255,0.05);
          border-color: rgba(0,255,255,0.2);
        }

        .task-item.completed { opacity: 0.5; }
        .task-item.priority-high { border-left: 3px solid #ff4444; }
        .task-item.priority-medium { border-left: 3px solid #ffaa00; }
        .task-item.priority-low { border-left: 3px solid #00ff88; }

        .task-checkbox { width: 24px; height: 24px; }

        .checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: 2px solid rgba(0,255,255,0.3);
          border-radius: 6px;
          font-size: 0.9em;
          transition: all 0.3s;
        }

        .checkbox.checked {
          background: linear-gradient(135deg, #00ffff, #ff00ff);
          border-color: transparent;
          color: #000;
        }

        .task-content { flex: 1; }
        .task-title { font-size: 1em; font-weight: 600; }

        .task-client {
          font-size: 0.8em;
          color: #666;
          margin-top: 3px;
          display: block;
        }

        .task-meta { display: flex; align-items: center; gap: 10px; }
        .task-time { font-size: 0.8em; color: #888; }

        .tasks-footer { margin-top: 20px; text-align: center; }
        .auto-gen-note { font-size: 0.8em; color: #666; font-style: italic; }

        .clients-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .client-card { padding: 25px; }

        .client-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .client-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00ffff, #ff00ff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', monospace;
          font-size: 1.5em;
          font-weight: 700;
          color: #000;
        }

        .client-info { flex: 1; }
        .client-name { font-size: 1.1em; margin: 0 0 5px; }
        .client-type { font-size: 0.8em; color: #888; }

        .client-score { position: relative; width: 50px; height: 50px; }
        .score-ring { width: 100%; height: 100%; }

        .score-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Orbitron', monospace;
          font-size: 0.9em;
          font-weight: 700;
        }

        .client-details { margin-bottom: 15px; }
        .client-details p { margin: 8px 0; font-size: 0.85em; color: #888; }

        .client-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 15px 0; }

        .product-tag {
          padding: 4px 12px;
          background: rgba(0,255,255,0.1);
          border: 1px solid rgba(0,255,255,0.2);
          border-radius: 15px;
          font-size: 0.75em;
          color: #00ffff;
        }

        .client-status {
          position: absolute;
          top: 15px;
          right: 15px;
          font-size: 0.65em;
          padding: 3px 10px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .client-status.actif { background: rgba(0,255,136,0.15); color: #00ff88; }

        .pipeline-stages {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          padding-bottom: 15px;
        }

        .stage-column {
          flex: 1;
          min-width: 200px;
          background: rgba(0,0,0,0.2);
          border-radius: 15px;
          padding: 15px;
        }

        .stage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .stage-name {
          font-family: 'Orbitron', monospace;
          font-size: 0.8em;
          letter-spacing: 1px;
          color: #00ffff;
        }

        .stage-count {
          background: rgba(0,255,255,0.2);
          padding: 3px 10px;
          border-radius: 10px;
          font-size: 0.8em;
        }

        .stage-value { font-size: 0.85em; color: #888; margin-bottom: 15px; }
        .stage-deals { display: flex; flex-direction: column; gap: 10px; }

        .deal-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 15px;
        }

        .deal-title { font-size: 0.9em; margin: 0 0 8px; }

        .deal-amount {
          font-family: 'Orbitron', monospace;
          color: #00ffff;
          margin: 0 0 10px;
        }

        .deal-prob {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8em;
          color: #888;
        }

        .prob-bar {
          height: 4px;
          background: linear-gradient(90deg, #00ff88, #ffaa00);
          border-radius: 2px;
        }

        .deal-date { font-size: 0.75em; color: #666; margin: 10px 0 0; }

        .ai-section { text-align: center; }
        .ai-hero { margin-bottom: 40px; }

        .ai-avatar-large {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(0,255,255,0.3);
          border-radius: 50%;
          animation: ring-pulse 2s ease-out infinite;
        }

        .ai-ring.delay { animation-delay: 1s; }

        @keyframes ring-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .ai-icon { font-size: 4em; z-index: 1; }

        .ai-title {
          font-family: 'Orbitron', monospace;
          font-size: 2em;
          letter-spacing: 5px;
          background: linear-gradient(90deg, #00ffff, #ff00ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0 0 10px;
        }

        .ai-version { color: #666; font-size: 0.9em; }

        .ai-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .ai-stat-card {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(0,255,255,0.1);
          border-radius: 20px;
          padding: 25px 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .ai-stat-icon { font-size: 2em; }

        .ai-stat-value {
          font-family: 'Orbitron', monospace;
          font-size: 1.5em;
          color: #00ffff;
        }

        .ai-stat-label { font-size: 0.8em; color: #666; }

        .ai-capabilities h3 {
          font-family: 'Orbitron', monospace;
          font-size: 0.9em;
          letter-spacing: 2px;
          color: #888;
          margin-bottom: 20px;
        }

        .capability-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }

        .capability-item {
          padding: 8px 16px;
          background: rgba(0,255,255,0.05);
          border: 1px solid rgba(0,255,255,0.1);
          border-radius: 20px;
          font-size: 0.85em;
          color: #aaa;
        }

        .footer {
          text-align: center;
          padding: 30px 15px;
          margin-top: 40px;
          border-top: 1px solid rgba(0,255,255,0.1);
        }

        .footer-content {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
          font-size: 0.85em;
          color: #555;
        }

        .footer-logo {
          font-family: 'Orbitron', monospace;
          color: #00ffff;
          letter-spacing: 2px;
        }

        .footer-divider { opacity: 0.3; }
      `}</style>
    </>
  )
}

