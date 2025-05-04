import { DEFAULT_JOB_OFFER } from 'src/data/job-offer-model';

/**
 * Utilitaires pour convertir les offres d'emploi entre différents formats
 */
import { normalizeJobOffer, extractListFromText, extractSkillsFromDescription } from './normalize-job-offer';

/**
 * Convertit une offre d'emploi au format JSON en objet structuré
 * @param {string|Object} jsonData - Données JSON à convertir
 * @returns {Object} - Résultat de l'importation
 */
export const fromJSON = (jsonData) => {
  try {
    // Si jsonData est une chaîne, on essaie de la parser
    const parsedData = typeof jsonData === 'string' 
      ? JSON.parse(jsonData) 
      : jsonData;
    
    if (!parsedData || typeof parsedData !== 'object') {
      return {
        success: false,
        data: null,
        error: 'Format JSON invalide - objet attendu',
      };
    }
    
    // Normaliser les données
    const normalizedData = normalizeJobOffer(parsedData);
    
    // Vérifier que les données minimales sont présentes
    const warnings = [];
    
    if (!normalizedData.title) {
      warnings.push('Le titre du poste est manquant');
    }
    
    if (!normalizedData.company?.name) {
      warnings.push('Le nom de l\'entreprise est manquant');
    }
    
    if (!normalizedData.description) {
      warnings.push('La description du poste est manquante');
    }
    
    // Extraire les compétences à partir de la description si non fournies
    if (normalizedData.description && (!normalizedData.keySkills || normalizedData.keySkills.length === 0)) {
      normalizedData.keySkills = extractSkillsFromDescription(normalizedData.description);
      if (normalizedData.keySkills.length > 0) {
        warnings.push('Les compétences clés ont été extraites automatiquement de la description');
      }
    }
    
    // Ajouter des métadonnées d'importation
    if (!normalizedData.metadata) {
      normalizedData.metadata = {};
    }
    
    normalizedData.metadata.importedAt = normalizedData.metadata.importedAt || new Date().toISOString();
    normalizedData.metadata.source = normalizedData.metadata.source || 'JSON import';
    
    return {
      success: true,
      data: normalizedData,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: `Erreur lors de l'importation JSON: ${error.message}`,
    };
  }
};

/**
 * Convertit une offre d'emploi en texte formaté
 * @param {Object} jobOffer - Offre d'emploi à convertir
 * @returns {string} - Texte formaté
 */
export const toFormattedText = (jobOffer) => {
  if (!jobOffer) return '';
  
  const { title, company, contract, description, requirements, responsibilities, keySkills, applicationInfo } = normalizeJobOffer(jobOffer);
  
  let result = [];
  
  // Titre et entreprise
  result.push(`# ${title}`);
  result.push(`## ${company.name}`);
  if (company.location) result.push(`📍 ${company.location}`);
  
  // Type de contrat
  const contractDetails = [];
  if (contract.type) contractDetails.push(contract.type);
  if (contract.workMode) contractDetails.push(contract.workMode);
  if (contractDetails.length) result.push(`💼 ${contractDetails.join(' - ')}`);
  
  // Salaire
  if (contract.salaryMin || contract.salaryMax) {
    const currency = contract.currency || 'EUR';
    const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency;
    
    if (contract.salaryMin && contract.salaryMax) {
      result.push(`💰 ${contract.salaryMin} - ${contract.salaryMax} ${currencySymbol}`);
    } else if (contract.salaryMin) {
      result.push(`💰 À partir de ${contract.salaryMin} ${currencySymbol}`);
    } else if (contract.salaryMax) {
      result.push(`💰 Jusqu'à ${contract.salaryMax} ${currencySymbol}`);
    }
  }
  
  // Description
  if (description) {
    result.push('\n## Description du poste');
    result.push(description);
  }
  
  // Responsabilités
  if (responsibilities && responsibilities.length) {
    result.push('\n## Responsabilités');
    responsibilities.forEach(resp => {
      result.push(`- ${resp}`);
    });
  }
  
  // Prérequis
  if (requirements && requirements.length) {
    result.push('\n## Prérequis');
    requirements.forEach(req => {
      result.push(`- ${req}`);
    });
  }
  
  // Compétences clés
  if (keySkills && keySkills.length) {
    result.push('\n## Compétences requises');
    result.push(keySkills.join(', '));
  }
  
  // Avantages
  if (contract.benefits && contract.benefits.length) {
    result.push('\n## Avantages');
    contract.benefits.forEach(benefit => {
      result.push(`- ${benefit}`);
    });
  }
  
  // Informations de candidature
  if (applicationInfo) {
    result.push('\n## Comment postuler');
    
    if (applicationInfo.url) {
      result.push(`🔗 [Postuler en ligne](${applicationInfo.url})`);
    }
    
    if (applicationInfo.contactName || applicationInfo.contactEmail || applicationInfo.contactPhone) {
      result.push('\n### Contact');
      if (applicationInfo.contactName) result.push(`Nom: ${applicationInfo.contactName}`);
      if (applicationInfo.contactEmail) result.push(`Email: ${applicationInfo.contactEmail}`);
      if (applicationInfo.contactPhone) result.push(`Téléphone: ${applicationInfo.contactPhone}`);
    }
    
    if (applicationInfo.deadline) {
      const date = new Date(applicationInfo.deadline);
      if (!isNaN(date.getTime())) {
        result.push(`\n📅 Date limite: ${date.toLocaleDateString('fr-FR')}`);
      }
    }
  }
  
  // Informations sur l'entreprise
  if (company.website || company.industry || company.size) {
    result.push('\n## À propos de l\'entreprise');
    if (company.website) result.push(`🌐 [Site web](${company.website})`);
    if (company.industry) result.push(`Secteur: ${company.industry}`);
    if (company.size) result.push(`Taille: ${company.size}`);
  }
  
  return result.join('\n\n');
};

/**
 * Convertit un texte brut en offre d'emploi structurée
 * @param {string} text - Texte à convertir
 * @returns {Object} - Résultat de la conversion
 */
export const fromText = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      data: null,
      error: 'Aucun texte fourni',
    };
  }
  
  try {
    const jobOffer = { ...DEFAULT_JOB_OFFER };
    const warnings = [];
    
    // Diviser le texte en sections
    const sections = text.split(/\n{2,}/);
    
    // Essayer d'identifier le titre
    const potentialTitle = sections[0]?.trim();
    if (potentialTitle && potentialTitle.length < 100) {
      jobOffer.title = potentialTitle;
    } else {
      warnings.push('Impossible d\'identifier clairement le titre');
    }
    
    // Essayer d'identifier le nom de l'entreprise
    const companyNameMatches = text.match(/(?:entreprise|société|company)\s*:\s*([^\n]+)/i);
    if (companyNameMatches && companyNameMatches[1]) {
      jobOffer.company.name = companyNameMatches[1].trim();
    } else {
      // Rechercher dans les premières lignes
      const firstLines = sections.slice(0, 3).join('\n');
      const lines = firstLines.split('\n');
      
      for (const line of lines) {
        if (line.trim() && line.trim() !== potentialTitle && line.length < 50) {
          jobOffer.company.name = line.trim();
          break;
        }
      }
    }
    
    // Essayer d'identifier les compétences requises
    const skills = [];
    const skillSectionMatch = text.match(/(?:compétences|skills|technologies|tech stack)[^\n]*\n+([^#]+)/i);
    
    if (skillSectionMatch && skillSectionMatch[1]) {
      // Extraire les compétences de cette section
      const skillText = skillSectionMatch[1].trim();
      const skillItems = extractListFromText(skillText);
      
      if (skillItems.length) {
        skills.push(...skillItems);
      } else {
        // Si pas d'items de liste, considérer comme une liste séparée par des virgules
        skills.push(...skillText.split(/[,;]/g).map(s => s.trim()).filter(Boolean));
      }
    }
    
    // Essayer d'identifier la description
    let description = '';
    const descriptionMatch = text.match(/(?:description|à propos|about|poste)[^\n]*\n+([^#]+)/i);
    
    if (descriptionMatch && descriptionMatch[1]) {
      description = descriptionMatch[1].trim();
    } else {
      // Utiliser le texte complet comme description
      warnings.push('Impossible d\'identifier clairement une section de description');
      description = text;
    }
    jobOffer.description = description;
    
    // Essayer d'identifier les exigences
    const requirementsMatch = text.match(/(?:prérequis|requirements|profil|qualifications)[^\n]*\n+([^#]+)/i);
    if (requirementsMatch && requirementsMatch[1]) {
      jobOffer.requirements = extractListFromText(requirementsMatch[1].trim());
    }
    
    // Essayer d'identifier les responsabilités
    const responsibilitiesMatch = text.match(/(?:responsabilités|missions|responsiblities|tasks|tâches)[^\n]*\n+([^#]+)/i);
    if (responsibilitiesMatch && responsibilitiesMatch[1]) {
      jobOffer.responsibilities = extractListFromText(responsibilitiesMatch[1].trim());
    }
    
    // Essayer d'identifier le type de contrat
    const contractMatch = text.match(/(?:contrat|contract)[^\n]*\s*:?\s*([^\n,;.]+)/i);
    if (contractMatch && contractMatch[1]) {
      const contractType = contractMatch[1].trim().toLowerCase();
      
      if (contractType.includes('cdi')) {
        jobOffer.contract.type = 'cdi';
      } else if (contractType.includes('cdd')) {
        jobOffer.contract.type = 'cdd';
      } else if (contractType.includes('freelance') || contractType.includes('indépendant')) {
        jobOffer.contract.type = 'freelance';
      } else if (contractType.includes('stage')) {
        jobOffer.contract.type = 'internship';
      } else if (contractType.includes('alternance') || contractType.includes('apprentissage')) {
        jobOffer.contract.type = 'apprenticeship';
      } else {
        jobOffer.contract.type = 'other';
      }
    }
    
    // Extraire des compétences à partir de la description si nécessaire
    if (skills.length === 0) {
      jobOffer.keySkills = extractSkillsFromDescription(description);
      if (jobOffer.keySkills.length > 0) {
        warnings.push('Les compétences ont été extraites automatiquement de la description');
      }
    } else {
      jobOffer.keySkills = skills;
    }
    
    // Ajouter des métadonnées
    jobOffer.metadata = {
      source: 'Text import',
      importedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      confidenceScore: 0.7, // Score arbitraire pour l'importation de texte
    };
    
    return {
      success: true,
      data: jobOffer,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: `Erreur lors de l'importation texte: ${error.message}`,
    };
  }
}; 