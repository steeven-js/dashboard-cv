# Serveur d'analyse d'offres d'emploi

Ce serveur Express permet d'analyser des offres d'emploi à partir d'URLs en utilisant Ollama pour l'extraction d'informations.

## Prérequis

- Node.js v20 ou supérieur
- Ollama installé et fonctionnel sur votre machine locale (http://localhost:11434)
- Le modèle llama3 installé sur Ollama (`ollama pull llama3`)

## Installation

```bash
# Installer les dépendances
npm install
```

## Démarrage du serveur

```bash
# Démarrer en mode développement avec rechargement automatique
npm run dev

# Démarrer en mode production
npm start
```

Le serveur sera accessible à l'adresse http://localhost:3001.

## Configuration

Le fichier `.env` permet de configurer:
- `PORT`: Le port du serveur (par défaut: 3001)
- `OLLAMA_API_URL`: L'URL de l'API Ollama (par défaut: http://localhost:11434)
- `OLLAMA_MODEL`: Le modèle Ollama à utiliser (par défaut: llama3)

## API

### Analyser une offre d'emploi

```
POST /api/analyze-job
```

Corps de la requête:
```json
{
  "url": "https://example.com/job-posting"
}
```

Réponse:
```json
{
  "title": "Titre du poste",
  "company": "Nom de l'entreprise",
  "location": "Lieu",
  "contractType": "Type de contrat",
  "skills": ["Compétence 1", "Compétence 2"],
  "salary": "Salaire",
  "experience": "Expérience requise",
  "education": "Formation requise",
  "summary": "Résumé du poste",
  "responsibilities": ["Responsabilité 1", "Responsabilité 2"],
  "benefits": ["Avantage 1", "Avantage 2"]
}
```
