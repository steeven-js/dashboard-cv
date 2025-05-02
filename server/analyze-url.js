import axios from 'axios';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de l'API Ollama
const OLLAMA_CONFIG = {
  // URL de l'API Ollama
  apiUrl: `${process.env.OLLAMA_API_URL}/api/generate`,
  // Modèle à utiliser
  model: process.env.OLLAMA_MODEL || 'deepseek-r1:70b',
  // Token d'authentification
  authToken: process.env.OLLAMA_AUTH_TOKEN,
  // Timeout en millisecondes
  timeout: 180000,
  // Température (0-1) - plus bas = plus déterministe
  temperature: 0.0,
  // Nombre maximum de tokens à générer
  maxTokens: 8192
};

// Fonction pour extraire des informations de base de l'HTML
function extractBasicInfo(html) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extraire le titre et autres métadonnées
    const title = document.title || '';
    const metaData = {};

    // Extraire les métadonnées
    document.querySelectorAll('meta').forEach(meta => {
      const property = meta.getAttribute('property') || meta.getAttribute('name');
      const content = meta.getAttribute('content');
      if (property && content) {
        metaData[property] = content;
      }
    });

    // Extraire le texte principal
    const bodyText = document.body ? document.body.textContent : '';
    const mainContent = bodyText.replace(/\s+/g, ' ').trim().substring(0, 5000);

    return {
      title,
      metaData,
      mainContent
    };
  } catch (error) {
    console.error('Error extracting basic info:', error);
    return { title: '', metaData: {}, mainContent: '' };
  }
}

// Fonction pour convertir une réponse formatée en JSON
function convertFormattedResponseToJson(text) {
  try {
    const result = {
      title: "",
      company: "",
      location: "",
      contractType: "",
      skills: [],
      salary: "",
      experience: "",
      education: "",
      summary: "",
      responsibilities: [],
      benefits: []
    };

    // Extraction du titre
    const titleMatch = text.match(/Title:?\s*([^\n]+)/i);
    if (titleMatch) {
      result.title = titleMatch[1].replace('H/F', '').trim();
    }

    // Extraction de l'entreprise
    const companyMatch = text.match(/Company:?\s*([^\n]+)/i);
    if (companyMatch) {
      result.company = companyMatch[1].trim();
    }

    // Extraction du lieu
    const locationMatch = text.match(/Location:?\s*([^\n]+)/i);
    if (locationMatch) {
      result.location = locationMatch[1].trim();
    }

    // Extraction du type de contrat
    const contractMatch = text.match(/Type:?\s*([^\n]+)/i) || text.match(/Contract:?\s*([^\n]+)/i);
    if (contractMatch) {
      result.contractType = contractMatch[1].includes('CDI') ? 'CDI' : contractMatch[1].trim();
    }

    // Extraction du salaire
    const salaryMatch = text.match(/Salary:?\s*([^\n]+)/i) || text.match(/Salaire:?\s*([^\n]+)/i);
    if (salaryMatch) {
      result.salary = salaryMatch[1].trim();
    }

    // Extraction de l'expérience
    const experienceMatch = text.match(/Experience:?\s*([^\n]+)/i) || text.match(/Expérience:?\s*([^\n]+)/i);
    if (experienceMatch) {
      result.experience = experienceMatch[1].trim();
    }

    // Extraction de l'éducation
    const educationMatch = text.match(/Education:?\s*([^\n]+)/i) || text.match(/Formation:?\s*([^\n]+)/i);
    if (educationMatch) {
      result.education = educationMatch[1].trim();
    }

    // Extraction du résumé/description
    const descriptionMatch = text.match(/Job Description:?\s*([^\n]+)/i) ||
      text.match(/Description:?\s*([^\n]+)/i) ||
      text.match(/Résumé:?\s*([^\n]+)/i);
    if (descriptionMatch) {
      result.summary = descriptionMatch[1].trim();
    }

    // Extraction des responsabilités
    const responsibilitiesSection = text.match(/Key responsibilities:?\s*include:([\s\S]*?)(?=\n\s*[A-Z]|$)/i) ||
      text.match(/Responsibilities:?\s*([\s\S]*?)(?=\n\s*[A-Z]|$)/i) ||
      text.match(/Missions:?\s*([\s\S]*?)(?=\n\s*[A-Z]|$)/i);
    if (responsibilitiesSection) {
      const responsibilitiesText = responsibilitiesSection[1] || responsibilitiesSection[0];
      const responsibilities = responsibilitiesText.split(/\n\s*-\s*/).filter(item => item.trim() !== '');
      result.responsibilities = responsibilities.map(item => item.trim());
    }

    // Liste des compétences techniques courantes en développement backend
    const techSkills = [
      'Java', 'PHP', 'SQL', 'PostgreSQL', 'Oracle', 'REST', 'SOAP', 'ETL', 'Python', 'JavaScript',
      'Spring', 'Symfony', 'Laravel', 'FastAPI', 'Django', 'Node.js', 'Express', 'API',
      'API Platform', 'Quasar', 'Kafka', 'Airflow', 'Linux', 'Docker', 'Kubernetes',
      'NoSQL', 'MongoDB', 'ElasticSearch', 'Redis', 'C#', '.NET', 'Go', 'Golang',
      'microservices', 'low-code', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD'
    ];

    // Extraction des compétences techniques
    techSkills.forEach(skill => {
      if (text.includes(skill)) {
        if (!result.skills.includes(skill)) {
          result.skills.push(skill);
        }
      }
    });

    // Mots clés liés aux avantages
    const benefitKeywords = [
      'télétravail', 'remote', 'flexibilité', 'horaires', 'mutuelle', 'santé', 'assurance',
      'tickets restaurant', 'carte restaurant', 'RTT', 'congés', 'formation',
      'mobilité', 'transport', 'prime', 'bonus', 'participation', 'intéressement',
      'CE', 'comité d\'entreprise', 'actionnariat', 'SWILE', 'crèche'
    ];

    // Extraction des avantages basée sur les mots clés
    benefitKeywords.forEach(keyword => {
      const regex = new RegExp(`[\\w\\s]*${keyword}[\\w\\s]*`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        matches.forEach(match => {
          const benefit = match.trim();
          if (benefit && !result.benefits.includes(benefit)) {
            result.benefits.push(benefit);
          }
        });
      }
    });

    // Si toujours vide, chercher spécifiquement la section benefits
    if (result.benefits.length === 0) {
      const benefitsMatches = text.match(/benefits:?\s*([\s\S]*?)(?=\n\s*[A-Z]|$)/i) ||
        text.match(/avantages:?\s*([\s\S]*?)(?=\n\s*[A-Z]|$)/i);
      if (benefitsMatches) {
        const benefitsText = benefitsMatches[1];
        const benefits = benefitsText.split(/\n\s*-\s*|,|\s+and\s+/).filter(item => item.trim() !== '');
        result.benefits = benefits.map(item => item.trim());
      }
    }

    return result;
  } catch (error) {
    console.error('Error converting formatted response to JSON:', error);
    throw error;
  }
}

// Fonction pour extraire les données directement du HTML
function extractDataFromHTML(html) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const result = {
      title: "",
      company: "",
      location: "",
      contractType: "",
      skills: [],
      salary: "",
      experience: "",
      education: "",
      summary: "",
      responsibilities: [],
      benefits: []
    };

    // Extraction du titre
    const h1 = document.querySelector('h1');
    if (h1) {
      // Nettoyer le titre en enlevant H/F et tout texte après le nom de l'entreprise
      const fullTitle = h1.textContent.trim();
      result.title = fullTitle.replace(/H\/F.*$/, '').trim();

      // Extraire l'entreprise du titre s'il contient le nom
      const companyMatch = fullTitle.match(/H\/F\s+([^-\n]+)/);
      if (companyMatch) {
        result.company = companyMatch[1].trim();
      }
    } else {
      // Fallback: utiliser le titre de la page
      const pageTitle = document.title;
      if (pageTitle.includes('-')) {
        const parts = pageTitle.split('-');
        result.title = parts[0].replace(/H\/F/, '').trim();

        if (parts.length > 1) {
          // Le nom de l'entreprise est souvent après le premier tiret
          result.company = parts[1].replace(/Recrutement par|Recrutement/, '').trim();
        }
      } else {
        result.title = pageTitle;
      }
    }

    // Extraction directe de l'entreprise si pas encore trouvée
    if (!result.company) {
      // Chercher dans des éléments HTML spécifiques
      const companyElements = Array.from(document.querySelectorAll('h1 ~ div, .company, .recruiter'));
      for (const el of companyElements) {
        const text = el.textContent.trim();
        if (text && text.length < 50) { // Un nom d'entreprise est généralement court
          result.company = text;
          break;
        }
      }
    }

    // Extraction de la localisation
    // Chercher dans le titre de la page
    const locationRegex = /((?:Paris|Lyon|Marseille|Toulouse|Nice|Nantes|Strasbourg|Montpellier|Bordeaux|Lille|Rennes|Reims|Le Havre|Saint-Étienne|Toulon|Grenoble|Dijon|Angers|Le Mans|Aix-en-Provence|Brest|Nîmes|Clermont-Ferrand|Limoges|Tours|Amiens|Metz|Perpignan|Besançon|Orléans|Mulhouse|Rouen|Caen|Nancy|Saint-Denis|Saint-Paul|Montreuil|Argenteuil|Roubaix|Tourcoing|Dunkerque|Avignon|Nanterre|Poitiers|Créteil|Versailles|Asnières-sur-Seine|Courbevoie|Colombes|Vitry-sur-Seine|Pau|La Rochelle|Aubervilliers|Champigny-sur-Marne|Rueil-Malmaison|Antibes|Saint-Maur-des-Fossés|Calais|Cannes|Le Tampon|Béziers|Colmar|Bourges|Drancy|Mérignac|Valence|Ajaccio|Issy-les-Moulineaux|Villeneuve-d'Ascq|Levallois-Perret|Noisy-le-Grand|Quimper|La Seyne-sur-Mer|Antony|Troyes|Neuilly-sur-Seine|Sarcelles|Pessac|Ivry-sur-Seine|Cergy|Cayenne|Clichy|Chambéry|Lorient|Niort|Montauban|Villejuif|Hyères|Saint-Quentin|Beauvais|Vannes)(?:\s+\d{2})?)/i;

    const pageTitle = document.title;
    const locationMatch = pageTitle.match(locationRegex);

    if (locationMatch) {
      result.location = locationMatch[1].trim();
    } else {
      // Chercher dans le corps du document
      const bodyText = document.body.textContent;
      const locationInBody = bodyText.match(locationRegex);
      if (locationInBody) {
        result.location = locationInBody[1].trim();
      }
    }

    // Extraction du type de contrat
    if (pageTitle.includes('CDI')) {
      result.contractType = 'CDI';
    } else if (pageTitle.includes('CDD')) {
      result.contractType = 'CDD';
    } else if (pageTitle.includes('Stage')) {
      result.contractType = 'Stage';
    } else if (pageTitle.includes('Alternance')) {
      result.contractType = 'Alternance';
    } else if (pageTitle.includes('Freelance')) {
      result.contractType = 'Freelance';
    }

    // Extraction de l'expérience et de l'éducation
    const bodyText = document.body.textContent;

    // Expérience
    const experienceRegex = /exp[ée]rience.{1,20}(\d+\s*(ans|an|mois|années)|senior|confirmé)/i;
    const expMatch = bodyText.match(experienceRegex);
    if (expMatch) {
      result.experience = expMatch[0].trim();
    }

    // Éducation/Formation
    const educationRegex = /(bac\s*[+]\s*\d|master|licence|diplôm[ée])/i;
    const eduMatch = bodyText.match(educationRegex);
    if (eduMatch) {
      result.education = eduMatch[0].trim();
    }

    // Extraction du salaire
    const salaryRegex = /(\d{2,3}(?:\s?\d{3})*)(?:\s*[à-]\s*(\d{2,3}(?:\s?\d{3})*))?(?:\s*€|\seuros|\sk€)/i;
    const salaryMatch = bodyText.match(salaryRegex);
    if (salaryMatch) {
      result.salary = salaryMatch[0].trim();
    }

    // Extraction des sections spécifiques
    const sections = document.querySelectorAll('h2, h3');
    sections.forEach(section => {
      const title = section.textContent.trim().toLowerCase();
      const content = getNextSiblingContent(section);

      // Missions/Responsabilités
      if (title.includes('missions') || title.includes('poste')) {
        result.responsibilities = splitResponsibilities(content);

        // Si toujours rien, essayer avec le contenu brut
        if (result.responsibilities.length === 0) {
          result.responsibilities.push(content.trim());
        }
      }

      // Profil recherché - pour le résumé et les compétences
      if (title.includes('profil') || title.includes('recherché')) {
        // Utiliser comme résumé
        if (!result.summary && content.length > 10) {
          const firstSentence = content.split(/\.\s+/)[0];
          if (firstSentence && firstSentence.length > 10) {
            result.summary = firstSentence.trim() + (firstSentence.endsWith('.') ? '' : '.');
          }
        }

        // Compétences techniques spécifiques au développement backend
        const techSkills = [
          'Java', 'PHP', 'SQL', 'PostgreSQL', 'Oracle', 'REST', 'SOAP', 'ETL', 'Python', 'JavaScript',
          'Spring', 'Symfony', 'Laravel', 'FastAPI', 'Django', 'Node.js', 'Express', 'API',
          'API Platform', 'Quasar', 'Kafka', 'Airflow', 'Linux', 'Docker', 'Kubernetes',
          'NoSQL', 'MongoDB', 'ElasticSearch', 'Redis', 'C#', '.NET', 'Go', 'Golang',
          'microservices', 'low-code', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'SQL/PostgreSQL'
        ];

        techSkills.forEach(skill => {
          if (content.includes(skill)) {
            if (!result.skills.includes(skill)) {
              result.skills.push(skill);
            }
          }
        });
      }

      // Avantages et infos complémentaires
      if (title.includes('complémentaires') || title.includes('avantages')) {
        const items = extractListItems(content);
        if (items.length > 0) {
          items.forEach(item => {
            if (item.length > 3 && !result.benefits.includes(item)) {
              result.benefits.push(item);
            }
          });
        } else if (content.length > 5) {
          // Découper par phrases ou lignes
          const lines = content.split(/\n|\./).filter(line => line.trim().length > 5);
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !result.benefits.includes(trimmed)) {
              result.benefits.push(trimmed);
            }
          });
        }
      }
    });

    // Si aucune compétence n'a été trouvée, chercher dans tout le document
    if (result.skills.length === 0) {
      const techSkills = [
        'Java', 'PHP', 'SQL', 'PostgreSQL', 'Oracle', 'REST', 'SOAP', 'ETL', 'Python', 'JavaScript',
        'Spring', 'Symfony', 'Laravel', 'FastAPI', 'Django', 'Node.js', 'Express', 'API',
        'API Platform', 'Quasar', 'Kafka', 'Airflow', 'Linux', 'Docker', 'Kubernetes',
        'NoSQL', 'MongoDB', 'ElasticSearch', 'Redis', 'C#', '.NET', 'Go', 'Golang',
        'microservices', 'low-code', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD'
      ];

      techSkills.forEach(skill => {
        if (bodyText.includes(skill)) {
          if (!result.skills.includes(skill)) {
            result.skills.push(skill);
          }
        }
      });
    }

    // Si aucun résumé, utiliser le premier paragraphe de la description
    if (!result.summary) {
      const paragraphs = document.querySelectorAll('p');
      for (const p of paragraphs) {
        const text = p.textContent.trim();
        if (text.length > 50 && text.length < 300) {
          result.summary = text;
          break;
        }
      }
    }

    // Si toujours pas de résumé, utiliser la première responsabilité
    if (!result.summary && result.responsibilities.length > 0) {
      result.summary = result.responsibilities[0];
    }

    // Si aucun avantage n'a été trouvé, chercher des mots-clés dans tout le document
    if (result.benefits.length === 0) {
      const benefitKeywords = [
        'télétravail', 'remote', 'mutuelle', 'tickets restaurant', 'carte restaurant', 'SWILE',
        'RTT', 'formation', 'mobilité', 'prime', 'bonus', 'participation', 'intéressement'
      ];

      benefitKeywords.forEach(keyword => {
        if (bodyText.toLowerCase().includes(keyword.toLowerCase())) {
          result.benefits.push(keyword);
        }
      });
    }

    // Nettoyer les données
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'string') {
        result[key] = result[key].replace(/\s+/g, ' ').trim();
      } else if (Array.isArray(result[key])) {
        result[key] = result[key].map(item =>
          typeof item === 'string' ? item.replace(/\s+/g, ' ').trim() : item
        ).filter(item => item && item.length > 0);
      }
    });

    return result;
  } catch (error) {
    console.error('Error extracting data from HTML:', error);
    return null;
  }
}

// Extraire le contenu des éléments suivants
function getNextSiblingContent(element) {
  let content = '';
  let nextElement = element.nextElementSibling;

  while (nextElement && !['H1', 'H2', 'H3', 'H4'].includes(nextElement.tagName)) {
    content += nextElement.textContent + '\n';
    nextElement = nextElement.nextElementSibling;
  }

  return content.trim();
}

// Extraire des éléments de liste
function extractListItems(text) {
  if (!text) return [];

  // Essayer de trouver des éléments de liste (commençant par - ou •)
  const listItems = text.split(/\n\s*[-•*]\s*/).filter(item => item.trim() !== '');

  if (listItems.length > 1) {
    return listItems.map(item => item.trim());
  }

  // Sinon, essayer de diviser par lignes
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length > 1) {
    return lines.map(line => line.trim());
  }

  return [];
}

// Extraction des responsabilités améliorée
function splitResponsibilities(text) {
  if (!text) return [];

  // 1. Essayer de trouver des éléments numérotés
  const numberedPattern = /\b(\d+\s*[.)-]\s*[^0-9][^\n]*)/g;
  const numberedMatches = [...text.matchAll(numberedPattern)];
  if (numberedMatches.length > 1) {
    return numberedMatches.map(m => m[1].trim()).filter(s => s.length > 5);
  }

  // 2. Essayer de trouver des items avec tirets
  const bulletItems = text.split(/\n\s*[-•*]\s*/).filter(item => item.trim().length > 5);
  if (bulletItems.length > 1) {
    return bulletItems.map(item => item.trim());
  }

  // 3. Chercher les verbes à l'infinitif en début de phrase (typique des responsabilités)
  const infinitivePattern = /\b((?:Développer|Concevoir|Maintenir|Assurer|Gérer|Participer|Rédiger|Optimiser|Intégrer|Collaborer|Tester|Implémenter|Analyser|Contribuer|Veiller|Définir)[^\.\n;]*)/gi;
  const verbMatches = [...text.matchAll(infinitivePattern)];
  if (verbMatches.length > 1) {
    return verbMatches.map(m => m[1].trim() + (m[1].endsWith('.') ? '' : '.')).filter(s => s.length > 10);
  }

  // 4. Couper par points ou points-virgules
  const sentences = text.split(/\.|\;/).filter(s => s.trim().length > 10);
  if (sentences.length > 1) {
    return sentences.map(s => s.trim() + (s.endsWith('.') ? '' : '.'));
  }

  // 5. Couper par lignes
  const lines = text.split('\n').filter(line => line.trim().length > 10);
  if (lines.length > 1) {
    return lines.map(line => line.trim());
  }

  // Si tout échoue, renvoyer le texte entier
  return [text.trim()];
}

// Fonction qui envoie une URL à Ollama pour analyse
async function analyzeJobUrl(url) {
  try {
    console.log(`Analysing URL: ${url}`);

    // Récupérer le contenu de l'URL
    console.log('Fetching content from URL...');
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 30000
    });

    // Essayer d'extraire les données directement du HTML d'abord
    const htmlData = extractDataFromHTML(response.data);

    if (htmlData && htmlData.skills.length > 0 && htmlData.responsibilities.length > 0) {
      console.log('Successfully extracted data directly from HTML');

      // Ajouter les métadonnées
      htmlData.url = url;
      htmlData.analyzedAt = new Date().toISOString();
      htmlData.source = 'direct-html-extraction';

      // Sauvegarde dans un fichier
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `job-analysis-html-${timestamp}.json`;
      fs.writeFileSync(`./${filename}`, JSON.stringify(htmlData, null, 2));

      console.log(`Analysis saved to ./${filename}`);
      return htmlData;
    }

    // Si l'extraction directe n'a pas fonctionné ou est incomplète, continuer avec Ollama
    console.log('Direct HTML extraction incomplete, trying with Ollama...');

    // Extraire des informations de base
    const basicInfo = extractBasicInfo(response.data);
    console.log(`Page title: ${basicInfo.title}`);

    // Créer le prompt pour Ollama avec le contenu réel
    const prompt = `
      Tu es un système d'extraction d'information spécialisé dans les offres d'emploi.

      Analyse cette offre d'emploi et retourne UNIQUEMENT un objet JSON avec EXACTEMENT cette structure :

      {
        "title": "",
        "company": "",
        "location": "",
        "contractType": "",
        "skills": [],
        "salary": "",
        "experience": "",
        "education": "",
        "summary": "",
        "responsibilities": [],
        "benefits": []
      }

      IMPORTANT:
      - Ta réponse doit contenir UNIQUEMENT le JSON valide, sans texte explicatif, sans bloc de code, sans formatage
      - Réponds UNIQUEMENT en français (pas d'anglais)

      INSTRUCTIONS D'EXTRACTION :
      - "title": Le titre du poste (sans le H/F)
      - "company": Nom de l'entreprise
      - "location": Lieu de travail
      - "contractType": Type de contrat (CDI, CDD, etc.)
      - "skills": Toutes les compétences techniques mentionnées (Java, PHP, SQL, PostgreSQL, etc.)
      - "salary": Information sur le salaire
      - "experience": Expérience requise
      - "education": Niveau d'études requis
      - "summary": Résumé du poste
      - "responsibilities": Les principales missions du poste (liste)
      - "benefits": Avantages proposés par l'entreprise (liste)

      CHERCHE ATTENTIVEMENT dans les sections :
      - "Les missions du poste" pour les responsabilités
      - "Le profil recherché" pour les compétences et l'expérience
      - "Infos complémentaires" pour les avantages
      - "COMPÉTENCES TECHNIQUES REQUISES" pour les compétences

      ATTENTION: Pour les compétences techniques, cherche précisément les langages de programmation, frameworks, outils et technologies spécifiques comme Java, PHP, Python, SQL, PostgreSQL, Oracle, REST, SOAP, ETL, API, etc.

      Pour les avantages, cherche des éléments comme télétravail, tickets restaurant, mutuelle, RTT, primes, etc.

      NE LAISSE AUCUN CHAMP VIDE si l'information est disponible dans le texte.

      Voici le contenu de l'URL ${url} :

      Titre de la page : ${basicInfo.title}

      Contenu :
      ${basicInfo.mainContent}
    `;

    // Envoi à Ollama (model mistral par défaut)
    console.log(`Sending request to Ollama on VPS using model ${OLLAMA_CONFIG.model}...`);
    const ollamaResponse = await axios.post(OLLAMA_CONFIG.apiUrl, {
      model: OLLAMA_CONFIG.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: OLLAMA_CONFIG.temperature,
        num_predict: OLLAMA_CONFIG.maxTokens
      }
    }, {
      timeout: OLLAMA_CONFIG.timeout,
      headers: {
        'Authorization': `Bearer ${OLLAMA_CONFIG.authToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Extraction du JSON de la réponse
    const ollamaText = ollamaResponse.data.response;
    console.log('Received response from Ollama');

    // Afficher un extrait de la réponse brute pour le débogage
    console.log('Raw response (first 300 chars):');
    console.log(ollamaText.substring(0, 300));

    // Nettoyage de la réponse
    let jsonText = ollamaText.trim();

    // Suppression des blocs de code markdown si présents
    if (jsonText.includes('```')) {
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    }

    try {
      // Essayer de parser le JSON
      let result;
      try {
        result = JSON.parse(jsonText);
      } catch (e) {
        // Si le parsing échoue, essayer de convertir la réponse formatée
        console.log('JSON parsing failed, trying to convert formatted response...');
        result = convertFormattedResponseToJson(ollamaText);
      }

      // Ajout des métadonnées
      result.url = url;
      result.analyzedAt = new Date().toISOString();

      // Sauvegarde dans un fichier
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `job-analysis-${timestamp}.json`;
      fs.writeFileSync(`./${filename}`, JSON.stringify(result, null, 2));

      console.log(`Analysis saved to ./${filename}`);
      return result;
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError.message);
      console.log('Failed JSON text:', jsonText);

      // Sauvegarde de la réponse brute pour analyse
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const rawFilename = `job-analysis-raw-${timestamp}.txt`;
      fs.writeFileSync(`./${rawFilename}`, ollamaText);
      console.log(`Raw response saved to ./${rawFilename}`);

      throw jsonError;
    }
  } catch (error) {
    console.error('Error analyzing job URL:', error.message);
    return { error: error.message, url };
  }
}

// Fonction principale
async function main() {
  // Récupérer l'URL depuis les arguments de la ligne de commande
  const url = process.argv[2];

  if (!url) {
    console.error('Please provide a URL as an argument');
    console.log('Usage: node analyze-url.js https://www.example.com/job-posting');
    process.exit(1);
  }

  try {
    const result = await analyzeJobUrl(url);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Exécuter le script
main();
