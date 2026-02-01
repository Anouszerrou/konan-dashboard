#!/usr/bin/env python3
"""
Sync Dashboard - Met a jour le dashboard Vercel avec les donnees locales
Konan execute ce script pour push les MAJ
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


def count_skills():
    """Compter les skills"""
    try:
        return len([d for d in os.listdir(SKILLS_DIR) if os.path.isdir(os.path.join(SKILLS_DIR, d))])
    except:
        return 0


def load_json(filepath, default=None):
    if default is None:
        default = {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return default


def sync_data():
    """Synchronise les donnees CRM vers le dashboard"""
    
    # Charger donnees locales
    clients_data = load_json(os.path.join(CRM_DIR, "clients.json"), {"clients": {}})
    pipeline_data = load_json(os.path.join(CRM_DIR, "pipeline.json"), {"deals": {}})
    
    # Simplifier pour le dashboard
    clients = {}
    for cid, client in clients_data.get("clients", {}).items():
        clients[cid] = {
            "id": cid,
            "nom": client.get("nom", ""),
            "type": client.get("type", ""),
            "secteur": client.get("secteur", ""),
            "contact": client.get("contact", {}).get("tel", ""),
            "score": client.get("score", 0),
            "statut": client.get("statut", "actif")
        }
    
    pipeline = {}
    for did, deal in pipeline_data.get("deals", {}).items():
        pipeline[did] = {
            "titre": deal.get("titre", ""),
            "client": deal.get("client_id", ""),
            "montant": deal.get("montant", 0),
            "stage": deal.get("stage", "")
        }
    
    # Construire data.json
    data = {
        "clients": clients,
        "pipeline": pipeline,
        "stats": {
            "skills": count_skills(),
            "lastUpdate": datetime.now().isoformat()
        }
    }
    
    # Sauvegarder
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"[OK] data.json mis a jour")
    print(f"    - {len(clients)} clients")
    print(f"    - {len(pipeline)} deals")
    print(f"    - {data['stats']['skills']} skills")
    
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
