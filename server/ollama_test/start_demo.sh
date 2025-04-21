#!/bin/bash

# Make the script executable
chmod +x $(dirname "$0")/start_demo.sh

echo "======================================"
echo "Ollama-Python Integration Demo"
echo "======================================"
echo

# Check if Python 3 is available
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "Error: Python not found. Please install Python and try again."
    exit 1
fi

# Set Ollama environment variables
export OLLAMA_HOST="http://69.62.71.69:8080"
export OLLAMA_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZkNWFiZjUzLWUyYmQtNGE5YS1hMmI3LWJlMTljM2I4ZWYzYyJ9._2FyiQ0fh8zR2jKuDrG4yGbgMJkaNtRU2m_dEGa1WCc"

# Install required dependencies
echo "1. Installing required dependencies..."
$PYTHON_CMD -m pip install -r $(dirname "$0")/requirements.txt
echo "✅ Dependencies installed"
echo

# Start the Flask API server
echo "2. Starting Flask API server..."
echo "   The API will be available at http://localhost:8000/api/test-ollama"
echo "   Press Ctrl+C to stop the server when you're done."
echo
echo "3. You can now test the integration by:"
echo "   - Importing the OllamaTest component in your React app"
echo "   - Visiting http://localhost:8000/api/test-ollama?demo=true in your browser"
echo "   - Running $PYTHON_CMD test_ollama.py --demo from another terminal"
echo
echo "Starting server on port 8000 with Ollama VPS connection..."
$PYTHON_CMD $(dirname "$0")/api.py
