import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for your Vite app
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());

// Mock Gemini API endpoint for development
app.post('/api/gemini', async (req, res) => {
  try {
    console.log('🤖 Mock Gemini API request received');
    console.log('📋 Request body contains:', {
      hasContents: !!req.body.contents,
      generationConfig: req.body.generationConfig
    });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Extract the prompt from the request
    const prompt = req.body.contents?.[0]?.parts?.[0]?.text || '';
    const reportType = prompt.includes('EXECUTIVE SUMMARY') ? 'summary' : 
                      prompt.includes('TECHNICAL DEEP-DIVE') ? 'technical' : 'comprehensive';
    
    // Generate mock response based on report type
    let mockContent = '';
    
    switch (reportType) {
      case 'summary':
        mockContent = `# ENVIRONMENTAL IMPACT ASSESSMENT REPORT
## Executive Summary

### KEY FINDINGS
• Operational areas show 27% lower vegetation health (NDVI) compared to reference regions
• Water stress indicators suggest moderate risk in 3 out of 5 operational zones
• Urban heat island effect detected with 2.3°C average temperature increase
• Deforestation rate of 3.2% annually exceeds regional average by 1.8%
• Carbon sequestration capacity reduced by approximately 15,000 tons CO2/year

### IMPACT ASSESSMENT
- **Overall Environmental Impact**: MEDIUM-HIGH
- **Primary Concern**: Accelerated vegetation loss in operational zones threatening local biodiversity
- **Opportunity Area**: Implementation of green corridors could reduce heat island effect by 40%

### BUSINESS IMPLICATIONS
• Regulatory compliance risk with upcoming EU environmental standards (2025)
• Potential for €2.5M in carbon offset costs if current trends continue
• Reputation risk score increased from 3.2 to 4.8 (out of 10)
• Opportunity for sustainability certification with targeted improvements

### RECOMMENDATIONS
1. **Immediate Action**: Establish 500m vegetation buffer zones around high-impact areas (Q1 2025)
2. **Short-term (3-6 months)**: Implement water recycling systems to reduce consumption by 30%
3. **Long-term (12+ months)**: Develop comprehensive biodiversity restoration program

### NEXT STEPS
• Schedule environmental audit for Q1 2025
• Engage stakeholders on sustainability roadmap
• Allocate budget for immediate mitigation measures`;
        break;
        
      case 'technical':
        mockContent = `# ENVIRONMENTAL IMPACT ASSESSMENT REPORT
## Technical Deep-Dive Analysis

### EXECUTIVE SUMMARY
This technical analysis employs multispectral satellite imagery analysis using Landsat 8/9 OLI sensors (30m spatial resolution) to quantify environmental impacts across operational zones. Statistical analysis reveals significant degradation patterns (p < 0.001) with effect sizes ranging from Cohen's d = 0.72 to 1.34 across key environmental indices.

### METHODOLOGY
#### Data Acquisition
- Sensor Specifications: Landsat 8/9 OLI/TIRS, 11 spectral bands (435-12510 nm)
- Temporal Resolution: 16-day revisit cycle, 5-year analysis period (2020-2025)
- Spatial Resolution: 30m (multispectral), 15m (panchromatic)
- Processing Chain: Level-2 Surface Reflectance, FMASK cloud removal, harmonized composites

#### Statistical Methods
Applied MANOVA for multivariate comparison, Mann-Kendall trend tests for temporal analysis, and spatial autocorrelation (Moran's I) for pattern detection.

### ENVIRONMENTAL INDICES ANALYSIS
#### NDVI Analysis
- Mean: 0.453 ± 0.082 (operational) vs 0.621 ± 0.067 (reference)
- Temporal Trend: y = -0.0023x + 0.481, R² = 0.76
- Statistical Significance: F(1,148) = 42.3, p < 0.001
- Formula: NDVI = (NIR - RED) / (NIR + RED) where NIR = Band 5, RED = Band 4

#### NDWI Analysis
- Mean: -0.123 ± 0.045 (operational) vs 0.087 ± 0.038 (reference)
- Seasonal Variation: 34% reduction in wet season water retention
- Statistical Significance: t(148) = -5.67, p < 0.001

### STATISTICAL RESULTS
#### Comparative Statistics
| Metric | Test Statistic | p-value | Effect Size | 95% CI |
|--------|---------------|---------|-------------|---------|
| NDVI | F = 42.3 | <0.001 | d = 1.34 | [1.12, 1.56] |
| NDWI | t = -5.67 | <0.001 | d = 0.89 | [0.67, 1.11] |
| NDBI | F = 28.7 | <0.001 | d = 0.72 | [0.51, 0.93] |

### PREDICTIVE MODELING
Monte Carlo simulation (n=10,000) projects 68% probability of severe degradation by 2030 under current trajectory. ARIMA(2,1,2) model forecasts 42% vegetation loss within 5 years.`;
        break;
        
      default:
        mockContent = `# ENVIRONMENTAL IMPACT ASSESSMENT REPORT
## Comprehensive Analysis

### EXECUTIVE SUMMARY
This comprehensive environmental impact assessment reveals significant disparities between operational areas and environmentally similar reference regions. Analysis of satellite-derived environmental indices indicates moderate to high environmental impact, with vegetation health (NDVI) showing a 27.4% reduction in operational zones compared to reference areas. Water stress indicators and urban development patterns suggest immediate intervention is required to mitigate long-term ecological damage.

### METHODOLOGY
- Data Sources: Google Earth Engine Landsat 8/9, SRTM Digital Elevation Model, MODIS Land Cover, ERA5 Climate Reanalysis
- Analysis Period: 2020-01-01 to 2025-01-01
- Spatial Resolution: 30m (Landsat)
- Confidence Level: 95%

### COMPARATIVE ANALYSIS

#### Vegetation Health (NDVI)
Operational areas exhibit mean NDVI of 0.453 compared to 0.621 in reference areas, indicating significant vegetation stress. This 27.4% reduction suggests compromised photosynthetic activity and potential ecosystem degradation.

#### Water Resources (NDWI)
Negative NDWI values (-0.123) in operational zones versus positive values (0.087) in reference areas indicate reduced soil moisture and potential water stress conditions affecting local hydrology.

#### Urban Development (NDBI)
NDBI analysis reveals 88.9% higher urbanization index in operational areas, contributing to increased surface temperatures and reduced natural land cover.

### STATISTICAL RESULTS
ANOVA testing confirms statistically significant differences (p < 0.001) between operational and reference areas across all environmental indices. Effect sizes range from moderate (d = 0.72) to large (d = 1.34), indicating substantial practical significance.

### RISK ASSESSMENT
- **Current Impact Level**: MEDIUM-HIGH
- **Drought Risk**: Elevated in 60% of operational areas
- **Flood Risk**: Moderate due to increased imperviousness
- **Erosion Risk**: High on slopes exceeding 15°
- **Biodiversity Loss**: Estimated 30% reduction in species richness

### RECOMMENDATIONS
1. **Immediate**: Establish vegetation buffer zones (500m minimum)
2. **Short-term**: Implement water conservation measures and sustainable drainage systems
3. **Medium-term**: Restore degraded habitats through native species reforestation
4. **Long-term**: Develop comprehensive environmental management system aligned with ISO 14001

### TEMPORAL TRENDS
Time series analysis reveals accelerating degradation with seasonal patterns showing highest stress during dry seasons. Linear regression indicates -0.023 NDVI units/year decline rate.

### CONCLUSION
The environmental impact assessment demonstrates substantial ecological degradation in operational areas requiring immediate remediation. Implementation of recommended mitigation strategies could reduce impact by 40-60% within 24 months while improving regulatory compliance and stakeholder relations.`;
    }
    
    // Mock Gemini API response structure
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: mockContent
          }],
          role: 'model'
        },
        finishReason: 'STOP',
        index: 0,
        safetyRatings: []
      }],
      promptFeedback: {
        safetyRatings: []
      }
    };
    
    console.log('✅ Sending mock Gemini response');
    res.json(mockResponse);
    
  } catch (error) {
    console.error('❌ Mock server error:', error);
    res.status(500).json({ 
      error: 'Mock server error',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mock Gemini server running on http://localhost:${PORT}`);
  console.log(`📝 This is a MOCK server for development - responses are simulated`);
  console.log(`🔗 Handling requests from http://localhost:8080`);
});
