#!/usr/bin/env python
from flask import Flask, jsonify, request
from flask_cors import CORS
from test_ollama import test_ollama_connection
import traceback

app = Flask(__name__)
# Enable CORS for all routes, allowing any origin
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/api/test-ollama', methods=['GET'])
def check_ollama():
    """Endpoint to test connection to Ollama"""
    # Check if demo mode is requested
    demo_mode = request.args.get('demo', 'false').lower() == 'true'

    python_message = "Hello from Python! I'm processing your request to Ollama."

    try:
        if demo_mode:
            # In demo mode, always return success
            return jsonify({
                "status": "success",
                "python_message": python_message,
                "ollama_message": "This is a simulated response from Ollama in demo mode. The demo is working correctly!",
                "message": "Successfully connected to Ollama! (DEMO MODE)"
            }), 200

        # Try to connect to Ollama
        success, ollama_response = test_ollama_connection(demo_mode=False, return_response=True)

        if success:
            return jsonify({
                "status": "success",
                "python_message": python_message,
                "ollama_message": ollama_response,
                "message": "Successfully connected to Ollama!"
            }), 200
        else:
            # Return a valid response but with error status
            return jsonify({
                "status": "error",
                "python_message": python_message,
                "ollama_message": None,
                "message": "Failed to connect to Ollama. The server might be unreachable or the API endpoints might be different."
            }), 200  # Still return 200 to avoid 500 error
    except Exception as e:
        # Log the exception but still return a valid response
        error_trace = traceback.format_exc()
        print(f"Error in check_ollama: {str(e)}\n{error_trace}")

        return jsonify({
            "status": "error",
            "python_message": f"{python_message} However, I encountered an error: {str(e)}",
            "ollama_message": None,
            "message": f"An error occurred: {str(e)}. Try using demo mode."
        }), 200  # Return 200 instead of 500 to avoid client errors

if __name__ == '__main__':
    print("Starting Ollama Test API server...")
    print("TIP: Add '?demo=true' to the URL to run in demo mode without actual Ollama connection")
    # Use port 8000 as specified
    print("Server will run on http://localhost:8000/api/test-ollama")
    app.run(host='0.0.0.0', port=8000, debug=True)
