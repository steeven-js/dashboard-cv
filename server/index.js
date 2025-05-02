import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import axios from 'axios';
import bodyParser from 'body-parser';
import { JSDOM } from 'jsdom'; // Add this to your dependencies with: npm install jsdom
import fs from 'fs';
import puppeteer from 'puppeteer';

// Configuration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Helper function to extract key information from HTML
function extractJobDataFromHTML(html) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract basic information
    const title = document.title || '';

    // Initialize job data with basic info
    const jobData = {
      rawTitle: title,
      extractedData: {},
      rawHTML: html.substring(0, 5000) // Store a sample of raw HTML for debugging
    };

    // Try to extract data from structured metadata if available
    const metaTags = document.querySelectorAll('meta');
    metaTags.forEach(tag => {
      const property = tag.getAttribute('property') || tag.getAttribute('name');
      const content = tag.getAttribute('content');

      if (property && content) {
        jobData.extractedData[property] = content;
      }
    });

    // Look for script tags with JSON-LD data
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach(script => {
      try {
        if (script.textContent) {
          const jsonData = JSON.parse(script.textContent);
          jobData.jsonLD = jsonData;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });

    // Extract job details from common sections
    const extractSectionContent = (sectionTitle) => {
      const elements = document.querySelectorAll('h2, h3, h4');
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.textContent && element.textContent.trim().includes(sectionTitle)) {
          let content = '';
          let nextEl = element.nextElementSibling;

          while (nextEl && !['H2', 'H3', 'H4'].includes(nextEl.tagName)) {
            content += nextEl.textContent + '\n';
            nextEl = nextEl.nextElementSibling;
          }

          return content.trim();
        }
      }
      return '';
    };

    // Extract specific sections
    jobData.missionContent = extractSectionContent('Les missions du poste');
    jobData.profileContent = extractSectionContent('Le profil recherché');
    jobData.benefitsContent = extractSectionContent('Infos complémentaires');

    // Extract visible text
    const bodyText = document.body ? document.body.textContent : '';
    if (bodyText) {
      // Get first 3000 characters for summary
      jobData.bodyTextSample = bodyText.replace(/\s+/g, ' ').trim().substring(0, 3000);
    }

    return jobData;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return { error: 'Failed to parse HTML', errorDetails: error.message };
  }
}

// Routes
app.post('/api/analyze-job', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    console.log(`Processing job URL: ${url}`);

    // 1. Fetch job posting content
    console.log('Fetching job posting content...');
    const jobPageResponse = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000 // 30 second timeout
    });

    // Vérifier si nous avons bien récupéré du contenu HTML
    const html = jobPageResponse.data;
    if (!html || typeof html !== 'string' || html.length < 1000) {
      console.log('Insufficient HTML content received');
      return res.status(400).json({
        error: 'INSUFFICIENT_CONTENT',
        message: 'Could not retrieve sufficient content from the URL',
        contentSample: typeof html === 'string' ? html.substring(0, 200) : 'Not a string'
      });
    }

    // Log HTML length for debugging
    console.log(`HTML content length: ${html.length} characters`);

    // 2. Extract key information from HTML
    console.log('Extracting data from HTML...');
    const extractedData = extractJobDataFromHTML(jobPageResponse.data);

    // 3. Create a simplified prompt with extracted data instead of full HTML
    console.log('Creating prompt for LLM...');
    const prompt = `
      Analyze this job posting information and return ONLY a JSON object with the following structure:
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

      Important: Your response must contain ONLY valid JSON that can be parsed with JSON.parse().
      Do not include any explanatory text, code blocks, or formatting - just the raw JSON object.

      EXTRACTION INSTRUCTIONS:
      1. For "skills": Look for technical skills in sections like "COMPÉTENCES TECHNIQUES REQUISES" and extract ALL languages, frameworks, tools and technologies (e.g., PHP, PERL, Python, VueJS, API Platform, FastApi, Quasar, Kafka, Airflow, PostgreSQL, Linux, etc.)

      2. For "responsibilities": Look for job duties in sections like "Les missions du poste" or phrases starting with "Vos missions :" and extract each responsibility as a separate item

      3. For "benefits": Look in sections like "Infos complémentaires" and extract each benefit/perk as a separate item (e.g., "Carte restaurant", "Mutuelle", "Télétravail", etc.)

      DO NOT LEAVE THESE FIELDS EMPTY if the information is available in the text.
      Carefully analyze the entire content before returning your response.

      Job information:
      Title: ${extractedData.rawTitle}

      Extracted metadata: ${JSON.stringify(extractedData.extractedData)}

      Mission section: ${extractedData.missionContent || "Not available"}

      Profile section: ${extractedData.profileContent || "Not available"}

      Benefits section: ${extractedData.benefitsContent || "Not available"}

      Content sample: ${extractedData.bodyTextSample || "No content available"}
    `;

    // 4. Based on the models you have installed - try each one in order
    const availableModels = ['mistral:latest', 'llama2:latest'];

    let modelToUse;
    let ollamaResponse;
    let success = false;
    let lastError = null;

    for (const model of availableModels) {
      try {
        console.log(`Trying model: ${model}`);
        modelToUse = model;

        // Set a timeout for the Ollama request (2 minutes max)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 120000);

        ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
          model: model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.1,  // Lower temperature for more deterministic output
            num_predict: 2048  // Limit response length
          }
        }, {
          timeout: 120000, // 120 second timeout for Ollama
          signal: controller.signal
        });

        clearTimeout(timeout);

        // Check if response was successful and contains data
        if (ollamaResponse?.data?.response) {
          success = true;
          console.log(`Successfully used model: ${model}`);
          break;
        } else {
          throw new Error("Empty response from Ollama");
        }
      } catch (error) {
        lastError = error;
        console.log(`Error with model ${model}:`, error.message);
      }
    }

    if (!success) {
      return res.status(500).json({
        message: 'Failed to get a response from any Ollama model',
        error: 'MODEL_RESPONSE_FAILED',
        details: lastError?.message,
        availableModels
      });
    }

    // 5. Process the response from Ollama
    console.log('Processing Ollama response...');
    const ollamaOutput = ollamaResponse.data.response;

    console.log('Ollama raw output:', ollamaOutput.substring(0, 200) + '...');

    // Look for JSON in the response
    let jobData;

    try {
      // Try to extract JSON from the response
      let jsonString = ollamaOutput.trim();

      // Remove any markdown code blocks if present
      if (jsonString.includes("```")) {
        jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      }

      // Try to parse the JSON
      jobData = JSON.parse(jsonString);

      // Add metadata about the processing
      jobData.model = modelToUse;
      jobData.url = url;
      jobData.processedAt = new Date().toISOString();

      // Save the result to a local file
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `job-analysis-${timestamp}.json`;
      fs.writeFileSync(`./job-results/${filename}`, JSON.stringify(jobData, null, 2));
      console.log(`Saved analysis to ./job-results/${filename}`);

      console.log('Successfully analyzed job posting');
      return res.json(jobData);
    } catch (jsonError) {
      console.error('Error parsing JSON from LLM response:', jsonError);

      // Send error information in response
      return res.status(500).json({
        message: 'Error parsing LLM response',
        error: jsonError.message,
        rawOutput: ollamaOutput.substring(0, 200) + '...'
      });
    }
  } catch (error) {
    console.error('Error analyzing job posting:', error);
    return res.status(500).json({
      message: 'Error analyzing job posting',
      error: error.message,
    });
  }
});

// Endpoint to check if Ollama is available and which models are installed
app.get('/api/check-ollama', async (req, res) => {
  try {
    const modelsList = [];
    const availableModels = ['mistral:latest', 'llama2:latest'];

    for (const model of availableModels) {
      try {
        // Simple ping to check if model exists
        await axios.post('http://localhost:11434/api/generate', {
          model: model,
          prompt: 'hello',
          stream: false
        }, { timeout: 5000 });

        modelsList.push({ name: model, available: true });
      } catch (error) {
        modelsList.push({ name: model, available: false, error: error.message });
      }
    }

    return res.json({
      ollamaRunning: true,
      models: modelsList
    });
  } catch (error) {
    return res.json({
      ollamaRunning: false,
      error: error.message
    });
  }
});

// Endpoint pour obtenir un exemple d'analyse d'offre d'emploi
app.get('/api/job-example', (req, res) => {
  try {
    // Charger le fichier JSON d'exemple
    const exampleJobData = JSON.parse(fs.readFileSync('./job-results/job-exemple.json', 'utf8'));
    return res.json(exampleJobData);
  } catch (error) {
    console.error('Error reading example job data:', error);
    return res.status(500).json({
      message: 'Error reading example job data',
      error: error.message
    });
  }
});

// Endpoint pour simuler l'analyse d'une offre sans faire de scraping
app.post('/api/analyze-job-mock', (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // Charger le fichier JSON d'exemple
    const exampleJobData = JSON.parse(fs.readFileSync('./job-results/job-exemple.json', 'utf8'));

    // Modifier les métadonnées
    exampleJobData.url = url;
    exampleJobData.processedAt = new Date().toISOString();

    // Sauvegarder une copie pour référence
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `job-analysis-mock-${timestamp}.json`;
    fs.writeFileSync(`./job-results/${filename}`, JSON.stringify(exampleJobData, null, 2));

    return res.json(exampleJobData);
  } catch (error) {
    console.error('Error in mock analysis:', error);
    return res.status(500).json({
      message: 'Error in mock analysis',
      error: error.message
    });
  }
});

// Endpoint d'analyse avec Puppeteer (navigateur headless)
app.post('/api/analyze-job-puppeteer', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    console.log(`Processing job URL with Puppeteer: ${url}`);

    // Lancer le navigateur
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();

      // Configurer le navigateur pour ressembler à un utilisateur normal
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1280, height: 800 });

      // Naviguer vers l'URL
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Attendre que le contenu soit chargé
      await page.waitForSelector('body', { timeout: 10000 });

      // Extraire le contenu HTML
      const html = await page.content();

      // Extraire du texte des sections importantes
      const extractTextFromSection = async (sectionSelector) => {
        try {
          const elements = await page.$$(sectionSelector);
          const texts = [];
          for (const element of elements) {
            const text = await page.evaluate(el => el.textContent.trim(), element);
            texts.push(text);
          }
          return texts.join("\n");
        } catch (e) {
          return "";
        }
      };

      // Extraire les données spécifiques à l'offre d'emploi
      const jobData = {
        title: await page.title(),
        url: url,
        missionContent: await extractTextFromSection('h2:contains("Les missions du poste"), h3:contains("Les missions du poste")'),
        profileContent: await extractTextFromSection('h2:contains("Le profil recherché"), h3:contains("Le profil recherché")'),
        benefitsContent: await extractTextFromSection('h2:contains("Infos complémentaires"), h3:contains("Infos complémentaires")'),
        rawHTML: html.substring(0, 5000) // Échantillon pour débogage
      };

      // Extraire le texte complet de la page pour analyse par Ollama
      const bodyText = await page.evaluate(() => document.body.innerText);
      jobData.bodyTextSample = bodyText.substring(0, 3000);

      // Créer le prompt pour Ollama
      const prompt = `
        Analyze this job posting information and return ONLY a JSON object with the following structure:
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

        Important: Your response must contain ONLY valid JSON that can be parsed with JSON.parse().
        Do not include any explanatory text, code blocks, or formatting - just the raw JSON object.

        EXTRACTION INSTRUCTIONS:
        1. For "skills": Look for technical skills and extract ALL languages, frameworks, tools and technologies (e.g., PHP, PERL, Python, VueJS, API Platform, FastApi, Quasar, Kafka, Airflow, PostgreSQL, Linux, etc.)

        2. For "responsibilities": Look for job duties and extract each responsibility as a separate item

        3. For "benefits": Look for company benefits and extract each benefit/perk as a separate item (e.g., "Carte restaurant", "Mutuelle", "Télétravail", etc.)

        DO NOT LEAVE THESE FIELDS EMPTY if the information is available in the text.
        Carefully analyze the entire content before returning your response.

        Job information:
        Title: ${jobData.title}

        Mission section: ${jobData.missionContent || "Not available"}

        Profile section: ${jobData.profileContent || "Not available"}

        Benefits section: ${jobData.benefitsContent || "Not available"}

        Content sample: ${jobData.bodyTextSample || "No content available"}
      `;

      // Traitement avec Ollama comme dans l'endpoint existant
      const availableModels = ['mistral:latest', 'llama2:latest'];

      let modelToUse;
      let ollamaResponse;
      let success = false;
      let lastError = null;

      for (const model of availableModels) {
        try {
          console.log(`Trying model: ${model}`);
          modelToUse = model;

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 120000);

          ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
            model: model,
            prompt: prompt,
            stream: false,
            options: {
              temperature: 0.1,
              num_predict: 2048
            }
          }, {
            timeout: 120000,
            signal: controller.signal
          });

          clearTimeout(timeout);

          if (ollamaResponse?.data?.response) {
            success = true;
            console.log(`Successfully used model: ${model}`);
            break;
          } else {
            throw new Error("Empty response from Ollama");
          }
        } catch (error) {
          lastError = error;
          console.log(`Error with model ${model}:`, error.message);
        }
      }

      if (!success) {
        await browser.close();
        return res.status(500).json({
          message: 'Failed to get a response from any Ollama model',
          error: 'MODEL_RESPONSE_FAILED',
          details: lastError?.message,
          availableModels
        });
      }

      // Traitement de la réponse
      console.log('Processing Ollama response...');
      const ollamaOutput = ollamaResponse.data.response;

      // Extraction JSON
      try {
        let jsonString = ollamaOutput.trim();

        if (jsonString.includes("```")) {
          jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        }

        const resultData = JSON.parse(jsonString);

        // Ajouter métadonnées
        resultData.model = modelToUse;
        resultData.url = url;
        resultData.processedAt = new Date().toISOString();

        // Sauvegarder le résultat
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const filename = `job-analysis-puppeteer-${timestamp}.json`;
        fs.writeFileSync(`./job-results/${filename}`, JSON.stringify(resultData, null, 2));
        console.log(`Saved analysis to ./job-results/${filename}`);

        // Fermer le navigateur et retourner le résultat
        await browser.close();
        return res.json(resultData);
      } catch (jsonError) {
        await browser.close();
        console.error('Error parsing JSON from LLM response:', jsonError);
        return res.status(500).json({
          message: 'Error parsing LLM response',
          error: jsonError.message,
          rawOutput: ollamaOutput.substring(0, 200) + '...'
        });
      }
    } catch (puppeteerError) {
      await browser.close();
      throw puppeteerError;
    }
  } catch (error) {
    console.error('Error analyzing job posting with Puppeteer:', error);
    return res.status(500).json({
      message: 'Error analyzing job posting with Puppeteer',
      error: error.message,
    });
  }
});

// Ensure job-results directory exists
app.listen(PORT, () => {
  // Create job-results directory if it doesn't exist
  if (!fs.existsSync('./job-results')) {
    fs.mkdirSync('./job-results', { recursive: true });
    console.log('Created job-results directory');
  }
  console.log(`Server running on port ${PORT}`);
});

export default app;

// Helper functions for extracting fields when JSON parsing fails
function extractField(text, fieldName) {
  const regex = new RegExp(`["']${fieldName}["']\\s*:\\s*["']([^"']+)["']`);
  const match = text.match(regex);
  return match ? match[1] : null;
}

function extractArrayField(text, fieldName) {
  const regex = new RegExp(`["']${fieldName}["']\\s*:\\s*\\[(.*?)\\]`);
  const match = text.match(regex);
  if (!match) return [];

  // Extract items from array
  const arrayContent = match[1];
  const items = arrayContent.split(',')
    .map(item => item.trim().replace(/^["']|["']$/g, ''))
    .filter(item => item.length > 0);

  return items;
}
