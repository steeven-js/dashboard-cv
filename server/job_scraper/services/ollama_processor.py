import os
import logging
import requests
import json

logger = logging.getLogger(__name__)

def process_job_data(raw_data):
    """
    Process job data using Ollama API.

    Args:
        raw_data (dict): Raw job data scraped from the website

    Returns:
        dict: Structured job data
    """
    try:
        ollama_url = os.environ.get('OLLAMA_API_URL', 'http://localhost:11434/api/generate')

        # Extract text from raw data for processing
        # Use just the description if available, otherwise use HTML content
        text_to_process = raw_data.get('description') or raw_data.get('html_content')

        if not text_to_process:
            raise ValueError("No text content to process")

        # Create prompt for Ollama
        prompt = """
        Extract the following information from this job posting:
        - Job title
        - Company name
        - Location
        - Skills required (as a list)
        - Salary (if available)
        - Employment type (full-time, part-time, contract, etc.)
        - Date posted (if available)

        Format the response as a JSON object with these fields:
        title, company, location, skills, salary, employment_type, date_posted.

        Here's the job posting:

        {text}
        """.format(text=text_to_process[:4000])  # Limit text size to avoid token limits

        # Call Ollama API
        payload = {
            "model": os.environ.get('OLLAMA_MODEL', 'llama3'),
            "prompt": prompt,
            "stream": False
        }

        # Mock response for development without Ollama
        if os.environ.get('MOCK_OLLAMA', 'false').lower() == 'true':
            logger.info("Using mock Ollama response")
            mock_data = {
                "title": raw_data.get('title', 'Software Developer'),
                "company": raw_data.get('company', 'Unknown Company'),
                "location": "Remote",
                "skills": ["Python", "Django", "React"],
                "salary": "$80,000 - $120,000",
                "employment_type": "Full-time",
                "date_posted": None
            }
            return mock_data

        # Real Ollama API call
        response = requests.post(ollama_url, json=payload)
        response.raise_for_status()

        result = response.json()
        text_response = result.get('response', '')

        # Try to parse JSON from the response
        # Find JSON in the response (it might be surrounded by markdown or text)
        json_str = extract_json_from_text(text_response)
        structured_data = json.loads(json_str)

        # Ensure required fields
        structured_data['title'] = structured_data.get('title') or raw_data.get('title', 'Unknown Title')
        structured_data['company'] = structured_data.get('company') or raw_data.get('company', 'Unknown Company')

        return structured_data

    except Exception as e:
        logger.error(f"Failed to process job data with Ollama: {str(e)}")
        # Fall back to raw data with minimal structure
        return {
            'title': raw_data.get('title', 'Unknown Title'),
            'company': raw_data.get('company', 'Unknown Company'),
            'description': raw_data.get('description', '')[:1000],  # Limit description size
            'skills': [],
            'location': None,
            'salary': None,
            'employment_type': None,
            'date_posted': None
        }

def extract_json_from_text(text):
    """
    Extract JSON from text that might contain other content.
    """
    try:
        # Find the first { and the last }
        start = text.find('{')
        end = text.rfind('}')

        if start == -1 or end == -1 or end <= start:
            raise ValueError("Could not find valid JSON in the response")

        json_str = text[start:end+1]
        return json_str

    except Exception as e:
        logger.error(f"Failed to extract JSON from text: {str(e)}")
        # Return a minimal JSON structure as fallback
        return '{"title": null, "company": null, "location": null, "skills": [], "salary": null, "employment_type": null, "date_posted": null}'
