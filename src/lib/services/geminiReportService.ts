import { ReportData, ReportRequest, ReportResponse, GeminiReportPrompt } from '@/lib/types/report';

/**
 * Service for generating AI-powered environmental reports using Gemini 2.5 Pro
 * Integrates with Google Cloud Vertex AI for enterprise-grade AI capabilities
 */
export class GeminiReportService {
  private static readonly VERTEX_AI_ENDPOINT = 'https://europe-west3-aiplatform.googleapis.com';
  private static readonly PROJECT_ID = 'tum-cdtm25mun-8787';
  private static readonly LOCATION = 'europe-west3';

  /**
   * Generate a comprehensive environmental impact report using Gemini 2.5 Pro
   */
  static async generateReport(
    reportData: ReportData,
    request: ReportRequest
  ): Promise<ReportResponse> {
    try {
      // Generate the prompt for Gemini
      const prompt = this.createGeminiPrompt(reportData, request);
      
      // Call Vertex AI Gemini 2.5 Pro
      const geminiResponse = await this.callVertexAI(prompt);
      
      // Process the response and generate PDF
      const reportId = this.generateReportId();
      const pdfUrl = await this.generatePDF(geminiResponse, reportData, request);
      
      return {
        reportId,
        status: 'completed',
        downloadUrl: pdfUrl,
        preview: geminiResponse.summary || geminiResponse.content.substring(0, 500)
      };
      
    } catch (error) {
      console.error('Report generation failed:', error);
      return {
        reportId: this.generateReportId(),
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a comprehensive prompt for Gemini 2.5 Pro
   */
  private static createGeminiPrompt(
    reportData: ReportData,
    request: ReportRequest
  ): GeminiReportPrompt {
    
    const systemPrompt = `You are an expert environmental data analyst and report writer specializing in satellite-based environmental impact assessment. You have expertise in:

- Remote sensing data interpretation (NDVI, NDWI, NDBI, elevation, slope)
- Environmental impact assessment methodologies
- Statistical analysis and significance testing
- Corporate sustainability reporting
- Technical and executive communication

Your task is to analyze environmental data comparing operational areas (red zones) with environmentally similar reference areas (green zones) and generate comprehensive insights about environmental impact, risks, and opportunities.`;

    const dataContext = `
COMPANY INFORMATION:
- Name: ${reportData.company.name}
- Industry: ${reportData.company.industry}
- Analysis Date: ${reportData.company.analysisDate}

OPERATIONAL AREAS (RED ZONES) DATA:
${JSON.stringify(reportData.redAreas, null, 2)}

SIMILAR REFERENCE AREAS (GREEN ZONES) DATA:
${JSON.stringify(reportData.greenAreas, null, 2)}

COMPARISON METRICS:
${JSON.stringify(reportData.comparisonMetrics, null, 2)}

METADATA:
${JSON.stringify(reportData.metadata, null, 2)}
`;

    const analysisInstructions = `
ANALYSIS REQUIREMENTS:

1. EXECUTIVE SUMMARY (200-300 words)
   - Key findings about environmental impact
   - Critical differences between operational and reference areas
   - Risk level assessment
   - Primary recommendations

2. DETAILED COMPARATIVE ANALYSIS
   - Vegetation Health Analysis (NDVI comparison)
   - Water Resource Impact (NDWI analysis)
   - Urban Development Impact (NDBI analysis)
   - Topographic Considerations (elevation, slope)
   - Climate and Weather Patterns
   - Land Cover Change Analysis

3. STATISTICAL SIGNIFICANCE
   - Interpret statistical test results
   - Explain effect sizes and practical significance
   - Identify the most impactful differences

4. ENVIRONMENTAL RISK ASSESSMENT
   - Current impact level justification
   - Detailed risk analysis (drought, flood, erosion)
   - Future risk projections
   - Vulnerable ecosystem identification

5. MITIGATION STRATEGIES
   - Specific, actionable recommendations
   - Cost-benefit considerations
   - Implementation timeline suggestions
   - Success metrics

6. TEMPORAL TRENDS
   - Analyze time series data patterns
   - Identify concerning trends
   - Seasonal variation insights
   - Long-term projections

FOCUS ON:
- Quantitative insights with specific numbers
- Practical implications for business operations
- Environmental compliance considerations
- Sustainability opportunities
- Clear, non-technical language for executives
- Technical depth for environmental teams
`;

    const visualizationRequirements = request.includeVisualizations ? `
VISUALIZATION DESCRIPTIONS:
Please describe in detail the following visualizations that should be included:

1. Comparison Dashboard:
   - Side-by-side metrics comparison (red vs green areas)
   - Color-coded performance indicators
   - Trend arrows and percentage changes

2. Time Series Charts:
   - NDVI trends over time
   - Environmental degradation patterns
   - Seasonal variations

3. Statistical Analysis Charts:
   - Box plots for key metrics
   - Correlation matrices
   - Significance test results

4. Risk Assessment Matrix:
   - Heat map of risk levels
   - Geographic distribution of risks
   - Mitigation priority matrix

5. Geospatial Analysis:
   - Area location maps
   - Environmental gradient visualizations
   - Impact zone mapping

For each visualization, provide:
- Chart type and configuration
- Data series to include
- Color schemes and styling
- Key insights to highlight
- Caption and interpretation
` : 'No visualizations required.';

    const outputFormat = `
OUTPUT FORMAT:

Provide your analysis in the following structured format:

# ENVIRONMENTAL IMPACT ASSESSMENT REPORT
## ${reportData.company.name} - ${reportData.company.industry}

### EXECUTIVE SUMMARY
[Your executive summary here]

### METHODOLOGY
- Data Sources: ${reportData.metadata.data_sources.join(', ')}
- Analysis Period: ${reportData.metadata.temporal_coverage.start_date} to ${reportData.metadata.temporal_coverage.end_date}
- Spatial Resolution: ${reportData.metadata.spatial_resolution}
- Confidence Level: ${(reportData.metadata.confidence_level * 100).toFixed(0)}%

### COMPARATIVE ANALYSIS
[Detailed analysis sections]

### STATISTICAL RESULTS
[Statistical analysis interpretation]

### RISK ASSESSMENT
[Risk analysis and projections]

### RECOMMENDATIONS
[Specific, actionable recommendations]

### CONCLUSION
[Key takeaways and next steps]

${request.includeVisualizations ? '### VISUALIZATION SPECIFICATIONS\n[Detailed visualization descriptions]' : ''}

Use clear headings, bullet points, and data tables where appropriate. Maintain a professional, technical tone while ensuring accessibility for both technical and executive audiences.
`;

    return {
      systemPrompt,
      dataContext,
      analysisInstructions,
      visualizationRequirements,
      outputFormat
    };
  }

  /**
   * Call Vertex AI Gemini 2.5 Pro API
   */
  private static async callVertexAI(prompt: GeminiReportPrompt): Promise<any> {
    // This would be the actual Vertex AI API call
    // For now, we'll simulate the response structure
    
    const fullPrompt = `
${prompt.systemPrompt}

${prompt.dataContext}

${prompt.analysisInstructions}

${prompt.visualizationRequirements}

${prompt.outputFormat}
`;

    // Simulated API call structure for Vertex AI
    const apiPayload = {
      instances: [{
        content: fullPrompt
      }],
      parameters: {
        temperature: 0.1, // Low temperature for factual analysis
        maxOutputTokens: 8192, // Large output for comprehensive reports
        topP: 0.8,
        topK: 40
      }
    };

    console.log('Vertex AI API call payload:', apiPayload);

    // Real Gemini API call through our proxy server
    const response = await fetch('http://localhost:3001/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          topP: 0.8,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    // Extract the generated content
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return {
      content: generatedText,
      summary: generatedText.substring(0, 500) + '...',
      confidence: 0.95,
      processingTime: 2.3
    };
  }

  /**
   * Generate PDF from Gemini analysis using jsPDF and html2canvas
   */
  private static async generatePDF(
    geminiResponse: any,
    reportData: ReportData,
    request: ReportRequest
  ): Promise<string> {
    try {
      // Dynamic imports for client-side PDF generation
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      // Extract content from Gemini response
      const reportContent = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 
                           geminiResponse.content || 
                           'Report content not available';
      
      // Create a temporary div for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm';
      tempDiv.style.backgroundColor = 'white';
      
      // HTML content for PDF
      const htmlContent = this.createPDFHTML(reportData, request, reportContent);
      tempDiv.innerHTML = htmlContent;
      
      document.body.appendChild(tempDiv);
      
      try {
        // Convert HTML to canvas
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 794, // A4 width in pixels at 96 DPI
          height: 1123 // A4 height in pixels at 96 DPI
        });
        
        // Create PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if needed
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Generate filename
        const fileName = `${reportData.company.name.replace(/[^a-zA-Z0-9]/g, '_')}_Environmental_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Save PDF
        pdf.save(fileName);
        
        console.log('📄 PDF generated and downloaded:', fileName);
        
        // Return download URL (in this case, the filename since it's downloaded directly)
        return `downloaded://${fileName}`;
        
      } finally {
        // Clean up temporary element
        document.body.removeChild(tempDiv);
      }
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create HTML content for PDF generation
   */
  private static createPDFHTML(reportData: ReportData, request: ReportRequest, geminiContent: string): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Parse Gemini content into formatted sections
    const formatContent = (content: string) => {
      return content
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>');
    };

    return `
      <div style="width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm; background-color: white; color: #000; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.6;">
        
        <!-- Header -->
        <div style="border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="margin: 0 0 10px 0; color: #0ea5e9; font-size: 24px; font-weight: bold;">
            Environmental Impact Report
          </h1>
          <h2 style="margin: 0 0 15px 0; color: #374151; font-size: 18px; font-weight: normal;">
            ${reportData.company.name}
          </h2>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #6b7280;">
            <div>
              <strong>Industry:</strong> ${reportData.company.industry}<br/>
              <strong>Analysis Date:</strong> ${reportData.company.analysisDate}<br/>
              <strong>Report Type:</strong> ${request.reportType}
            </div>
            <div style="text-align: right;">
              <strong>Generated:</strong> ${currentDate}<br/>
              <strong>Powered by:</strong> Gemini 2.5 Pro<br/>
              <strong>Data Source:</strong> Google Earth Engine
            </div>
          </div>
        </div>

        <!-- Key Metrics Summary -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #0ea5e9; font-size: 16px;">
            📊 Key Environmental Metrics
          </h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">
                Operational Areas (Red Zones)
              </h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 11px;">
                <li>Total Areas Analyzed: ${reportData.redAreas.length}</li>
                <li>Average NDVI: ${reportData.redAreas[0]?.environmentalData?.ndvi?.mean?.toFixed(3) || 'N/A'}</li>
                <li>Average NDWI: ${reportData.redAreas[0]?.environmentalData?.ndwi?.mean?.toFixed(3) || 'N/A'}</li>
                <li>Average Elevation: ${reportData.redAreas[0]?.environmentalData?.elevation?.mean?.toFixed(0) || 'N/A'}m</li>
              </ul>
            </div>
            
            <div>
              <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">
                Reference Areas (Green Zones)
              </h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 11px;">
                <li>Total Areas Analyzed: ${reportData.greenAreas.length}</li>
                <li>Average NDVI: ${reportData.greenAreas[0]?.environmentalData?.ndvi?.mean?.toFixed(3) || 'N/A'}</li>
                <li>Average NDWI: ${reportData.greenAreas[0]?.environmentalData?.ndwi?.mean?.toFixed(3) || 'N/A'}</li>
                <li>Average Elevation: ${reportData.greenAreas[0]?.environmentalData?.elevation?.mean?.toFixed(0) || 'N/A'}m</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- AI Analysis Content -->
        <div style="margin-bottom: 30px;">
          <h3 style="margin: 0 0 20px 0; color: #0ea5e9; font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">
            🤖 AI-Powered Analysis
          </h3>
          
          <div style="font-size: 12px; line-height: 1.6; text-align: justify;">
            <p>${formatContent(geminiContent)}</p>
          </div>
        </div>

        <!-- Data Source Information -->
        <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 40px; font-size: 10px; color: #6b7280;">
          <h4 style="margin: 0 0 10px 0; font-size: 12px; color: #374151;">
            Data Sources & Methodology
          </h4>
          <p style="margin: 0 0 10px 0;">
            <strong>Satellite Data:</strong> Google Earth Engine (Landsat, Sentinel)
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>AI Analysis:</strong> Google Gemini 2.5 Pro with environmental expertise
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Analysis Period:</strong> ${reportData.metadata.temporal_coverage.start_date} to ${reportData.metadata.temporal_coverage.end_date}
          </p>
          <p style="margin: 0;">
            <strong>Coordinate System:</strong> WGS84 (EPSG:4326) | 
            <strong> Resolution:</strong> ${reportData.metadata.spatial_resolution} | 
            <strong> Confidence:</strong> ${reportData.metadata.confidence_level}%
          </p>
        </div>

        <!-- Footer -->
        <div style="position: absolute; bottom: 10mm; left: 20mm; right: 20mm; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px;">
          ProtectEarth Environmental Impact Monitoring Platform | Powered by AI & Satellite Data
        </div>
      </div>
    `;
  }

  /**
   * Generate unique report ID
   */
  private static generateReportId(): string {
    return `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
