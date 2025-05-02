// Configuration de l'API Ollama
const OLLAMA_CONFIG = {
    // URL de l'API Ollama
    apiUrl: 'http://69.62.71.69:8080/api/generate',
    // Modèle à utiliser
    model: 'deepseek-r1:70b',
    // Token d'authentification
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1eHFka3Znd2RycGJ6bm10dGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMTQ5NTEsImV4cCI6MjA2MDY5MDk1MX0.dRgvdhzMvZK59lSV-O71ulbREy4AgSVG3kjaW7_iwNY',
    // Timeout en millisecondes
    timeout: 180000,
    // Température (0-1) - plus bas = plus déterministe
    temperature: 0.0,
    // Nombre maximum de tokens à générer
    maxTokens: 8192,
    // Forcer l'utilisation d'Ollama même si l'extraction HTML réussit
    forceUseOllama: true
};

// Dans la fonction analyzeJobUrl, remplacer la partie qui vérifie le résultat de l'extraction HTML
// Remplacer:
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

// Par:
if (!OLLAMA_CONFIG.forceUseOllama && htmlData && htmlData.skills.length > 0 && htmlData.responsibilities.length > 0) {
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

// Si forceUseOllama est activé ou si l'extraction HTML n'est pas satisfaisante
if (OLLAMA_CONFIG.forceUseOllama) {
    console.log('Force using Ollama on VPS as configured...');
} else {
    console.log('Direct HTML extraction incomplete, trying with Ollama...');
}
