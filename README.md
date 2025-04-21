Je vais vous aider à créer l'arborescence d'un projet qui permet de récupérer des offres d'emploi à partir d'une URL et les stocker dans une base de données, en utilisant React, Vite, Django, Ollama sur un VPS et Supabase.

Voici l'arborescence du projet complète :

```
job-scraper-project/
│
├── frontend/                  # Application React avec Vite
│   ├── node_modules/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── JobForm.jsx    # Formulaire pour soumettre l'URL
│   │   │   ├── JobDetails.jsx # Affichage des détails de l'offre
│   │   │   └── JobList.jsx    # Liste des offres enregistrées
│   │   ├── services/
│   │   │   └── api.js         # Services pour communiquer avec l'API Django
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env                   # Variables d'environnement (API URLs, etc.)
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                   # Application Django
│   ├── manage.py
│   ├── requirements.txt
│   ├── backend/               # Projet Django principal
│   │   ├── __init__.py
│   │   ├── settings.py        # Configuration Django + Supabase
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── job_api/              # Application Django pour l'API
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py         # Modèle pour les offres d'emploi
│   │   ├── serializers.py    # Sérialisation des données
│   │   ├── views.py          # Points d'entrée de l'API
│   │   ├── urls.py
│   │   └── migrations/
│   ├── job_scraper/          # Application Django pour le scraping
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── services/
│   │   │   ├── scraper.py    # Logique de scraping
│   │   │   └── ollama_processor.py  # Traitement avec Ollama
│   │   └── tests/
│   └── supabase/             # Intégration avec Supabase
│       ├── __init__.py
│       └── client.py         # Client Supabase
│
├── ollama/                   # Configuration Ollama
│   ├── models/               # Modèles Ollama
│   │   └── config.json       # Configuration des modèles
│   ├── prompts/              # Prompts pour l'extraction d'informations
│   │   └── job_extraction.txt
│   └── docker-compose.yml    # Configuration Docker pour Ollama
│
├── deployment/               # Configuration du déploiement
│   ├── nginx/                # Configuration NGINX
│   │   └── nginx.conf
│   ├── docker-compose.yml    # Configuration Docker pour l'ensemble du projet
│   └── .env.example          # Variables d'environnement pour le déploiement
│
└── README.md                 # Documentation du projet
```

## Flux de processus

1. **Frontend (React + Vite)**:
   - L'utilisateur entre une URL d'offre d'emploi dans le formulaire (JobForm.jsx)
   - La requête est envoyée à l'API Django via api.js
   - Les résultats sont affichés dans JobDetails.jsx
   - Liste des offres sauvegardées dans JobList.jsx

2. **Backend (Django)**:
   - L'API (job_api/views.py) reçoit l'URL
   - Transmet l'URL au service de scraping (job_scraper/services/scraper.py)
   - Le scraper extrait les données brutes de l'offre d'emploi
   - Les données sont envoyées à Ollama pour analyse (job_scraper/services/ollama_processor.py)
   - Ollama extrait les informations pertinentes (titre, compétences, salaire, etc.)
   - Les données structurées sont enregistrées dans Supabase via supabase/client.py
   - L'API renvoie les données structurées au frontend

3. **Ollama sur VPS**:
   - Service local sur le VPS qui exécute le modèle d'IA
   - Reçoit le texte de l'offre d'emploi
   - Utilise les prompts définis pour extraire les informations structurées
   - Renvoie les données structurées au service Django

4. **Supabase**:
   - Stocke les données structurées des offres d'emploi
   - Fournit une API pour les récupérer ultérieurement

Cette architecture vous permet de séparer clairement les responsabilités entre le frontend, le backend, le traitement par IA et le stockage des données, tout en utilisant les technologies que vous avez mentionnées.