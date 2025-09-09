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
 * Calculate the width and height of a bounding box
 * @param {Array} coordinates - [tlx, tly, brx, bry] format
 * @returns {Object} - {width, height}
 */
function calculateBoxDimensions(coordinates) {
  const [tlx, tly, brx, bry] = coordinates;
  const width = Math.abs(brx - tlx);
  const height = Math.abs(tly - bry);
  return { width, height };
}

/**
 * Generate a polygon in the required API format
 * @param {number} centerLng - Center longitude
 * @param {number} centerLat - Center latitude  
 * @param {number} width - Box width
 * @param {number} height - Box height
 * @returns {Array} - Polygon coordinates in [[lng, lat]] format
 */
function generatePolygon(centerLng, centerLat, width, height) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  
  // Create rectangle polygon (clockwise from top-left)
  return [
    [centerLng - halfWidth, centerLat + halfHeight], // top-left
    [centerLng + halfWidth, centerLat + halfHeight], // top-right
    [centerLng + halfWidth, centerLat - halfHeight], // bottom-right
    [centerLng - halfWidth, centerLat - halfHeight], // bottom-left
    [centerLng - halfWidth, centerLat + halfHeight]  // close polygon
  ];
}

/**
 * Generate green box areas around the red box location
 * @param {Array} redBoxCoordinates - [tlx, tly, brx, bry] format
 * @returns {Array} - Array of similar areas in API format
 */
function generateSimilarAreas(redBoxCoordinates) {
  const { width, height } = calculateBoxDimensions(redBoxCoordinates);
  
  // Calculate center of red box
  const [tlx, tly, brx, bry] = redBoxCoordinates;
  const redCenterLng = (tlx + brx) / 2;
  const redCenterLat = (tly + bry) / 2;
  
  // Generate 3 green boxes at different locations but same size
  const areas = [
    {
      name: "Gold",
      similarity: 0.8576694346485472,
      rank: 1,
      position: 2,
      // Offset by reasonable distance (different city/region)
      centerLng: redCenterLng + (Math.random() * 1.0 + 0.5) * (Math.random() > 0.5 ? 1 : -1), // 0.5-1.5 degrees away
      centerLat: redCenterLat + (Math.random() * 0.5 + 0.3) * (Math.random() > 0.5 ? 1 : -1)  // 0.3-0.8 degrees away
    },
    {
      name: "Silver", 
      similarity: 0.691315995333693,
      rank: 2,
      position: 12,
      centerLng: redCenterLng + (Math.random() * 1.2 + 0.7) * (Math.random() > 0.5 ? 1 : -1), // 0.7-1.9 degrees away
      centerLat: redCenterLat + (Math.random() * 0.6 + 0.4) * (Math.random() > 0.5 ? 1 : -1)  // 0.4-1.0 degrees away
    },
    {
      name: "Bronze",
      similarity: 0.5969797768677286,
      rank: 3,
      position: 6,
      centerLng: redCenterLng + (Math.random() * 1.5 + 0.8) * (Math.random() > 0.5 ? 1 : -1), // 0.8-2.3 degrees away
      centerLat: redCenterLat + (Math.random() * 0.7 + 0.5) * (Math.random() > 0.5 ? 1 : -1)  // 0.5-1.2 degrees away
    }
  ];
  
  // Convert to API format
  return areas.map(area => ({
    geometry: {
      xg: null,
      args: null,
      ol: null,
      la: null,
      rm: "Polygon",
      ja: [generatePolygon(area.centerLng, area.centerLat, width, height)],
      da: null
    },
    similarity: area.similarity,
    position: area.position,
    rank: area.rank,
    name: area.name
  }));
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
    
    // Generate similar areas
    const similarAreas = generateSimilarAreas(coordinates);
    
    console.log('✅ Generated similar areas:', similarAreas.length);
    console.log('📊 Areas:', similarAreas.map(a => `${a.name} (${(a.similarity * 100).toFixed(1)}%)`).join(', '));
    
    res.json(similarAreas);
    
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
