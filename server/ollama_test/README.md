# Ollama-Python Test

This directory contains a simple test for ensuring that Python can communicate with the Ollama API.

## Setup

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Make sure Ollama is running on your system or VPS
   - Default Ollama URL is `http://localhost:11434` for local testing
   - For VPS, use `https://your-vps-hostname.hostinger.com:11434`
   - Ensure you have at least one model installed (the script defaults to using "llama3")

## Configuration

You can configure the Ollama server URL in several ways:

1. Environment variables:
   ```
   export OLLAMA_HOST=https://your-vps-hostname.hostinger.com
   export OLLAMA_PORT=11434
   ```

2. Command line arguments:
   ```
   python test_ollama.py --host https://your-vps-hostname.hostinger.com --port 11434
   ```

3. For local development, you can use the default localhost URLs.

## Testing Directly with Python

To test Ollama communication directly from the command line:

```bash
python test_ollama.py
```

This will attempt to connect to Ollama and send a simple prompt.

### Demo Mode

If you don't have Ollama running but want to test the integration, use demo mode:

```bash
python test_ollama.py --demo
```

Demo mode simulates a successful response from Ollama without requiring the actual service to be running.

## Running the API Server

To start the API server which can be accessed from React:

```bash
python api.py
```

The server will run on http://localhost:5000 with the `/api/test-ollama` endpoint available for testing.

### API Demo Mode

You can use demo mode with the API by adding the `demo=true` query parameter:

```
http://localhost:5000/api/test-ollama?demo=true
```

## VPS Deployment

To deploy the API server on your VPS:

1. Upload the `server/ollama_test` directory to your VPS

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up a reverse proxy (Nginx, Apache) to route requests to the Flask app:

   Example Nginx configuration:
   ```
   server {
       listen 80;
       server_name your-vps-hostname.hostinger.com;

       location /api/test-ollama {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. Run the API server:
   ```
   nohup python api.py &
   ```

5. (Optional) Set up a systemd service to keep the API server running:
   ```
   # /etc/systemd/system/ollama-test.service
   [Unit]
   Description=Ollama Test API
   After=network.target

   [Service]
   User=yourusername
   WorkingDirectory=/path/to/server/ollama_test
   ExecStart=/usr/bin/python3 api.py
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

## React Integration

Import and add the `OllamaTest` component to your React application to test the connection through the UI.

```jsx
import OllamaTest from './components/OllamaTest';

// In your component:
<OllamaTest />
```

The React component includes a checkbox to enable demo mode, which simulates a successful connection without requiring an actual Ollama server.

### Environment Variables for Vite

Since you're using Vite, make sure to update the `.env.local` file in your React project root with the correct VPS URL and use the `VITE_` prefix:

```
VITE_PYTHON_API_URL=https://your-vps-hostname.hostinger.com:5000
VITE_OLLAMA_URL=https://your-vps-hostname.hostinger.com:11434
```

In your components, access these variables using `import.meta.env.VITE_VARIABLE_NAME`.

Make sure the Flask API server is running for the React component to work properly.
