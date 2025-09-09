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

    // Real Gemini API call through Firebase Functions (falls back to local for dev)
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? '/api/gemini'  // Firebase Functions endpoint
      : 'http://localhost:3001/api/gemini'; // Local development
    
    const response = await fetch(apiUrl, {
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
   * Generate PDF from Gemini analysis using jsPDF with proper pagination
   */
  private static async generatePDF(
    geminiResponse: any,
    reportData: ReportData,
    request: ReportRequest
  ): Promise<string> {
    try {
      // Dynamic imports for client-side PDF generation
      const jsPDF = (await import('jspdf')).default;
      
      // Extract content from Gemini response
      const reportContent = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 
                           geminiResponse.content || 
                           'Report content not available';
      
      // Create PDF with proper pagination
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set up page dimensions
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      let currentY = margin;

      // Add header function
      const addHeader = (pageNumber: number) => {
        pdf.setFontSize(24);
        pdf.setTextColor(14, 165, 233); // Blue color
        pdf.text('Environmental Impact Report', margin, currentY);
        currentY += 15;
        
        pdf.setFontSize(18);
        pdf.setTextColor(55, 65, 81); // Gray color
        pdf.text(reportData.company.name, margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128); // Light gray
        const currentDate = new Date().toLocaleDateString('en-US');
        pdf.text(`Generated: ${currentDate} | Page ${pageNumber}`, margin, currentY);
        currentY += 15;
        
        // Add horizontal line
        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;
      };

      // Add footer function
      const addFooter = () => {
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text('ProtectEarth Environmental Impact Monitoring Platform | Powered by AI & Satellite Data', 
                margin, pageHeight - 10);
      };

      // Check if we need a new page
      const checkNewPage = (requiredSpace: number = 15) => {
        if (currentY + requiredSpace > pageHeight - 30) {
          pdf.addPage();
          currentY = margin;
          addHeader(pdf.getNumberOfPages());
          return true;
        }
        return false;
      };

      // Start first page
      let pageNumber = 1;
      addHeader(pageNumber);

      // Add key metrics summary
      pdf.setFontSize(16);
      pdf.setTextColor(14, 165, 233);
      pdf.text('📊 Key Environmental Metrics', margin, currentY);
      currentY += 10;

      checkNewPage(30);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      // Operational areas metrics
      pdf.setFont(undefined, 'bold');
      pdf.text('Operational Areas (Red Zones):', margin, currentY);
      currentY += 6;
      pdf.setFont(undefined, 'normal');
      pdf.text(`• Total Areas Analyzed: ${reportData.redAreas.length}`, margin + 5, currentY);
      currentY += 5;
      pdf.text(`• Average NDVI: ${reportData.redAreas[0]?.environmentalData?.ndvi?.mean?.toFixed(3) || 'N/A'}`, margin + 5, currentY);
      currentY += 5;
      pdf.text(`• Average NDWI: ${reportData.redAreas[0]?.environmentalData?.ndwi?.mean?.toFixed(3) || 'N/A'}`, margin + 5, currentY);
      currentY += 5;
      pdf.text(`• Average Elevation: ${reportData.redAreas[0]?.environmentalData?.elevation?.mean?.toFixed(0) || 'N/A'}m`, margin + 5, currentY);
      currentY += 10;

      checkNewPage(25);
      
      // Reference areas metrics
      pdf.setFont(undefined, 'bold');
      pdf.text('Reference Areas (Green Zones):', margin, currentY);
      currentY += 6;
      pdf.setFont(undefined, 'normal');
      pdf.text(`• Total Areas Analyzed: ${reportData.greenAreas.length}`, margin + 5, currentY);
      currentY += 5;
      pdf.text(`• Average NDVI: ${reportData.greenAreas[0]?.environmentalData?.ndvi?.mean?.toFixed(3) || 'N/A'}`, margin + 5, currentY);
      currentY += 5;
      pdf.text(`• Average NDWI: ${reportData.greenAreas[0]?.environmentalData?.ndwi?.mean?.toFixed(3) || 'N/A'}`, margin + 5, currentY);
      currentY += 5;
      pdf.text(`• Average Elevation: ${reportData.greenAreas[0]?.environmentalData?.elevation?.mean?.toFixed(0) || 'N/A'}m`, margin + 5, currentY);
      currentY += 15;

      // Add AI Analysis section
      checkNewPage(20);
      pdf.setFontSize(16);
      pdf.setTextColor(14, 165, 233);
      pdf.text('🤖 AI-Powered Analysis', margin, currentY);
      currentY += 10;

      // Split content into paragraphs and add with proper pagination
      const paragraphs = reportContent.split(/\n\n+/);
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) continue;
        
        // Check if this is a heading (starts with # or ##)
        if (paragraph.trim().startsWith('#')) {
          checkNewPage(15);
          pdf.setFont(undefined, 'bold');
          pdf.setFontSize(12);
          const heading = paragraph.replace(/^#+\s*/, '');
          pdf.text(heading, margin, currentY);
          currentY += 8;
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(10);
          continue;
        }

        // Split long paragraphs into lines that fit the page width
        const lines = pdf.splitTextToSize(paragraph.trim(), contentWidth);
        
        // Check if we need a new page for this paragraph
        checkNewPage(lines.length * 5 + 5);
        
        // Add each line
        for (const line of lines) {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
            addHeader(pdf.getNumberOfPages());
          }
          pdf.text(line, margin, currentY);
          currentY += 5;
        }
        currentY += 3; // Extra space between paragraphs
      }

      // Add data sources section
      checkNewPage(30);
      pdf.setFontSize(12);
      pdf.setTextColor(14, 165, 233);
      pdf.text('Data Sources & Methodology', margin, currentY);
      currentY += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text('• Satellite Data: Google Earth Engine (Landsat, Sentinel)', margin, currentY);
      currentY += 5;
      pdf.text('• AI Analysis: Google Gemini 1.5 Pro with environmental expertise', margin, currentY);
      currentY += 5;
      pdf.text(`• Analysis Period: ${reportData.metadata.temporal_coverage.start_date} to ${reportData.metadata.temporal_coverage.end_date}`, margin, currentY);
      currentY += 5;
      pdf.text(`• Coordinate System: WGS84 (EPSG:4326) | Resolution: ${reportData.metadata.spatial_resolution}`, margin, currentY);
      currentY += 5;
      pdf.text(`• Confidence Level: ${reportData.metadata.confidence_level}%`, margin, currentY);

      // Add footer to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addFooter();
      }
      
      // Generate filename
      const fileName = `${reportData.company.name.replace(/[^a-zA-Z0-9]/g, '_')}_Environmental_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save PDF
      pdf.save(fileName);
      
      console.log('📄 Multi-page PDF generated and downloaded:', fileName);
      
      return `downloaded://${fileName}`;
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  /**
   * Generate unique report ID
   */
  private static generateReportId(): string {
    return `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
