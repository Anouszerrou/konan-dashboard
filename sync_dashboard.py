#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
╔══════════════════════════════════════════════════════════════════╗
║       KONAN DASHBOARD SYNC v3.0 - UNIFIED DATA COLLECTOR         ║
╠══════════════════════════════════════════════════════════════════╣
║  Collecte: MT5, Wave Catcher, Alertes, KPIs, RDV, Clients, Deals ║
║  + Crypto, Forex, MASI, Predictions IA                            ║
╚══════════════════════════════════════════════════════════════════╝
"""

import sys
import io
import os
import json
import subprocess
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ═══════════════════════════════════════════════════════════════════
#                         CONFIGURATION
# ═══════════════════════════════════════════════════════════════════

DASHBOARD_DIR = Path(r"C:\Users\solan\clawd\dashboard-vercel")
DATA_FILE = DASHBOARD_DIR / "public" / "data.json"
SKILLS_DIR = Path(r"D:\clawdbot\moltbot\skills")
CCPRO_DATA = Path.home() / ".openclaw" / "ccpro"
CRM_DATA = Path.home() / ".openclaw" / "crm"
MT5_DATA = Path.home() / ".openclaw" / "mt5"

# ═══════════════════════════════════════════════════════════════════
#                         HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════

def load_json(filepath: Path, default=None):
    """Charge un fichier JSON de manière sécurisée."""
    if default is None:
        default = {}
    try:
        if filepath.exists():
            return json.loads(filepath.read_text(encoding="utf-8"))
    except:
        pass
    return default


def save_json(filepath: Path, data: dict):
    """Sauvegarde un fichier JSON."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    filepath.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# ═══════════════════════════════════════════════════════════════════
#                         DATA COLLECTORS
# ═══════════════════════════════════════════════════════════════════

def get_mt5_status() -> Dict[str, Any]:
    """Récupère le status MT5 et trading."""
    default = {
        "status": "offline", "balance": 0, "equity": 0, "profit_today": 0,
        "trades_today": 0, "winrate": 0, "open_positions": 0, "drawdown": 0,
        "profit_week": 0, "profit_month": 0, "last_update": datetime.now().isoformat()
    }
    try:
        import MetaTrader5 as mt5
        if mt5.initialize():
            account = mt5.account_info()
            positions = mt5.positions_get()
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            week_start = today - timedelta(days=today.weekday())
            month_start = today.replace(day=1)
            
            history_today = mt5.history_deals_get(today, datetime.now())
            history_week = mt5.history_deals_get(week_start, datetime.now())
            history_month = mt5.history_deals_get(month_start, datetime.now())
            
            trades_today = len(history_today) if history_today else 0
            profit_today = sum(d.profit for d in history_today) if history_today else 0
            profit_week = sum(d.profit for d in history_week) if history_week else 0
            profit_month = sum(d.profit for d in history_month) if history_month else 0
            wins = sum(1 for d in history_today if d.profit > 0) if history_today else 0
            winrate = (wins / trades_today * 100) if trades_today > 0 else 0
            
            mt5.shutdown()
            return {
                "status": "online",
                "balance": account.balance if account else 0,
                "equity": account.equity if account else 0,
                "profit_today": round(profit_today, 2),
                "profit_week": round(profit_week, 2),
                "profit_month": round(profit_month, 2),
                "trades_today": trades_today,
                "winrate": round(winrate, 1),
                "open_positions": len(positions) if positions else 0,
                "drawdown": round(((account.balance - account.equity) / account.balance * 100), 2) if account and account.balance > 0 else 0,
                "last_update": datetime.now().isoformat()
            }
    except:
        pass
    return default


def get_bot_status() -> Dict[str, Any]:
    """Vérifie si le bot MT5 est actif."""
    try:
        result = subprocess.run(
            ["powershell", "-Command", "Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like '*mt5*' -or $_.CommandLine -like '*bot*'}"],
            capture_output=True, text=True, timeout=5
        )
        is_running = bool(result.stdout.strip())
        last_signal = "N/A"
        bot_log = MT5_DATA / "bot.log"
        if bot_log.exists():
            lines = bot_log.read_text(encoding="utf-8", errors="ignore").split("\n")[-50:]
            for line in reversed(lines):
                if any(x in line for x in ["SIGNAL", "BUY", "SELL"]):
                    last_signal = line[-50:] if len(line) > 50 else line
                    break
        return {"status": "running" if is_running else "stopped", "last_signal": last_signal, "last_check": datetime.now().isoformat()}
    except:
        return {"status": "error", "last_signal": "N/A", "last_check": datetime.now().isoformat()}


def get_wave_catcher_status() -> Dict[str, Any]:
    """Vérifie Wave Catcher status."""
    try:
        result = subprocess.run(
            ["powershell", "-Command", "Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like '*wave*'}"],
            capture_output=True, text=True, timeout=5
        )
        is_running = bool(result.stdout.strip())
        return {"status": "running" if is_running else "stopped", "last_signal": "N/A"}
    except:
        return {"status": "error", "last_signal": "N/A"}


def get_kpis() -> Dict[str, Any]:
    """Récupère les KPIs CCPRO."""
    kpis_file = CCPRO_DATA / "objectifs.json"
    data = load_json(kpis_file, {})
    mois = datetime.now().strftime("%Y-%m")
    default_kpis = {
        "conquete_clients": {"cible": 5, "realise": 0, "unite": "clients"},
        "pnb_mensuel": {"cible": 50000, "realise": 0, "unite": "MAD"},
        "credits_places": {"cible": 3, "realise": 0, "unite": "dossiers"},
        "montant_credits": {"cible": 2000000, "realise": 0, "unite": "MAD"},
        "rdv_clients": {"cible": 20, "realise": 0, "unite": "RDV"},
        "equipement": {"cible": 10, "realise": 0, "unite": "produits"}
    }
    return data.get(mois, default_kpis)


def get_alerts() -> List[Dict]:
    """Récupère les alertes actives."""
    alertes_file = CCPRO_DATA / "alertes.json"
    data = load_json(alertes_file, {"alertes": []})
    return [a for a in data.get("alertes", []) if not a.get("traitee", False)]


def generate_smart_alerts(clients: List, deals: List, mt5: Dict) -> List[Dict]:
    """Génère des alertes intelligentes basées sur les données."""
    alerts = []
    now = datetime.now()
    
    # Alertes clients sans contact > 7 jours
    for client in clients:
        if not isinstance(client, dict):
            continue
        if client.get("dernier_contact"):
            try:
                last_contact = datetime.strptime(client["dernier_contact"], "%Y-%m-%d")
                days = (now - last_contact).days
                if days > 14:
                    alerts.append({
                        "id": f"auto_client_{client.get('id', 'x')}",
                        "type": "relance",
                        "priorite": "haute" if days > 21 else "moyenne",
                        "client": client.get("name", "Client"),
                        "message": f"Pas de contact depuis {days} jours",
                        "date_creation": now.strftime("%Y-%m-%d"),
                        "auto": True
                    })
            except:
                pass
    
    # Alertes deals bloqués
    for deal in deals:
        if not isinstance(deal, dict):
            continue
        if deal.get("stage") in ["proposal", "negotiation"]:
            alerts.append({
                "id": f"auto_deal_{deal.get('id', 'x')}",
                "type": "opportunite",
                "priorite": "moyenne",
                "client": deal.get("client", "Deal"),
                "message": f"Deal '{deal.get('title', 'N/A')[:30]}' en attente",
                "date_creation": now.strftime("%Y-%m-%d"),
                "auto": True
            })
    
    # Alerte trading si perte > 100$
    if mt5.get("profit_today", 0) < -100:
        alerts.append({
            "id": "auto_mt5_loss",
            "type": "incident",
            "priorite": "haute",
            "client": "MT5 Trading",
            "message": f"Perte importante: {mt5['profit_today']:.2f}$",
            "date_creation": now.strftime("%Y-%m-%d"),
            "auto": True
        })
    
    return alerts[:10]  # Max 10 alertes auto


def get_planning() -> Dict:
    """Récupère les RDV et relances."""
    rdv_file = CCPRO_DATA / "rdv.json"
    data = load_json(rdv_file, {"rdv": []})
    today = datetime.now().strftime("%Y-%m-%d")
    rdv_today = [r for r in data.get("rdv", []) if r.get("date") == today]
    
    # Relances simulées (à connecter avec CRM réel)
    relances = [
        {"client": "ATLAS CONSULTING", "dernier_contact": "2026-01-15", "action": "Suivi crédit équipement", "jours": (datetime.now() - datetime.strptime("2026-01-15", "%Y-%m-%d")).days},
        {"client": "NEXUS TECH", "dernier_contact": "2026-01-20", "action": "Renouvellement FC", "jours": (datetime.now() - datetime.strptime("2026-01-20", "%Y-%m-%d")).days},
        {"client": "MAROC TEXTILE", "dernier_contact": "2026-01-25", "action": "Proposition assurance", "jours": (datetime.now() - datetime.strptime("2026-01-25", "%Y-%m-%d")).days}
    ]
    
    return {"rdv_today": rdv_today, "relances": relances}


def get_clients() -> List[Dict]:
    """Récupère les clients CRM."""
    clients_file = CRM_DATA / "clients.json"
    data = load_json(clients_file, {"clients": []})
    if data.get("clients"):
        return data["clients"]
    # Clients de démo
    return [
        {"id": "cli_001", "name": "MAROC TEXTILE SARL", "type": "actif", "sector": "Textile", "score": 85},
        {"id": "cli_002", "name": "ATLAS IMPORT EXPORT", "type": "actif", "sector": "Commerce", "score": 92},
        {"id": "cli_003", "name": "OUJDA AGRO SA", "type": "actif", "sector": "Agroalimentaire", "score": 78},
        {"id": "cli_004", "name": "BERKANE CONSTRUCTION", "type": "actif", "sector": "BTP", "score": 88},
        {"id": "cli_005", "name": "ORIENTAL PHARMA", "type": "actif", "sector": "Pharmacie", "score": 95},
        {"id": "cli_006", "name": "NADOR LOGISTICS", "type": "prospect", "sector": "Transport", "score": 65},
        {"id": "cli_007", "name": "OUJDA MOTORS", "type": "actif", "sector": "Automobile", "score": 82},
        {"id": "cli_008", "name": "ORIENTAL TECH", "type": "prospect", "sector": "IT", "score": 70},
    ]


def get_deals() -> List[Dict]:
    """Récupère les deals pipeline."""
    deals_file = CRM_DATA / "deals.json"
    data = load_json(deals_file, {"deals": []})
    if data.get("deals"):
        return data["deals"]
    return [
        {"id": "deal_001", "title": "Crédit Équipement Textile", "client": "cli_001", "value": 2500000, "stage": "negotiation"},
        {"id": "deal_002", "title": "Ligne de Trésorerie", "client": "cli_002", "value": 5000000, "stage": "proposal"},
        {"id": "deal_003", "title": "Extension Usine", "client": "cli_003", "value": 8000000, "stage": "qualification"},
        {"id": "deal_004", "title": "Leasing Engins BTP", "client": "cli_004", "value": 3500000, "stage": "closing"},
        {"id": "deal_005", "title": "Crédit Stock Pharmacie", "client": "cli_005", "value": 1500000, "stage": "won"},
    ]


def get_skills() -> List[Dict]:
    """Liste les skills actifs."""
    skills = []
    if SKILLS_DIR.exists():
        for d in SKILLS_DIR.iterdir():
            if d.is_dir() and not d.name.startswith(("_", ".")):
                skills.append({"name": d.name})
    return sorted(skills, key=lambda x: x["name"])


def get_predictions(mt5: Dict, clients: List, deals: List) -> List[Dict]:
    """Génère des prédictions IA basées sur les patterns."""
    predictions = []
    
    # Prédiction trading
    if mt5.get("winrate", 0) < 40:
        predictions.append({"type": "warning", "icon": "⚠️", "message": "Win rate faible - considérer pause trading"})
    if mt5.get("profit_week", 0) > 500:
        predictions.append({"type": "success", "icon": "🎯", "message": "Bonne semaine! Sécurisez les gains"})
    
    # Prédiction clients
    prospects = [c for c in clients if isinstance(c, dict) and c.get("type") == "prospect"]
    if len(prospects) >= 3:
        predictions.append({"type": "opportunity", "icon": "💡", "message": f"{len(prospects)} prospects à convertir ce mois"})
    
    # Prédiction pipeline
    closing_deals = [d for d in deals if isinstance(d, dict) and d.get("stage") == "closing"]
    if closing_deals:
        total = sum(d.get("value", 0) for d in closing_deals)
        predictions.append({"type": "info", "icon": "📊", "message": f"{len(closing_deals)} deals près de clôturer ({total/1e6:.1f}M MAD)"})
    
    return predictions[:5]


def get_konan_signals() -> Dict[str, Any]:
    """Récupère les données KONAN Signals."""
    KONAN_SIGNALS_DIR = Path(r"C:\Users\solan\clawd\skills\konan-signals")
    
    default = {
        "stats": {
            "total_signals": 0, "wins": 0, "losses": 0, "pending": 0,
            "win_rate": 0, "total_pnl": 0, "avg_win": 0, "avg_loss": 0,
            "best_trade": 0, "worst_trade": 0
        },
        "recent_signals": [],
        "subscribers": {"total": 0, "active": 0, "revenue": 0},
        "monthly": {}
    }
    
    # Performance
    perf_file = KONAN_SIGNALS_DIR / "performance.json"
    if perf_file.exists():
        try:
            perf = json.loads(perf_file.read_text(encoding="utf-8"))
            default["stats"] = perf.get("stats", default["stats"])
            default["monthly"] = perf.get("monthly", {})
            # 10 derniers signaux
            signals = perf.get("signals", [])
            default["recent_signals"] = sorted(
                signals, key=lambda x: x.get("published_at", ""), reverse=True
            )[:10]
        except:
            pass
    
    # Subscribers
    subs_file = KONAN_SIGNALS_DIR / "subscribers.json"
    if subs_file.exists():
        try:
            subs = json.loads(subs_file.read_text(encoding="utf-8"))
            sub_list = subs.get("subscribers", [])
            active = [
                s for s in sub_list 
                if s.get("status") == "active" and 
                datetime.fromisoformat(s.get("expires_at", "2000-01-01")) > datetime.now()
            ]
            default["subscribers"] = {
                "total": len(sub_list),
                "active": len(active),
                "revenue": subs.get("stats", {}).get("total_revenue", 0)
            }
        except:
            pass
    
    return default


def get_login_codes() -> List[Dict]:
    """Récupère les codes de connexion valides pour le dashboard."""
    KONAN_SIGNALS_DIR = Path(r"C:\Users\solan\clawd\skills\konan-signals")
    subs_file = KONAN_SIGNALS_DIR / "subscribers.json"
    
    codes = []
    
    if subs_file.exists():
        try:
            subs = json.loads(subs_file.read_text(encoding="utf-8"))
            for sub in subs.get("subscribers", []):
                # Skip expired subscriptions
                expires = datetime.fromisoformat(sub.get("expires_at", "2000-01-01"))
                if expires < datetime.now() or sub.get("status") != "active":
                    continue
                
                # Add access_code (permanent)
                if sub.get("access_code"):
                    codes.append({
                        "telegram_id": sub.get("telegram_id"),
                        "code": sub.get("access_code"),
                        "expires": sub.get("expires_at"),
                        "name": sub.get("name") or sub.get("username") or "Trader",
                        "plan": sub.get("plan", "monthly").upper()
                    })
                
                # Add login_code (temporary, 24h)
                if sub.get("login_code"):
                    login_expires = sub.get("login_code_expires", "2000-01-01")
                    if datetime.fromisoformat(login_expires) > datetime.now():
                        codes.append({
                            "telegram_id": sub.get("telegram_id"),
                            "code": sub.get("login_code"),
                            "expires": login_expires,
                            "name": sub.get("name") or sub.get("username") or "Trader",
                            "plan": sub.get("plan", "monthly").upper()
                        })
        except:
            pass
    
    return codes


# ═══════════════════════════════════════════════════════════════════
#                         MAIN SYNC
# ═══════════════════════════════════════════════════════════════════

def sync_dashboard(push: bool = False, verbose: bool = True):
    """Synchronise toutes les données du dashboard."""
    if verbose:
        print("╔══════════════════════════════════════════════════════════════╗")
        print("║       KONAN DASHBOARD SYNC v3.0                              ║")
        print("╚══════════════════════════════════════════════════════════════╝\n")
    
    # Collecter toutes les données
    if verbose: print("📊 Collecte MT5...")
    mt5_data = get_mt5_status()
    
    if verbose: print("🤖 Collecte Bot status...")
    bot_data = get_bot_status()
    
    if verbose: print("🌊 Collecte Wave Catcher...")
    wave_data = get_wave_catcher_status()
    
    if verbose: print("📈 Collecte KPIs...")
    kpis = get_kpis()
    
    if verbose: print("👥 Collecte Clients...")
    clients = get_clients()
    
    if verbose: print("💼 Collecte Deals...")
    deals = get_deals()
    
    if verbose: print("🚨 Collecte Alertes...")
    alerts = get_alerts()
    smart_alerts = generate_smart_alerts(clients, deals, mt5_data)
    all_alerts = alerts + [a for a in smart_alerts if a["id"] not in [x["id"] for x in alerts]]
    
    if verbose: print("📅 Collecte Planning...")
    planning = get_planning()
    
    if verbose: print("⚡ Collecte Skills...")
    skills = get_skills()
    
    if verbose: print("🧠 Génération Prédictions...")
    predictions = get_predictions(mt5_data, clients, deals)
    
    if verbose: print("📡 Collecte KONAN Signals...")
    konan_signals = get_konan_signals()
    
    if verbose: print("🔐 Collecte Login Codes...")
    login_codes = get_login_codes()
    
    # Calculer stats
    active_clients = len([c for c in clients if isinstance(c, dict) and c.get("type") == "actif"])
    prospects = len([c for c in clients if isinstance(c, dict) and c.get("type") == "prospect"])
    pipeline_total = sum(d.get("value", 0) for d in deals if isinstance(d, dict) and d.get("stage") != "won")
    
    # Construire data.json
    data = {
        "trading": {
            "mt5": mt5_data,
            "bot": bot_data,
            "wave_catcher": wave_data
        },
        "konan_signals": konan_signals,
        "login_codes": login_codes,
        "alerts": all_alerts,
        "kpis": kpis,
        "planning": planning,
        "predictions": predictions,
        "clients": clients,
        "deals": deals,
        "skills": skills,
        "stats": {
            "skillsCount": len(skills),
            "clientsCount": len(clients),
            "activeClients": active_clients,
            "prospects": prospects,
            "dealsCount": len(deals),
            "pipelineTotal": pipeline_total,
            "alertsCount": len(all_alerts),
            "rdvToday": len(planning.get("rdv_today", [])),
            "lastUpdate": datetime.now().isoformat()
        }
    }
    
    # Sauvegarder
    save_json(DATA_FILE, data)
    if verbose:
        print(f"\n✅ data.json mis à jour: {DATA_FILE}")
        print(f"   • MT5: {mt5_data['status']} | Balance: ${mt5_data['balance']:,.0f}")
        print(f"   • P&L Jour: ${mt5_data['profit_today']:+.2f}")
        print(f"   • Skills: {len(skills)} | Clients: {len(clients)} | Deals: {len(deals)}")
        print(f"   • Alertes: {len(all_alerts)} | RDV: {len(planning.get('rdv_today', []))}")
    
    # Push vers GitHub si demandé
    if push:
        if verbose: print("\n🚀 Push vers GitHub...")
        try:
            os.chdir(DASHBOARD_DIR)
            subprocess.run(["git", "add", "public/data.json"], check=True, capture_output=True)
            subprocess.run(["git", "commit", "-m", f"sync: {datetime.now().strftime('%Y-%m-%d %H:%M')}"], capture_output=True)
            result = subprocess.run(["git", "push"], capture_output=True, text=True)
            if result.returncode == 0:
                if verbose: print("✅ Push réussi! Vercel redéploie automatiquement (~30s)")
            else:
                if verbose: print(f"⚠️ Push warning: {result.stderr}")
        except Exception as e:
            if verbose: print(f"❌ Erreur push: {e}")
    
    return data


# ═══════════════════════════════════════════════════════════════════
#                         CLI
# ═══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Konan Dashboard Sync v3.0")
    parser.add_argument("--push", "-p", action="store_true", help="Push vers GitHub après sync")
    parser.add_argument("--quiet", "-q", action="store_true", help="Mode silencieux")
    args = parser.parse_args()
    
    sync_dashboard(push=args.push, verbose=not args.quiet)


