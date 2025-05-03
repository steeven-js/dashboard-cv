# Cahier des Charges Détaillé - Projet CV Dynamique

## 1. Présentation du Projet

### 1.1 Contexte
Développement d'une application web permettant de générer des CV personnalisés et adaptés à des offres d'emploi spécifiques, en utilisant les technologies React, Vite, MUI 7.0.1 et Supabase.

### 1.2 Objectif à Court Terme
Créer une application permettant d'enregistrer les informations personnelles et professionnelles de l'utilisateur, puis de générer un CV adapté à une offre d'emploi à partir d'un fichier JSON préalablement analysé par Claude AI.

### 1.3 Parties Prenantes
| Partie prenante | Rôle | Responsabilités |
|-----------------|------|-----------------|
| Utilisateur principal | Candidat | Saisir ses informations, importer les JSON d'offres, générer des CV |
| Développeur | Créateur du projet | Conception, développement et maintenance de l'application |
| Claude AI | Service externe | Analyse des offres d'emploi et génération du JSON structuré |

## 2. Spécifications Fonctionnelles Détaillées

### 2.1 Gestion des Données Utilisateur

#### 2.1.1 Informations Personnelles
- Nom complet (prénom, nom)
- Photo de profil (optionnel)
- Titre professionnel
- Description/résumé professionnel (max 500 caractères)
- Coordonnées:
  - Adresse email
  - Numéro de téléphone
  - LinkedIn
  - Site web personnel
  - Adresse physique (optionnel)

#### 2.1.2 Compétences Techniques
Chaque compétence technique sera enregistrée avec les attributs suivants:
- Nom de la compétence
- Catégorie (Front-end, Back-end, Mobile, DevOps, etc.)
- Niveau de maîtrise (1-5)
- Années d'expérience
- Tags associés pour faciliter la correspondance
- Visibilité (toujours visible, masquable selon contexte)

#### 2.1.3 Expériences Professionnelles
Chaque expérience comprendra:
- Titre du poste
- Nom de l'entreprise
- Localisation
- Période (date début - date fin)
- Description détaillée
- Technologies/outils utilisés (avec référence aux compétences)
- Réalisations mesurables (3-5 points clés)
- Tags associés pour faciliter la correspondance
- Visibilité (toujours visible, masquable selon contexte)

#### 2.1.4 Projets Personnels
Structure similaire aux expériences professionnelles avec:
- Nom du projet
- Rôle
- Période
- Technologies utilisées
- Description
- URL du projet (si applicable)
- Tags associés
- Visibilité

#### 2.1.5 Formations et Diplômes
- Intitulé du diplôme/formation
- Établissement
- Localisation
- Période
- Description (optionnel)
- Certifications complémentaires
- Visibilité

### 2.2 Importation et Traitement des Offres d'Emploi

#### 2.2.1 Interface d'Importation JSON
- Zone de texte pour coller le JSON
- Validation du format JSON en temps réel
- Prévisualisation de l'analyse avant confirmation
- Bouton d'enregistrement avec feedback

#### 2.2.2 Structure JSON Attendue
```json
{
  "metadata": {
    "source": "HelloWork/Indeed/LinkedIn",
    "date_analyse": "2025-05-02T10:30:00Z",
    "url_origine": "https://www.exemple.com/offre-123"
  },
  "offre": {
    "titre": "Développeur Full-Stack React & Node.js",
    "entreprise": "Entreprise XYZ",
    "localisation": "Paris, France",
    "type_contrat": "CDI",
    "salaire": "45-55K€",
    "description": "Description complète du poste...",
    "competences_requises": [
      {"nom": "React", "niveau": "Avancé", "importance": 5},
      {"nom": "Node.js", "niveau": "Intermédiaire", "importance": 4},
      {"nom": "TypeScript", "niveau": "Intermédiaire", "importance": 3},
      {"nom": "MongoDB", "niveau": "Débutant", "importance": 2}
    ],
    "experience_requise": "3 ans minimum",
    "formation_requise": "Bac+3/5 en informatique ou équivalent",
    "mots_cles": [
      "frontend", "backend", "fullstack", "api", "javascript"
    ]
  },
  "analyse": {
    "competences_prioritaires": [
      "React", "Node.js", "API REST"
    ],
    "competences_secondaires": [
      "TypeScript", "MongoDB", "Git"
    ],
    "experiences_pertinentes": [
      "Développement d'applications web complètes",
      "Création d'API RESTful",
      "Travail en méthodologie Agile"
    ],
    "formations_pertinentes": [
      "Diplôme en développement web",
      "Certification React"
    ],
    "mots_cles_cv": [
      "application", "full-stack", "web", "développement"
    ]
  }
}
```

#### 2.2.3 Validation et Stockage
- Vérification de la structure du JSON
- Contrôle des champs obligatoires
- Normalisation des données (capitalisation, formatage)
- Attribution d'un identifiant unique à l'offre
- Enregistrement dans Supabase avec horodatage

### 2.3 Génération de CV

#### 2.3.1 Algorithme de Correspondance
L'algorithme évaluera la pertinence des éléments du profil par rapport à l'offre selon les critères suivants:

| Élément | Critères d'évaluation | Pondération |
|---------|------------------------|-------------|
| Compétences | Correspondance exacte avec les compétences requises | 40% |
| Expériences | Tags correspondant aux mots-clés de l'offre | 30% |
| Projets | Technologies utilisées correspondant aux compétences requises | 15% |
| Formation | Niveau et domaine d'études correspondant aux exigences | 10% |
| Centres d'intérêt | Correspondance avec la culture d'entreprise (si mentionnée) | 5% |

#### 2.3.2 Sélection et Ordonnancement des Éléments du CV
1. Sélection des compétences pertinentes (score > seuil configurable)
2. Ordonnancement des expériences et projets par pertinence puis par date
3. Filtrage des formations selon pertinence
4. Adaptation du résumé professionnel pour intégrer des mots-clés pertinents

#### 2.3.3 Modèles de CV
- Minimum 3 modèles de mise en page distincts
- Options de personnalisation (couleurs, polices, espacements)
- Prévisualisation en temps réel
- Structure modulaire permettant l'ajout de nouveaux modèles

### 2.4 Interface Utilisateur Détaillée

#### 2.4.1 Structure de l'Application
```
App
├── Authentification
│   ├── Inscription
│   └── Connexion
├── Dashboard
│   ├── Résumé du profil
│   ├── Statistiques (nombre d'offres, de CV générés)
│   └── Actions rapides
├── Gestion du Profil
│   ├── Informations personnelles
│   ├── Compétences techniques
│   ├── Expériences professionnelles
│   ├── Projets
│   ├── Formations
│   └── Centres d'intérêt
├── Gestion des Offres
│   ├── Liste des offres importées
│   ├── Détail d'une offre
│   ├── Importation nouvelle offre
│   └── Analyse de correspondance
└── Génération de CV
    ├── Sélection d'une offre
    ├── Personnalisation du CV
    ├── Prévisualisation
    └── Export PDF
```

#### 2.4.2 Maquettes Fonctionnelles

**Dashboard**
```
+-------------------------------------------------------+
|  [Logo] CV Dynamique                [Profil] [Décon.] |
+-------------------------------------------------------+
|                                                       |
| [Menu] | Bienvenue, [Prénom]                          |
|        |                                              |
| [Dash] | +---------------+  +--------------------+    |
|        | | Profil        |  | Offres d'emploi    |    |
| [Prof] | | Complété à 75%|  | 3 offres importées |    |
|        | | [Compléter]   |  | [Gérer]            |    |
| [Offr] | +---------------+  +--------------------+    |
|        |                                              |
| [CV]   | +---------------+  +--------------------+    |
|        | | CV générés    |  | Actions rapides    |    |
|        | | 2 CV créés    |  | [Importer offre]   |    |
|        | | [Voir tous]   |  | [Générer CV]       |    |
|        | +---------------+  +--------------------+    |
|        |                                              |
+-------------------------------------------------------+
```

**Importation d'offre (JSON)**
```
+-------------------------------------------------------+
|  [Logo] CV Dynamique                [Profil] [Décon.] |
+-------------------------------------------------------+
|                                                       |
| [Menu] | Importation d'une offre d'emploi             |
|        |                                              |
| [Dash] | Instructions:                                |
|        | 1. Copiez le JSON généré par Claude          |
| [Prof] | 2. Collez-le ci-dessous                      |
|        | 3. Vérifiez la prévisualisation              |
| [Offr] | 4. Enregistrez l'offre                       |
|        |                                              |
| [CV]   | +----------------------------------------+   |
|        | | Collez le JSON ici                     |   |
|        | | ...                                    |   |
|        | | ...                                    |   |
|        | +----------------------------------------+   |
|        |                                              |
|        | [Valider] [Prévisualiser] [Enregistrer]      |
|        |                                              |
+-------------------------------------------------------+
```

**Génération de CV**
```
+-------------------------------------------------------+
|  [Logo] CV Dynamique                [Profil] [Décon.] |
+-------------------------------------------------------+
|                                                       |
| [Menu] | Génération de CV                             |
|        |                                              |
| [Dash] | Offre sélectionnée: Développeur Full-Stack   |
|        |                                              |
| [Prof] | +----------------+  +--------------------+   |
|        | | Modèles        |  | Prévisualisation   |   |
| [Offr] | | [M1] [M2] [M3] |  |                    |   |
|        | | Couleurs       |  |                    |   |
| [CV]   | | [C1] [C2] [C3] |  |                    |   |
|        | | Options        |  |                    |   |
|        | | [x] Photo      |  |                    |   |
|        | | [ ] Adresse    |  |                    |   |
|        | +----------------+  +--------------------+   |
|        |                                              |
|        | [Modifier contenu] [Aperçu PDF] [Télécharger]|
|        |                                              |
+-------------------------------------------------------+
```

## 3. Spécifications Techniques Détaillées

### 3.1 Architecture Technique

#### 3.1.1 Diagramme d'Architecture
```
+-------------------+        +-------------------+
| FRONTEND          |        | BACKEND           |
| React + Vite      |<------>| Supabase          |
| MUI 7.0.1         |        | PostgreSQL + Auth |
+-------------------+        +-------------------+
        ^                             ^
        |                             |
        v                             v
+-------------------+        +-------------------+
| Local Storage     |        | External Services |
| Browser Cache     |        | PDF Export        |
+-------------------+        +-------------------+
```

#### 3.1.2 Stack Technologique Détaillée

**Frontend:**
- React 18.x avec Vite comme bundler
- Material UI 7.0.1 pour l'interface utilisateur
- React Router 6.x pour la navigation
- Formik + Yup pour la gestion des formulaires et validations
- React-PDF pour la génération et prévisualisation des PDF
- JSON Schema Validator pour la validation des JSON importés
- React Query pour la gestion des états serveur

**Backend/BDD:**
- Supabase comme backend-as-a-service
- PostgreSQL pour le stockage des données
- Authentication Supabase pour la gestion des utilisateurs
- Row Level Security pour la protection des données
- Stockage Supabase pour les fichiers (photos, PDF)

### 3.2 Structure de la Base de Données Détaillée

#### 3.2.1 Schéma Relationnel

```
+----------------+       +-------------------+       +---------------+
| users          |       | technical_skills  |       | job_offers    |
+----------------+       +-------------------+       +---------------+
| id             |<---+  | id                |       | id            |
| auth_id        |    |  | user_id           |<------+ user_id       |
| created_at     |    |  | name              |       | title         |
| updated_at     |    |  | category          |       | company       |
| first_name     |    |  | level             |       | location      |
| last_name      |    |  | years_experience  |       | job_type      |
| title          |    |  | tags              |       | description   |
| summary        |    |  | visibility        |       | offer_json    |
| email          |    |  | created_at        |       | created_at    |
| phone          |    |  | updated_at        |       | updated_at    |
| website        |    |  +-------------------+       | importance    |
| linkedin       |    |                              +---------------+
| address        |    |  +-------------------+              |
| photo_url      |    |  | experiences       |              |
+----------------+    |  +-------------------+              |
        |             |  | id                |              |
        |             +--+ user_id           |              |
        |             |  | title             |              |
        |             |  | company           |              v
        |             |  | location          |       +---------------+
        |             |  | start_date        |       | generated_cvs |
        v             |  | end_date          |       +---------------+
+----------------+    |  | description       |       | id            |
| education      |    |  | technologies      |       | user_id       |
+----------------+    |  | achievements      |       | job_offer_id  |
| id             |    |  | tags              |       | template_id   |
| user_id        |<---+  | visibility        |       | content       |
| degree         |    |  | created_at        |       | settings      |
| institution    |    |  | updated_at        |       | created_at    |
| location       |    |  +-------------------+       | updated_at    |
| start_date     |    |                              +---------------+
| end_date       |    |  +-------------------+
| description    |    |  | projects          |
| created_at     |    |  +-------------------+
| updated_at     |    |  | id                |
+----------------+    |  | user_id           |<---+
                      |  | name              |    |
                      |  | role              |    |
                      |  | start_date        |    |
                      |  | end_date          |    |
                      |  | description       |    |
                      |  | technologies      |    |
                      |  | url               |    |
                      |  | tags              |    |
                      |  | visibility        |    |
                      |  | created_at        |    |
                      |  | updated_at        |    |
                      |  +-------------------+    |
                      |                           |
                      +---------------------------+
```

#### 3.2.2 Détail des Tables

**Table users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  summary TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  linkedin TEXT,
  address TEXT,
  photo_url TEXT,
  UNIQUE(auth_id)
);
```

**Table technical_skills**
```sql
CREATE TABLE technical_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  years_experience NUMERIC(3,1),
  tags TEXT[] DEFAULT '{}',
  visibility BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table experiences**
```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  technologies TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  visibility BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

_... tables similaires pour projects, education, etc._

**Table job_offers**
```sql
CREATE TABLE job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT,
  description TEXT,
  offer_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  importance INTEGER DEFAULT 0
);
```

**Table generated_cvs**
```sql
CREATE TABLE generated_cvs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_offer_id UUID NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  content JSONB NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Algorithme de Matching Détaillé

#### 3.3.1 Processus d'évaluation
1. **Extraction des mots-clés**:
   - Extraction des compétences requises de l'offre
   - Normalisation (mise en minuscules, suppression des pluriels)
   - Attribution de poids selon l'importance dans l'offre

2. **Calcul du score de compétence**:
   ```javascript
   function calculateSkillScore(userSkill, requiredSkills) {
     // Algorithme détaillé de matching qui prend en compte:
     // - Correspondance exacte ou partielle
     // - Niveau requis vs niveau maîtrisé
     // - Années d'expérience
     // - Synonymes et technologies apparentées
   }
   ```

3. **Pondération des expériences**:
   ```javascript
   function rankExperiences(experiences, offerKeywords) {
     // Algorithme détaillé qui calcule:
     // - Correspondance des technologies utilisées
     // - Correspondance des tags avec les mots-clés
     // - Récence de l'expérience
     // - Durée de l'expérience
   }
   ```

4. **Calcul du score global et sélection**:
   ```javascript
   function generateOptimalCV(profile, jobOffer) {
     // Algorithme qui:
     // - Sélectionne les meilleurs éléments de chaque catégorie
     // - Assure une composition équilibrée du CV
     // - Respecte les limites de longueur recommandées
     // - Privilégie les éléments les plus pertinents
   }
   ```

## 4. Livrables Détaillés

### 4.1 Application

#### 4.1.1 Code Source
- Dépôt Git complet avec historique des commits
- Documentation du code (JSDoc)
- Organisation modulaire des composants React
- Tests unitaires pour les fonctions critiques

#### 4.1.2 Base de Données
- Scripts SQL de création des tables
- Configuration des règles RLS (Row Level Security)
- Fonctions et triggers Supabase

#### 4.1.3 Documentation
- Guide d'installation détaillé
- Guide d'utilisation pour l'utilisateur final
- Documentation technique pour les développeurs
- Documentation de l'API Supabase

### 4.2 Fonctionnalités Minimales Viables (MVP)

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Authentification | Inscription, connexion, récupération de mot de passe | Haute |
| Gestion du profil | Saisie et modification des informations personnelles | Haute |
| Importation JSON | Validation et stockage des offres d'emploi | Haute |
| Génération de CV | Algorithme de correspondance de base | Haute |
| Export PDF | Génération d'un CV au format PDF | Haute |
| UI responsive | Interface adaptative (desktop/mobile) | Moyenne |
| Modèles de CV | 3 modèles de base | Moyenne |
| Prévisualisation | Aperçu avant export | Moyenne |

## 5. Planning de Développement Détaillé

### 5.1 Diagramme de Gantt Simplifié

```
Semaine 1:
[XXXXX] Configuration du projet et environnement
[XXXXX] Mise en place de Supabase
[XXX--] Création des tables et relations

Semaine 2:
[XXXXX] Authentification et profil utilisateur
[XXXXX] Formulaires de saisie des informations
[XXXXX] Interface de gestion des compétences
[XXX--] Interface de gestion des expériences

Semaine 3:
[XXXXX] Importation et validation JSON
[XXXXX] Algorithme de correspondance
[XXXXX] Génération de CV basique
[XX---] Interface de prévisualisation

Semaine 4:
[XXXXX] Export PDF
[XXXXX] Tests utilisateurs
[XXXXX] Corrections et optimisations
[XXXXX] Déploiement version MVP
```

### 5.2 Jalons Clés

| Jalon | Date | Livrable |
|-------|------|----------|
| Mise en place infrastructure | Fin Semaine 1 | Projet configuré, BDD opérationnelle |
| Gestion de profil complète | Milieu Semaine 2 | Interface utilisateur fonctionnelle |
| Importation d'offres | Début Semaine 3 | Système d'importation JSON |
| Génération de CV | Fin Semaine 3 | Algorithme fonctionnel |
| Livraison MVP | Fin Semaine 4 | Application complète utilisable |

## 6. Contraintes et Risques

### 6.1 Contraintes Techniques

| Contrainte | Impact | Mitigation |
|------------|--------|------------|
| Format JSON strict | Erreurs potentielles lors de l'importation | Validation robuste, feedback utilisateur clair |
| Limitations Supabase Free Tier | Volume limité à 500Mo | Optimisation du stockage, compression |
| Performances React avec grands jeux de données | Ralentissements UI | Pagination, chargement différé, virtualisation |

### 6.2 Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| Changement du format JSON de Claude | Moyenne | Élevé | Interface d'adaptation configurable |
| Complexité excessive de l'algorithme de matching | Moyenne | Moyen | Approche itérative, commencer simple |
| Difficulté d'export PDF fidèle | Élevée | Moyen | Utiliser une bibliothèque robuste (React-PDF) |
| Problèmes de performance sur mobile | Moyenne | Faible | Tests précoces sur appareils mobiles |

## 7. Annexes Techniques

### 7.1 Prompt Claude Détaillé
```
Analyse cette offre d'emploi et extrait les informations clés au format JSON strictement structuré comme suit:

{
  "metadata": {
    "source": "[Source de l'offre]",
    "date_analyse": "[Date au format ISO]",
    "url_origine": "[URL de l'offre si disponible]"
  },
  "offre": {
    "titre": "[Titre exact du poste]",
    "entreprise": "[Nom de l'entreprise]",
    "localisation": "[Lieu de travail]",
    "type_contrat": "[Type de contrat: CDI, CDD, Freelance, etc.]",
    "salaire": "[Fourchette de salaire si mentionnée]",
    "description": "[Description complète du poste]",
    "competences_requises": [
      {"nom": "[Nom de la compétence]", "niveau": "[Niveau requis]", "importance": [1-5]}
    ],
    "experience_requise": "[Années d'expérience demandées]",
    "formation_requise": "[Formation demandée]",
    "mots_cles": ["[Liste de mots-clés pertinents]"]
  },
  "analyse": {
    "competences_prioritaires": ["[Top 3-5 compétences les plus importantes]"],
    "competences_secondaires": ["[Compétences moins cruciales mais utiles]"],
    "experiences_pertinentes": ["[Types d'expériences valorisées]"],
    "formations_pertinentes": ["[Formations valorisées]"],
    "mots_cles_cv": ["[Mots-clés à inclure dans le CV]"]
  }
}

Assure-toi que:
1. Les compétences sont clairement identifiées avec leur niveau d'importance
2. Les mots-clés sont pertinents et spécifiques au domaine
3. L'analyse distingue bien les éléments prioritaires des éléments secondaires
4. Le format JSON est strictement respecté et valide

Voici l'offre à analyser:
[Contenu de l'offre d'emploi]
```

### 7.2 Structure de Composants React

```
src/
├── assets/
│   ├── templates/ (modèles de CV)
│   └── images/
├── components/
│   ├── common/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── ...
│   ├── forms/
│   │   ├── PersonalInfoForm.jsx
│   │   ├── SkillForm.jsx
│   │   ├── ExperienceForm.jsx
│   │   └── ...
│   ├── cv/
│   │   ├── CVPreview.jsx
│   │   ├── TemplateSelector.jsx
│   │   ├── templates/
│   │   │   ├── ModernTemplate.jsx
│   │   │   ├── ClassicTemplate.jsx
│   │   │   └── CreativeTemplate.jsx
│   │   └── ...
│   └── job-offers/
│       ├── OfferImport.jsx
│       ├── OfferList.jsx
│       ├── OfferDetails.jsx
│       └── ...
├── contexts/
│   ├── AuthContext.jsx
│   ├── ProfileContext.jsx
│   └── ...
├── hooks/
│   ├── useSupabase.js
│   ├── useProfile.js
│   ├── useJobOffers.js
│   └── ...
├── lib/
│   ├── supabase.js
│   ├── matching-algorithm.js
│   ├── pdf-generator.js
│   └── ...
├── pages/
│   ├── Auth/
│   ├── Dashboard/
│   ├── Profile/
│   ├── JobOffers/
│   ├── CVGenerator/
│   └── ...
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── helpers.js
│   └── ...
├── App.jsx
└── main.jsx
```

## 8. Plan de Test

### 8.1 Tests Unitaires
- Validation du format JSON
- Algorithme de correspondance
- Génération de CV

### 8.2 Tests d'Intégration
- Flux complet de l'importation à la génération
- Interactions entre les différents modules

### 8.3 Tests Utilisateurs
- Panel de 3-5 utilisateurs test
- Scénarios d'utilisation prédéfinis
- Recueil des retours et itérations

## 9. Critères d'Acceptation

| Fonctionnalité | Critère d'acceptation |
|----------------|------------------------|
| Importation JSON | Le système accepte correctement les JSON valides et rejette les JSON invalides avec des messages d'erreur clairs |
| Génération de CV | Le CV généré met en avant les compétences et expériences pertinentes pour l'offre |
| Export PDF | Le PDF généré est visuellement correct et conforme à la prévisualisation |
| Interface utilisateur | L'interface est intuitive et répond aux standards d'accessibilité WCAG 2.1 niveau AA |
| Performance | Le temps de génération d'un CV n'excède pas 3 secondes |

## 10. Évolutions Futures Détaillées (suite)

### 10.1 Roadmap Moyen Terme (3-6 mois)

| Fonctionnalité | Description | Complexité |
|----------------|-------------|------------|
| Intégration API Claude | Connexion directe pour l'analyse des offres | Moyenne |
| Import PDF | Extraction de texte des PDF d'offres | Élevée |
| Modèles avancés | 5+ nouveaux modèles de CV personnalisables | Moyenne |
| Analytics | Statistiques de correspondance et taux de succès | Moyenne |
| Export multi-formats | Support pour DOCX, HTML, et formats ATS-friendly | Moyenne |
| Suggestions automatiques | Recommandations d'amélioration du CV basées sur l'analyse | Élevée |
| Historique des versions | Suivi des modifications et versions précédentes des CV | Faible |

### 10.2 Roadmap Long Terme (6-12 mois)

| Fonctionnalité | Description | Complexité |
|----------------|-------------|------------|
| Extraction directe d'URL | Récupération et analyse automatique depuis les sites d'emploi | Élevée |
| IA de réécriture | Reformulation intelligente des descriptions d'expérience | Très élevée |
| Intégration multi-plateformes | Plugins pour LinkedIn, Indeed, etc. | Élevée |
| Dashboard analytique | Visualisation des correspondances et suggestions | Moyenne |
| Lettre de motivation | Génération assistée de lettres de motivation assorties | Élevée |
| Partage direct | Envoi du CV aux recruteurs via l'application | Moyenne |
| API publique | Permettre l'intégration à d'autres services | Élevée |

## 11. Budget et Ressources

### 11.1 Estimation des Coûts de Développement

| Poste | Estimation (jours/homme) | Coût estimé (€) |
|-------|--------------------------|-----------------|
| Configuration et infrastructure | 3 | 1 500 |
| Développement frontend | 10 | 5 000 |
| Intégration Supabase | 4 | 2 000 |
| Algorithme de matching | 5 | 2 500 |
| Génération PDF | 3 | 1 500 |
| Tests et optimisations | 5 | 2 500 |
| **Total** | **30** | **15 000** |

### 11.2 Coûts d'Infrastructure Mensuels

| Service | Plan | Coût mensuel (€) |
|---------|------|------------------|
| Supabase | Gratuit puis Pro | 0 puis 25 |
| Hébergement Frontend (Vercel) | Hobby puis Pro | 0 puis 20 |
| Domaine personnalisé | Annuel | ~2 |
| API Claude (si intégration directe) | Pay-as-you-go | Variable (~50-100) |
| **Total mensuel estimé** | | **30-150** |

## 12. Documents de Référence

### 12.1 Exemples de CV Générés

Des exemples de CV seront fournis pour illustrer les différents modèles et formats disponibles:

1. CV Moderne - Adapté pour les postes tech (web, mobile)
2. CV Classique - Pour les postes plus traditionnels
3. CV Créatif - Pour les postes en design et créatifs

### 12.2 Exemples de JSON d'Offres

Plusieurs exemples de JSON d'offres d'emploi seront fournis pour tester l'application:

1. Exemple pour un poste de développeur frontend
2. Exemple pour un poste fullstack
3. Exemple pour un poste DevOps

### 12.3 Guides d'Intégration

Documentation technique pour les futures intégrations:
- Guide d'intégration avec Claude API
- Guide d'intégration des extracteurs PDF
- Guide d'intégration avec les plateformes d'emploi

## 13. Glossaire Technique

| Terme | Définition |
|-------|------------|
| **React** | Bibliothèque JavaScript pour créer des interfaces utilisateur |
| **Vite** | Outil de build et serveur de développement pour applications web modernes |
| **MUI** | Bibliothèque de composants React pour Material Design |
| **Supabase** | Alternative open source à Firebase, fournissant BDD, Auth, et Storage |
| **PostgreSQL** | Système de gestion de base de données relationnelle |
| **Claude AI** | Service d'intelligence artificielle conversationnelle développé par Anthropic |
| **JSON** | Format de données textuelles structurées basé sur la syntaxe des objets JavaScript |
| **API REST** | Interface de programmation respectant les contraintes du style d'architecture REST |
| **ATS** | Applicant Tracking System - Système de suivi des candidatures utilisé par les recruteurs |

## 14. Conclusion et Prochaines Étapes

### 14.1 Récapitulatif du Projet
Le projet "CV Dynamique" vise à créer une application web permettant de générer des CV personnalisés et adaptés à des offres d'emploi spécifiques. L'application utilisera React, Vite, MUI et Supabase pour offrir une expérience utilisateur fluide et performante.

### 14.2 Prochaines Étapes Immédiates
1. Validation finale du cahier des charges
2. Mise en place de l'environnement de développement
3. Configuration de Supabase et création des tables
4. Développement du MVP selon le planning établi

### 14.3 Points de Décision Clés
- Choix définitif des modèles de CV pour la version MVP
- Validation de la structure JSON finale pour les offres d'emploi
- Approbation de l'algorithme de matching après tests préliminaires

Ce cahier des charges constitue un document vivant qui pourra être ajusté au cours du développement du projet, tout en conservant l'objectif principal de créer un outil efficace pour générer des CV personnalisés et adaptés aux offres d'emploi.