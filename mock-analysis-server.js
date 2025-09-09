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

/**
 * Generate comprehensive batch analysis response
 * @param {Array} allAreas - Array of {type: 'red'|'green', name: string, bbox: [minLng, minLat, maxLng, maxLat]}
 * @returns {Object} - Comprehensive time series analysis
 */
function generateBatchAnalysisResponse(allAreas) {
  const rectangles = allAreas.map(area => ({
    name: area.name,
    bbox: area.bbox
  }));

  // Generate quarterly time series data for each area
  const time_series = {};
  const quarters = ['2022-Q1', '2022-Q2', '2022-Q3', '2022-Q4', '2023-Q1', '2023-Q2', '2023-Q3', '2023-Q4'];
  
  allAreas.forEach(area => {
    time_series[area.name] = quarters.map((period, index) => {
      // Generate realistic environmental data based on area type
      const isRed = area.type === 'red';
      const degradationFactor = index * 0.02; // Environmental degradation over time
      
      // Base values differ between company (red) and similar (green) areas
      const baseNDVI = isRed ? 0.25 + Math.random() * 0.1 : 0.35 + Math.random() * 0.15;
      const baseTemp = isRed ? 32 + Math.random() * 3 : 28 + Math.random() * 4;
      const baseDust = isRed ? 0.18 + Math.random() * 0.05 : 0.12 + Math.random() * 0.08;
      const baseSoil = isRed ? 0.35 + Math.random() * 0.1 : 0.25 + Math.random() * 0.1;
      const baseNightLights = isRed ? 3.5 + Math.random() * 1.5 : 2.0 + Math.random() * 1.0;
      
      // Apply degradation over time
      const ndvi_mean = Math.max(0.05, baseNDVI - degradationFactor * 2);
      const temp_mean = baseTemp + degradationFactor * 8;
      const temp_max = temp_mean + 12 + Math.random() * 8;
      const dust_mean = Math.min(0.4, baseDust + degradationFactor * 3);
      const dust_max = dust_mean + 0.1 + Math.random() * 0.15;
      const bsi_mean = Math.min(0.6, baseSoil + degradationFactor * 4);
      const night_lights = baseNightLights + degradationFactor * 5;
      const overall_score = 0.4 + (dust_mean + bsi_mean + (1 - ndvi_mean)) * 0.15;
      
      return {
        period,
        vegetation: {
          ndvi_mean: Number(ndvi_mean.toFixed(2)),
          ndvi_std: Number((0.06 + Math.random() * 0.08).toFixed(2))
        },
        thermal: {
          temp_mean: Number(temp_mean.toFixed(1)),
          temp_max: Number(temp_max.toFixed(1))
        },
        dust: {
          dust_mean: Number(dust_mean.toFixed(2)),
          dust_max: Number(dust_max.toFixed(2))
        },
        soil: {
          bsi_mean: Number(bsi_mean.toFixed(2))
        },
        industrial: {
          night_lights: Number(night_lights.toFixed(1)),
          ndbi_mean: Number((0.1 + Math.random() * 0.2).toFixed(2)),
          overall_score: Number(overall_score.toFixed(2))
        },
        anomalies: {
          vegetation_loss: ndvi_mean < 0.3,
          dust_anomaly: dust_max > 0.15,
          thermal_anomaly: temp_max > 50,
          soil_exposure: bsi_mean > 0.3
        }
      };
    });
  });

  // Generate area comparisons
  const area_comparisons = [];
  const redAreas = allAreas.filter(a => a.type === 'red');
  const greenAreas = allAreas.filter(a => a.type === 'green');
  
  redAreas.forEach(redArea => {
    greenAreas.forEach(greenArea => {
      const redScore = time_series[redArea.name][7].industrial.overall_score; // Latest quarter
      const greenScore = time_series[greenArea.name][7].industrial.overall_score;
      
      area_comparisons.push({
        area_1: redArea.name,
        area_2: greenArea.name,
        industrial_similarity: Number((0.75 + Math.random() * 0.2).toFixed(2)),
        score_difference: Number(Math.abs(redScore - greenScore).toFixed(2)),
        area_1_score: redScore,
        area_2_score: greenScore,
        both_have_dust_anomaly: time_series[redArea.name][7].anomalies.dust_anomaly && time_series[greenArea.name][7].anomalies.dust_anomaly,
        both_have_thermal_anomaly: time_series[redArea.name][7].anomalies.thermal_anomaly && time_series[greenArea.name][7].anomalies.thermal_anomaly
      });
    });
  });

  // Generate anomaly summary
  const anomalies = {
    vegetation_loss: [],
    dust_anomalies: [],
    thermal_anomalies: [],
    soil_exposure: []
  };
  
  Object.entries(time_series).forEach(([areaName, data]) => {
    data.forEach(periodData => {
      if (periodData.anomalies.vegetation_loss) {
        anomalies.vegetation_loss.push({
          area: areaName,
          period: periodData.period,
          ndvi_value: periodData.vegetation.ndvi_mean
        });
      }
      if (periodData.anomalies.dust_anomaly) {
        anomalies.dust_anomalies.push({
          area: areaName,
          period: periodData.period,
          dust_max: periodData.dust.dust_max
        });
      }
      if (periodData.anomalies.thermal_anomaly) {
        anomalies.thermal_anomalies.push({
          area: areaName,
          period: periodData.period,
          temp_max: periodData.thermal.temp_max
        });
      }
      if (periodData.anomalies.soil_exposure) {
        anomalies.soil_exposure.push({
          area: areaName,
          period: periodData.period,
          bsi_value: periodData.soil.bsi_mean
        });
      }
    });
  });

  return {
    status: "success",
    timestamp: new Date().toISOString(),
    request_id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    config: {
      start_date: "2022-01-01",
      end_date: "2023-12-31",
      temporal_resolution: "quarterly",
      thresholds: {
        vegetation_loss: -0.2,
        dust_level: 0.15,
        thermal_anomaly: 50,
        soil_exposure: 0.3,
        night_light_increase: 0.5
      }
    },
    rectangles,
    time_series,
    area_comparisons,
    anomaly_summary: {
      total_anomalies: Object.values(anomalies).reduce((sum, arr) => sum + arr.length, 0),
      by_type: anomalies,
      thresholds_used: {
        vegetation_loss: -0.2,
        dust_level: 0.15,
        thermal_anomaly: 50,
        soil_exposure: 0.3,
        night_light_increase: 0.5
      }
    },
    summary: {
      total_periods_analyzed: 8,
      temporal_resolution: "quarterly",
      areas_analyzed: allAreas.length,
      total_features_processed: allAreas.length * 8,
      thresholds_used: {
        vegetation_loss: -0.2,
        dust_level: 0.15,
        thermal_anomaly: 50,
        soil_exposure: 0.3,
        night_light_increase: 0.5
      }
    }
  };
}

// Batch analysis endpoint
app.post('/analyze-batch', (req, res) => {
  try {
    const { redAreas, greenAreas } = req.body;
    
    console.log('📊 Batch analysis request received');
    console.log(`🔴 Red areas: ${redAreas?.length || 0}`);
    console.log(`🟢 Green areas: ${greenAreas?.length || 0}`);
    
    if (!redAreas || !greenAreas) {
      return res.status(400).json({
        error: 'Missing redAreas or greenAreas in request body'
      });
    }
    
    // Combine all areas with type information
    const allAreas = [
      ...redAreas.map((area, index) => ({
        type: 'red',
        name: area.name || `Company_Area_${index + 1}`,
        bbox: area.bbox || area.coordinates
      })),
      ...greenAreas.map((area, index) => ({
        type: 'green', 
        name: area.name || `Similar_Area_${index + 1}`,
        bbox: area.bbox || area.coordinates
      }))
    ];
    
    console.log(`📈 Generating batch analysis for ${allAreas.length} areas`);
    
    const response = generateBatchAnalysisResponse(allAreas);
    
    console.log('✅ Batch analysis response generated successfully');
    console.log(`📊 Time series data for ${Object.keys(response.time_series).length} areas`);
    console.log(`🚨 Total anomalies found: ${response.anomaly_summary.total_anomalies}`);
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Batch analysis error:', error);
    res.status(500).json({
      error: 'Internal server error during batch analysis',
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
  console.log(`   POST /analyze-area  - Individual area similarity analysis`);
  console.log(`   POST /analyze-batch - Comprehensive batch analysis`);
  console.log(`   GET  /health        - Health check`);
});
