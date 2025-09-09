import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

// Enable CORS for your Vite app
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());


/**
 * Generate response in real API format
 * @param {Array} redBoxCoordinates - [tlx, tly, brx, bry] format (reference bbox)
 * @returns {Object} - Real API format response
 */
function generateRealAPIResponse(redBoxCoordinates) {
  const [minLng, maxLat, maxLng, minLat] = redBoxCoordinates; // [tlx, tly, brx, bry]
  
  // Calculate bbox size for similar areas
  const width = maxLng - minLng;
  const height = maxLat - minLat;
  
  return {
    "status": "success",
    "timestamp": new Date().toISOString(),
    "config": {
      "reference_bbox": [minLng, minLat, maxLng, maxLat], // Convert to [minLng, minLat, maxLng, maxLat]
      "start_date": "2022-01-01",
      "end_date": "2023-12-31",
      "search_radius_km": 400,
      "sampling_resolution_m": 25000,
      "max_candidates": 20,
      "similarity_threshold": 0.5,
      "weights": {
        "ndvi": 0.4,
        "elevation": 0.2,
        "slope": 0.2,
        "landcover": 0.2
      }
    },
    "reference": {
      "bbox": [minLng, minLat, maxLng, maxLat]
    },
    "candidates_generated": 20,
    "top_matches": [
      {
        "rank": 1,
        "index": 19,
        "position": "G2x2",
        "similarity": 0.8475872899136501,
        "bbox": (() => {
          const offsetLng = minLng + 1.5 + Math.random() * 0.5;
          const offsetLat = minLat - 0.8 + Math.random() * 0.3;
          return [offsetLng, offsetLat, offsetLng + width, offsetLat + height];
        })(),
        "features": {
          "ndvi_mean": 0.6399730545512436,
          "ndvi_std": 0.1933439436993898,
          "elevation_mean": 236.24505001934136,
          "elevation_std": 69.8139695372853,
          "slope_mean": 5.560540045601997,
          "slope_std": 4.263754629431046,
          "ndwi_mean": -0.6184049436709766,
          "ndbi_mean": -0.1782257237389115,
          "landcover_diversity": 6
        }
      },
      {
        "rank": 2,
        "index": 10,
        "position": "G1x1",
        "similarity": 0.7969215788044441,
        "bbox": (() => {
          const offsetLng = minLng - 1.2 + Math.random() * 0.4;
          const offsetLat = minLat + 0.6 + Math.random() * 0.2;
          return [offsetLng, offsetLat, offsetLng + width, offsetLat + height];
        })(),
        "features": {
          "ndvi_mean": 0.6315502851025512,
          "ndvi_std": 0.15988132148153006,
          "elevation_mean": 287.2204410316737,
          "elevation_std": 60.365805327301565,
          "slope_mean": 8.452073093521543,
          "slope_std": 5.399999718639627,
          "ndwi_mean": -0.623306043707719,
          "ndbi_mean": -0.17519749822755779,
          "landcover_diversity": 5
        }
      },
      {
        "rank": 3,
        "index": 3,
        "position": "G0x2",
        "similarity": 0.7659304641433505,
        "bbox": (() => {
          const offsetLng = minLng + 0.8 + Math.random() * 0.3;
          const offsetLat = minLat + 1.1 + Math.random() * 0.2;
          return [offsetLng, offsetLat, offsetLng + width, offsetLat + height];
        })(),
        "features": {
          "ndvi_mean": 0.6351344347266186,
          "ndvi_std": 0.16594679699292222,
          "elevation_mean": 287.19857300875316,
          "elevation_std": 70.27756014429106,
          "slope_mean": 4.641306946789014,
          "slope_std": 3.7083253165939953,
          "ndwi_mean": -0.627199374882451,
          "ndbi_mean": -0.19715395935091873,
          "landcover_diversity": 6
        }
      }
    ]
  };
}

// Mock analysis endpoint
app.post('/analyze-area', async (req, res) => {
  try {
    console.log('🔍 Analysis request received');
    console.log('📍 Red box coordinates:', req.body.coordinates);
    
    const { coordinates } = req.body;
    
    // Validate input
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 4) {
      return res.status(400).json({ 
        error: 'Invalid coordinates format. Expected [tlx, tly, brx, bry]' 
      });
    }
    
    // Add small delay to simulate real API processing
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400)); // 800-1200ms
    
    // Generate response in real API format
    const apiResponse = generateRealAPIResponse(coordinates);
    
    console.log('✅ Generated response with', apiResponse.top_matches.length, 'matches');
    console.log('📊 Similarities:', apiResponse.top_matches.map(m => `${m.position} (Rank ${m.rank}): ${(m.similarity * 100).toFixed(1)}%`).join(', '));
    
    res.json(apiResponse);
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze area',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock analysis server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock Analysis Server running on http://localhost:${PORT}`);
  console.log(`🔗 Handling requests from http://localhost:8080`);
  console.log(`📡 Available endpoints:`);
  console.log(`   POST /analyze-area - Main analysis endpoint`);
  console.log(`   GET  /health       - Health check`);
});
