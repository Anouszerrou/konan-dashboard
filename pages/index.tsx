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

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [crypto, setCrypto] = useState<CryptoData>({})
  const [lastRefresh, setLastRefresh] = useState<string>('')

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
    return <div style={styles.loading}>Chargement...</div>
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
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>KONAN DASHBOARD</h1>
          <p style={styles.subtitle}>Dernière MAJ: {lastRefresh}</p>
        </header>

        <div style={styles.grid}>
          {/* Skills */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🛠️ Skills Actifs</h3>
            <p style={styles.cardValue}>{data.stats.skills}</p>
            <p style={styles.cardSubtitle}>Skills disponibles</p>
          </div>

          {/* Clients */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>👥 Clients CRM</h3>
            <p style={styles.cardValue}>{clients.length}</p>
            <p style={styles.cardSubtitle}>Dans la base</p>
          </div>

          {/* Pipeline */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💼 Pipeline</h3>
            <p style={styles.cardValue}>{pipelineValue.toLocaleString()} MAD</p>
            <p style={styles.cardSubtitle}>{deals.length} deals en cours</p>
          </div>

          {/* Crypto */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📈 Crypto</h3>
            <div style={styles.cryptoRow}>
              <span>BTC</span>
              <span style={styles.cryptoPrice}>${btcPrice.toLocaleString()}</span>
              <span style={{color: btcChange > 0 ? '#00ff88' : '#ff4757'}}>
                {btcChange > 0 ? '+' : ''}{btcChange.toFixed(1)}%
              </span>
            </div>
            <div style={styles.cryptoRow}>
              <span>ETH</span>
              <span style={styles.cryptoPrice}>${ethPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Liste Clients */}
          <div style={{...styles.card, gridColumn: 'span 2'}}>
            <h3 style={styles.cardTitle}>👥 Clients</h3>
            {clients.map(client => (
              <div key={client.id} style={styles.listItem}>
                <div>
                  <strong>{client.nom}</strong>
                  <p style={styles.listSubtext}>{client.type} - {client.secteur}</p>
                </div>
                <span style={styles.score}>Score: {client.score}</span>
              </div>
            ))}
          </div>

          {/* Deals */}
          <div style={{...styles.card, gridColumn: 'span 2'}}>
            <h3 style={styles.cardTitle}>💰 Deals en Cours</h3>
            {deals.map((deal, i) => (
              <div key={i} style={styles.dealItem}>
                <div>
                  <strong>{deal.titre}</strong>
                  <p style={styles.listSubtext}>{deal.client}</p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <p style={styles.dealAmount}>{deal.montant.toLocaleString()} MAD</p>
                  <span style={styles.dealStage}>{deal.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer style={styles.footer}>
          <p>Konan Dashboard v1.0 - Powered by Moltbot</p>
          <p style={{fontSize: '0.8em', marginTop: '5px'}}>
            💡 Konan met à jour ce dashboard automatiquement
          </p>
        </footer>
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#fff',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#1a1a2e',
    color: '#fff',
    fontSize: '1.5em'
  },
  header: {
    textAlign: 'center',
    padding: '30px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '30px'
  },
  title: {
    fontSize: '2.5em',
    background: 'linear-gradient(90deg, #00d4ff, #7b2cbf)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0
  },
  subtitle: {
    color: '#888',
    marginTop: '10px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '15px',
    padding: '25px',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  cardTitle: {
    fontSize: '0.9em',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '15px'
  },
  cardValue: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    margin: '10px 0'
  },
  cardSubtitle: {
    color: '#666',
    fontSize: '0.9em'
  },
  cryptoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  cryptoPrice: {
    fontWeight: 'bold'
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  listSubtext: {
    color: '#888',
    fontSize: '0.85em',
    margin: '5px 0 0'
  },
  score: {
    color: '#00d4ff',
    fontSize: '0.9em'
  },
  dealItem: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '10px'
  },
  dealAmount: {
    color: '#00d4ff',
    fontSize: '1.2em',
    fontWeight: 'bold',
    margin: 0
  },
  dealStage: {
    display: 'inline-block',
    background: 'rgba(123,44,191,0.3)',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '0.8em'
  },
  footer: {
    textAlign: 'center',
    padding: '30px',
    color: '#666',
    marginTop: '30px'
  }
}
