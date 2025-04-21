import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

def scrape_job_posting(url):
    """
    Scrape job posting from the given URL.

    Args:
        url (str): The URL of the job posting

    Returns:
        dict: Raw data from the job posting
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract the main content - this is a simplified version
        # For a real implementation, you'll need to customize this based on the job boards
        title_element = soup.find(['h1', 'h2'], class_=['job-title', 'title'])
        title = title_element.text.strip() if title_element else "Unknown Title"

        company_element = soup.find(['div', 'span', 'a'], class_=['company', 'employer'])
        company = company_element.text.strip() if company_element else None

        description_element = soup.find(['div', 'section'], class_=['description', 'job-description'])
        description = description_element.text.strip() if description_element else None

        # Return raw data
        raw_data = {
            'html_content': response.text,
            'title': title,
            'company': company,
            'description': description,
        }

        return raw_data

    except Exception as e:
        logger.error(f"Failed to scrape job posting from {url}: {str(e)}")
        raise Exception(f"Failed to scrape job posting: {str(e)}")
