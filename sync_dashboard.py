#!/usr/bin/env python3
"""
Sync Dashboard - Met a jour le dashboard Vercel avec les donnees locales
"""

import json
import os
import subprocess
from datetime import datetime

# Chemins
CRM_DIR = os.path.expanduser("~/.clawdbot/crm")
DASHBOARD_DIR = os.path.expanduser("~/clawd/dashboard-vercel")
DATA_FILE = os.path.join(DASHBOARD_DIR, "public", "data.json")
SKILLS_DIR = os.path.expanduser("~/clawd/skills")
SKILLS_DIR_ALT = r"D:\clawdbot\moltbot\skills"


def load_json(filepath, default=None):
    if default is None:
        default = {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return default


def get_skills_list():
    """Recuperer tous les skills"""
    skills_list = []
    seen = set()
    for path in [SKILLS_DIR, SKILLS_DIR_ALT]:
        try:
            if os.path.exists(path):
                for d in os.listdir(path):
                    if os.path.isdir(os.path.join(path, d)) and not d.startswith('.') and d not in seen:
                        skills_list.append({"name": d})
                        seen.add(d)
        except:
            pass
    return skills_list


def sync_data():
    """Synchronise les donnees vers le dashboard"""
    
    # Charger donnees existantes du dashboard
    existing = load_json(DATA_FILE, {})
    existing_clients = existing.get("clients", [])
    existing_deals = existing.get("deals", [])
    
    # Charger donnees CRM si disponibles
    clients_data = load_json(os.path.join(CRM_DIR, "clients.json"), {"clients": {}})
    pipeline_data = load_json(os.path.join(CRM_DIR, "pipeline.json"), {"deals": {}})
    
    # Convertir CRM en listes si disponible
    crm_clients = []
    for cid, client in clients_data.get("clients", {}).items():
        crm_clients.append({
            "id": cid,
            "name": client.get("nom", client.get("name", "")),
            "type": client.get("statut", client.get("type", "actif")),
            "sector": client.get("secteur", client.get("sector", "")),
            "contact": client.get("contact", {}).get("email", client.get("email", "")),
            "score": client.get("score", 75)
        })
    
    crm_deals = []
    for did, deal in pipeline_data.get("deals", {}).items():
        crm_deals.append({
            "id": did,
            "title": deal.get("titre", deal.get("title", "")),
            "client": deal.get("client_id", ""),
            "value": deal.get("montant", deal.get("value", 0)),
            "stage": deal.get("stage", "negotiation")
        })
    
    # Utiliser CRM si disponible, sinon garder existant
    clients = crm_clients if crm_clients else existing_clients
    deals = crm_deals if crm_deals else existing_deals
    
    # Recuperer skills
    skills_list = get_skills_list()
    
    # S'assurer que clients et deals sont des listes
    if not isinstance(clients, list):
        clients = []
    if not isinstance(deals, list):
        deals = []
    
    # Construire data.json
    data = {
        "clients": clients,
        "deals": deals,
        "skills": skills_list,
        "stats": {
            "skillsCount": len(skills_list),
            "clientsCount": len(clients),
            "dealsCount": len(deals),
            "pipelineTotal": sum(d.get("value", 0) for d in deals if isinstance(d, dict)),
            "lastUpdate": datetime.now().isoformat()
        }
    }
    
    # Sauvegarder
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"[OK] data.json mis a jour")
    print(f"    - {len(clients)} clients")
    print(f"    - {len(deals)} deals")
    print(f"    - {len(skills_list)} skills")
    
    return data


def git_push():
    """Push vers GitHub"""
    try:
        os.chdir(DASHBOARD_DIR)
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", f"Update dashboard data - {datetime.now().strftime('%Y-%m-%d %H:%M')}"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("[OK] Push vers GitHub reussi")
        print("[INFO] Vercel va automatiquement redeployer")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERREUR] Git: {e}")
        return False
    except Exception as e:
        print(f"[ERREUR] {e}")
        return False


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Sync Dashboard Vercel")
    parser.add_argument("--push", action="store_true", help="Push vers GitHub apres sync")
    args = parser.parse_args()
    
    print("=== SYNC DASHBOARD ===")
    sync_data()
    
    if args.push:
        print("\n=== GIT PUSH ===")
        git_push()


if __name__ == "__main__":
    main()
