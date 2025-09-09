import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = 3001;

// Enable CORS for your Vite app
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());

// Gemini API proxy endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    console.log('🤖 Gemini API request received');
    
    // Get access token from gcloud (tries multiple common paths)
    let accessToken;
    const gcloudPaths = [
      'gcloud', // Try system PATH first
      '/Users/ersibesi/google-cloud-sdk/bin/gcloud',
      '/usr/local/bin/gcloud',
      '~/google-cloud-sdk/bin/gcloud'
    ];
    
    for (const gcloudPath of gcloudPaths) {
      try {
        const { stdout: token } = await execAsync(`${gcloudPath} auth application-default print-access-token`);
        accessToken = token.trim();
        console.log(`✅ Found gcloud at: ${gcloudPath}`);
        break;
      } catch (e) {
        // Try next path
      }
    }
    
    if (!accessToken) {
      throw new Error('Could not find gcloud CLI or get access token. Please ensure gcloud is installed and authenticated.');
    }
    
    console.log('🔑 Got access token');
    
    // Make request to Gemini 2.5 Pro (latest model)
    const response = await fetch('https://europe-west1-aiplatform.googleapis.com/v1/projects/tum-cdtm25mun-8787/locations/europe-west1/publishers/google/models/gemini-2.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    console.log('📡 Made request to Gemini, status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Gemini API failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Got response from Gemini');
    
    res.json(data);
    
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    res.status(500).json({ 
      error: 'Failed to call Gemini API',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Gemini proxy server running on http://localhost:${PORT}`);
  console.log(`🔗 Handling requests from http://localhost:8080`);
});
