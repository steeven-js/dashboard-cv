#!/usr/bin/env python
import requests
import json
import sys
import argparse
import os

# Default to the provided VPS URL and token
OLLAMA_HOST = os.environ.get('OLLAMA_HOST', 'http://69.62.71.69:8080')
OLLAMA_PORT = os.environ.get('OLLAMA_PORT', '')  # No port needed as it's included in the URL
OLLAMA_TOKEN = os.environ.get('OLLAMA_TOKEN', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZkNWFiZjUzLWUyYmQtNGE5YS1hMmI3LWJlMTljM2I4ZWYzYyJ9._2FyiQ0fh8zR2jKuDrG4yGbgMJkaNtRU2m_dEGa1WCc')

# If no port is specified, don't add the colon
if OLLAMA_PORT:
    OLLAMA_BASE_URL = f"{OLLAMA_HOST}:{OLLAMA_PORT}"
else:
    OLLAMA_BASE_URL = OLLAMA_HOST

def verify_ollama_endpoints():
    """Try different Ollama API endpoints to find the correct one"""
    possible_endpoints = [
        "/api/generate",
        "/api/chat",
        "/v1/chat/completions",
        "/v1/completions",
        "/"
    ]

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {OLLAMA_TOKEN}'
    }

    for endpoint in possible_endpoints:
        try:
            url = f"{OLLAMA_BASE_URL}{endpoint}"
            print(f"Testing endpoint: {url}")

            # Just try a HEAD request to check if endpoint exists
            response = requests.head(url, headers=headers, timeout=5)
            print(f"Response: {response.status_code}")

            if response.status_code != 405 and response.status_code != 404:
                print(f"✅ Found potential working endpoint: {endpoint}")
                return url
        except Exception as e:
            print(f"Error testing {endpoint}: {str(e)}")

    print("Could not find a working endpoint, defaulting to /api/chat")
    return f"{OLLAMA_BASE_URL}/api/chat"

# Try to find the correct endpoint
OLLAMA_URL = verify_ollama_endpoints()

def test_ollama_connection(demo_mode=False, return_response=False):
    """
    Test connection to Ollama API

    Args:
        demo_mode (bool): Run in demo mode with simulated responses
        return_response (bool): Return the response text along with success status

    Returns:
        If return_response is False: bool
        If return_response is True: tuple(bool, str)
    """
    response_text = None

    if demo_mode:
        print("🔄 Running in DEMO mode...")
        print("✅ Successfully connected to Ollama! (SIMULATED)")
        response_text = "Hello! Yes, I'm working correctly. This is a simulated response from Ollama for demonstration purposes."
        print("\nResponse from Ollama (SIMULATED):")
        print(response_text)

        if return_response:
            return True, response_text
        return True

    try:
        # Use the VPS URL for Ollama API
        print("Attempting to connect to Ollama at:", OLLAMA_URL)

        # Try different payload structures based on the endpoint
        if "/api/generate" in OLLAMA_URL:
            payload = {
                "model": "llama3",
                "prompt": "Hello, are you working?",
                "stream": False
            }
        elif "/api/chat" in OLLAMA_URL:
            payload = {
                "model": "llama3",
                "messages": [
                    {"role": "user", "content": "Hello, are you working?"}
                ],
                "stream": False
            }
        elif "/v1/chat/completions" in OLLAMA_URL:
            payload = {
                "model": "llama3",
                "messages": [
                    {"role": "user", "content": "Hello, are you working?"}
                ]
            }
        elif "/v1/completions" in OLLAMA_URL:
            payload = {
                "model": "llama3",
                "prompt": "Hello, are you working?",
                "max_tokens": 100
            }
        else:
            # Generic fallback
            payload = {
                "model": "llama3",
                "prompt": "Hello, are you working?",
            }

        # Add headers with authorization token
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {OLLAMA_TOKEN}'
        }

        # Add timeout for the request
        response = requests.post(OLLAMA_URL, json=payload, headers=headers, timeout=10)

        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.text[:100]}...")  # Print first 100 chars

        if response.status_code == 200:
            print("✅ Successfully connected to Ollama!")
            try:
                data = response.json()
                # Handle different response formats
                if "response" in data:
                    response_text = data.get("response")
                elif "choices" in data and len(data["choices"]) > 0:
                    if "message" in data["choices"][0]:
                        response_text = data["choices"][0]["message"]["content"]
                    elif "text" in data["choices"][0]:
                        response_text = data["choices"][0]["text"]
                else:
                    response_text = str(data)  # Fallback to showing the whole response

                print("\nResponse from Ollama:")
                print(response_text)
            except json.JSONDecodeError:
                response_text = response.text
                print("\nResponse from Ollama (non-JSON):")
                print(response_text)

            if return_response:
                return True, response_text
            return True
        else:
            print(f"❌ Failed to connect to Ollama. Status code: {response.status_code}")
            print(f"Response: {response.text}")

            if return_response:
                return False, None
            return False

    except requests.exceptions.ConnectionError as e:
        print("❌ Connection error: Could not connect to Ollama server.")
        print(f"   Error details: {str(e)}")
        print("   Make sure Ollama is running at the specified URL.")

        if return_response:
            return False, None
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout error: The request to Ollama took too long to complete.")
        print("   This could be due to network issues or high server load.")

        if return_response:
            return False, None
        return False
    except Exception as e:
        print(f"❌ Error while testing Ollama connection: {str(e)}")

        if return_response:
            return False, None
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test Ollama connection')
    parser.add_argument('--demo', action='store_true', help='Run in demo mode with simulated responses')
    parser.add_argument('--host', help='Custom Ollama host (e.g., http://69.62.71.69:8080)')
    parser.add_argument('--port', help='Custom Ollama port')
    parser.add_argument('--token', help='Custom Ollama authorization token')
    args = parser.parse_args()

    # Override defaults if command line arguments are provided
    if args.host:
        OLLAMA_HOST = args.host
    if args.port:
        OLLAMA_PORT = args.port
    if args.token:
        OLLAMA_TOKEN = args.token

    # Rebuild the URL with any updated values
    if OLLAMA_PORT:
        OLLAMA_BASE_URL = f"{OLLAMA_HOST}:{OLLAMA_PORT}"
    else:
        OLLAMA_BASE_URL = OLLAMA_HOST

    # Re-verify endpoints with new settings
    OLLAMA_URL = verify_ollama_endpoints()

    print("Testing communication with Ollama...")
    success = test_ollama_connection(demo_mode=args.demo)

    if success:
        print("\nPython is successfully communicating with Ollama! 🎉")
        sys.exit(0)
    else:
        print("\nFailed to communicate with Ollama. Check if Ollama is running properly.")
        sys.exit(1)
