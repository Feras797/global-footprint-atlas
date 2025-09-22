import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const app = express();
const PORT = 3001;

// Enable CORS for your Vite app
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());

// --- Local analysis persistence (JSON on disk) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESULTS_DIR = path.join(__dirname, 'analysis-results');

function ensureResultsDir () {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
}

function getLatestQuarter () {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const q = Math.ceil(month / 3);
  return `${year}-Q${q}`;
}

function companyDir (companyId) {
  return path.join(RESULTS_DIR, companyId);
}

function parseQuarterFromFilename (file) {
  return path.basename(file, '.json');
}

app.get('/api/analysis/:companyId/status', async (req, res) => {
  try {
    ensureResultsDir();
    const { companyId } = req.params;
    const dir = companyDir(companyId);
    const currentQuarter = getLatestQuarter();
    if (!fs.existsSync(dir)) {
      return res.json({ status: 'not_analyzed', currentQuarter });
    }
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
      return res.json({ status: 'not_analyzed', currentQuarter });
    }
    // pick latest by filename sorting (YYYY-Qn lexicographically OK if years differ)
    const latestFile = files.sort().at(-1);
    const storedQuarter = parseQuarterFromFilename(latestFile);
    const status = storedQuarter === currentQuarter ? 'analyzed' : 'new_quarter';
    return res.json({ status, currentQuarter, storedQuarter });
  } catch (e) {
    console.error('status endpoint error', e);
    res.status(500).json({ error: 'status_failed', message: e.message });
  }
});

app.get('/api/analysis/:companyId/latest', async (req, res) => {
  try {
    ensureResultsDir();
    const { companyId } = req.params;
    const dir = companyDir(companyId);
    if (!fs.existsSync(dir)) return res.status(404).json({ error: 'not_found' });
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    if (files.length === 0) return res.status(404).json({ error: 'not_found' });
    const latestFile = files.sort().at(-1);
    const json = fs.readFileSync(path.join(dir, latestFile), 'utf-8');
    res.json(JSON.parse(json));
  } catch (e) {
    console.error('latest endpoint error', e);
    res.status(500).json({ error: 'latest_failed', message: e.message });
  }
});

app.get('/api/analysis/:companyId/:quarter', async (req, res) => {
  try {
    ensureResultsDir();
    const { companyId, quarter } = req.params;
    const file = path.join(companyDir(companyId), `${quarter}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'not_found' });
    const json = fs.readFileSync(file, 'utf-8');
    res.json(JSON.parse(json));
  } catch (e) {
    console.error('read quarter error', e);
    res.status(500).json({ error: 'read_failed', message: e.message });
  }
});

app.post('/api/analysis/:companyId', async (req, res) => {
  try {
    ensureResultsDir();
    const { companyId } = req.params;
    const quarter = getLatestQuarter();
    const payload = req.body || {};
    const record = {
      companyId,
      quarter,
      timestamp: new Date().toISOString(),
      metrics: payload.metrics || { trend: { direction: 'stable', value: 0, period: 'last quarter' }, sparklineData: [] },
      environmentalData: payload.environmentalData || { redAreas: [], greenAreas: [], batchAnalysisData: null }
    };
    const dir = companyDir(companyId);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${quarter}.json`);
    fs.writeFileSync(file, JSON.stringify(record, null, 2), 'utf-8');
    res.json(record);
  } catch (e) {
    console.error('write analysis error', e);
    res.status(500).json({ error: 'write_failed', message: e.message });
  }
});

app.post('/api/analysis/:companyId/:quarter', async (req, res) => {
  try {
    ensureResultsDir();
    const { companyId, quarter } = req.params;
    const payload = req.body || {};
    const record = {
      companyId,
      quarter,
      timestamp: new Date().toISOString(),
      metrics: payload.metrics || { trend: { direction: 'stable', value: 0, period: 'last quarter' }, sparklineData: [] },
      environmentalData: payload.environmentalData || { redAreas: [], greenAreas: [], batchAnalysisData: null }
    };
    const dir = companyDir(companyId);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${quarter}.json`);
    fs.writeFileSync(file, JSON.stringify(record, null, 2), 'utf-8');
    res.json(record);
  } catch (e) {
    console.error('write analysis error', e);
    res.status(500).json({ error: 'write_failed', message: e.message });
  }
});

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
  console.log(`📂 Analysis results directory: ${RESULTS_DIR}`);
});
