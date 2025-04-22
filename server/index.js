import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import axios from 'axios';
import bodyParser from 'body-parser';
import { JSDOM } from 'jsdom'; // Add this to your dependencies with: npm install jsdom

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

    // Look for job details - this is generic and might need adjustments
    // based on the specific job board sites you're targeting
    const jobData = {
      rawTitle: title,
      extractedData: {}
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

    // Extract visible text
    const bodyText = document.body ? document.body.textContent : '';
    if (bodyText) {
      // Get first 2000 characters for summary
      jobData.bodyTextSample = bodyText.replace(/\s+/g, ' ').trim().substring(0, 2000);
    }

    return jobData;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return { error: 'Failed to parse HTML' };
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 second timeout
    });

    // 2. Extract key information from HTML
    console.log('Extracting data from HTML...');
    const extractedData = extractJobDataFromHTML(jobPageResponse.data);

    // 3. Create a simplified prompt with extracted data instead of full HTML
    console.log('Creating prompt for LLM...');
    const prompt = `
      Analyze this job posting and extract key information in a structured JSON format.

      IMPORTANT: Return valid, well-formed JSON only.
      Follow these guidelines strictly:
      1. Use double quotes for all keys and string values
      2. Ensure all property names are properly quoted
      3. Do not include trailing commas in arrays or objects
      4. Make sure arrays are properly formatted with square brackets
      5. Ensure the JSON is complete and can be parsed by JSON.parse()
      6. DO NOT include any explanatory text, only the JSON output

      The expected structure is:
      {
        "title": "job title",
        "company": "company name",
        "location": "job location",
        "contractType": "full-time/part-time/freelance/etc",
        "skills": ["skill1", "skill2", ...],
        "salary": "salary if mentioned",
        "experience": "experience requirements",
        "education": "education requirements",
        "summary": "brief summary of the job",
        "responsibilities": ["responsibility1", "responsibility2", ...],
        "benefits": ["benefit1", "benefit2", ...]
      }

      Here is the job posting information:
      Job Title: ${extractedData.rawTitle}

      Extracted metadata: ${JSON.stringify(extractedData.extractedData)}

      Job posting content sample:
      ${extractedData.bodyTextSample || "No content available"}
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
      // Try different patterns to extract JSON
      const jsonRegexPatterns = [
        /```json\n([\s\S]*?)\n```/, // JSON code block with language
        /```\n([\s\S]*?)\n```/,     // Plain code block
        /{[\s\S]*?}/                // Any JSON object
      ];

      let jsonString = null;

      for (const pattern of jsonRegexPatterns) {
        const match = ollamaOutput.match(pattern);
        if (match) {
          jsonString = match[1] || match[0];
          break;
        }
      }

      if (jsonString) {
        // Clean up the JSON string if needed
        jsonString = jsonString.trim();

        // Enhanced JSON cleaning and repair
        // 1. Make sure it starts with { and ends with }
        if (!jsonString.startsWith('{')) jsonString = '{' + jsonString;
        if (!jsonString.endsWith('}')) jsonString = jsonString + '}';

        // 2. Fix common JSON syntax errors
        // Fix missing quotes around property names
        jsonString = jsonString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

        // Fix single quotes to double quotes
        jsonString = jsonString.replace(/'/g, '"');

        // Fix trailing commas in arrays and objects
        jsonString = jsonString.replace(/,\s*([}\]])/g, '$1');

        // Fix missing commas between properties
        jsonString = jsonString.replace(/"\s*}\s*"/g, '","');
        jsonString = jsonString.replace(/"\s*{\s*"/g, '","{');

        // 3. Try to parse with JSON.parse but add fallback for JSON5 if needed
        try {
          jobData = JSON.parse(jsonString);
        } catch (innerError) {
          console.log('Standard JSON parsing failed, trying more lenient approach');

          // Fallback to more manual approach
          // Extract key fields directly using regex
          jobData = {
            error: "Could not parse JSON correctly, extracted fields manually",
            title: extractField(jsonString, 'title') || extractedData.rawTitle,
            company: extractField(jsonString, 'company'),
            location: extractField(jsonString, 'location'),
            contractType: extractField(jsonString, 'contractType'),
            skills: extractArrayField(jsonString, 'skills'),
            salary: extractField(jsonString, 'salary'),
            summary: extractField(jsonString, 'summary'),
            model: modelToUse
          };
        }
      } else {
        throw new Error("Could not find JSON in the response");
      }
    } catch (jsonError) {
      console.error('Error parsing JSON from LLM response:', jsonError);

      // Fallback: Try to extract structured data directly
      jobData = {
        error: "Could not parse JSON response",
        title: extractedData.rawTitle,
        model: modelToUse
      };

      // Try to extract from dataLayer if it exists
      if (extractedData.jsonLD && extractedData.jsonLD.title) {
        jobData.title = extractedData.jsonLD.title;
        jobData.company = extractedData.jsonLD.hiringOrganization?.name;
        jobData.location = extractedData.jsonLD.jobLocation?.address?.addressLocality;
      }
    }

    // Add metadata about the processing
    jobData.model = modelToUse;
    jobData.url = url;
    jobData.processedAt = new Date().toISOString();

    console.log('Successfully analyzed job posting');
    return res.json(jobData);
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

// Démarrer le serveur
app.listen(PORT, () => {
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