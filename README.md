# Konan Dashboard

Dashboard web pour visualiser l'état de Konan en temps réel.

## Déploiement sur Vercel

1. Push ce dossier sur GitHub
2. Connecter le repo à Vercel
3. Vercel déploie automatiquement à chaque push

## Mise à jour des données

Konan exécute ce script pour mettre à jour le dashboard:

```powershell
python C:\Users\solan\clawd\dashboard-vercel\sync_dashboard.py --push
```

Cela:
1. Lit les données CRM locales
2. Met à jour `public/data.json`
3. Push vers GitHub
4. Vercel redéploie automatiquement

## Structure

```
dashboard-vercel/
├── pages/
│   ├── index.tsx      # Page principale
│   └── _document.tsx  # Config HTML
├── public/
│   └── data.json      # Données (mis à jour par Konan)
├── sync_dashboard.py  # Script de sync
├── package.json
└── next.config.js
```

## Fonctionnalités

- 📊 Stats skills (57)
- 👥 Clients CRM
- 💼 Pipeline deals
- 📈 Prix crypto live
- 🔄 Auto-refresh 5 min
