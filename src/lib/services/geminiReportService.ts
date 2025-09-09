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
    console.log('🚀 Starting Gemini report generation...', {
      reportType: request.reportType,
      companyName: reportData.company.name,
      redAreas: reportData.redAreas.length,
      greenAreas: reportData.greenAreas.length
    });
    
    try {
      // Generate the prompt for Gemini
      console.log('📝 Creating Gemini prompt...');
      const prompt = this.createGeminiPrompt(reportData, request);
      console.log('✅ Prompt created successfully', {
        systemPromptLength: prompt.systemPrompt.length,
        dataContextLength: prompt.dataContext.length,
        analysisInstructionsLength: prompt.analysisInstructions.length
      });
      
      // Call Vertex AI Gemini 2.5 Pro
      console.log('🤖 Calling Gemini API...');
      const geminiResponse = await this.callVertexAI(prompt);
      console.log('✅ Gemini API call completed successfully');
      
      // Save a summary debug file that links everything together
      const summaryDebugData = {
        timestamp: new Date().toISOString(),
        reportGeneration: {
          reportId: this.generateReportId(),
          companyName: reportData.company.name,
          reportType: request.reportType,
          redAreasCount: reportData.redAreas.length,
          greenAreasCount: reportData.greenAreas.length
        },
        files: {
          request: `gemini-debug-request-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
          response: `gemini-debug-response-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
          finalResult: `gemini-debug-final-result-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
          summary: `gemini-debug-summary-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
        },
        geminiResponse: {
          hasContent: !!geminiResponse.content,
          contentLength: geminiResponse.content?.length || 0,
          confidence: geminiResponse.confidence,
          processingTime: geminiResponse.processingTime
        }
      };
      
      await this.saveDebugData('summary', summaryDebugData);
      
      // Process the response and generate PDF
      const reportId = this.generateReportId();
      console.log('📄 Generating PDF with report ID:', reportId);
      
      try {
        const pdfUrl = await this.generatePDF(geminiResponse, reportData, request);
        console.log('✅ PDF generated successfully:', pdfUrl);
        
        const finalResponse = {
          reportId,
          status: 'completed' as const,
          downloadUrl: pdfUrl,
          preview: geminiResponse.summary || (geminiResponse.content ? geminiResponse.content.substring(0, 500) : 'Report generated successfully')
        };
        
        return finalResponse;
      } catch (pdfError) {
        console.error('❌ PDF generation failed:', pdfError);
        // Return with the content but mark as needing PDF regeneration
        return {
          reportId,
          status: 'completed' as const,
          downloadUrl: '', // Empty URL indicates PDF generation failed
          preview: 'Report content generated but PDF creation failed. Please try downloading again.',
          content: geminiResponse.content // Store the content for retry
        };
      }
      
    } catch (error) {
      console.error('❌ Report generation failed:', error);
      console.error('📊 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        reportData: {
          companyName: reportData.company.name,
          redAreasCount: reportData.redAreas.length,
          greenAreasCount: reportData.greenAreas.length
        }
      });
      
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
    
    // Customize system prompt based on report type
    const getSystemPrompt = () => {
      const basePrompt = `You are an expert environmental data analyst and report writer specializing in satellite-based environmental impact assessment. You have expertise in:

- Remote sensing data interpretation (NDVI, NDWI, NDBI, elevation, slope)
- Environmental impact assessment methodologies
- Statistical analysis and significance testing
- Corporate sustainability reporting
- Technical and executive communication`;

      switch (request.reportType) {
        case 'summary':
          return `${basePrompt}

For this EXECUTIVE SUMMARY report, focus on:
- High-level insights and key findings only
- Business implications and strategic recommendations
- Clear, non-technical language
- Concise bullet points and executive-friendly format
- Maximum 2-3 pages of content`;

        case 'technical':
          return `${basePrompt}

For this TECHNICAL DEEP-DIVE report, provide:
- Detailed scientific analysis with methodological rigor
- Statistical tests and confidence intervals
- Technical terminology and precise measurements
- Comprehensive data tables and technical specifications
- In-depth interpretation of all environmental indices
- Detailed methodology and uncertainty analysis`;

        case 'comprehensive':
        default:
          return `${basePrompt}

Your task is to analyze environmental data comparing operational areas (red zones) with environmentally similar reference areas (green zones) and generate comprehensive insights about environmental impact, risks, and opportunities.`;
      }
    };
    
    const systemPrompt = getSystemPrompt();

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

    // Customize analysis instructions based on report type
    const getAnalysisInstructions = () => {
      switch (request.reportType) {
        case 'summary':
          return `
EXECUTIVE SUMMARY ANALYSIS REQUIREMENTS:

1. KEY FINDINGS (100-150 words)
   - Top 3-5 most critical environmental impacts
   - Primary difference between operational and reference areas
   - Overall risk level (low/medium/high) with justification

2. BUSINESS IMPLICATIONS (100-150 words)
   - Operational risks and opportunities
   - Regulatory compliance considerations
   - Reputation and stakeholder impacts

3. STRATEGIC RECOMMENDATIONS (100-150 words)
   - Top 3 actionable recommendations
   - Expected ROI and timeframes
   - Quick wins vs long-term initiatives

FOCUS ON:
- Executive-level language (avoid technical jargon)
- Clear action items
- Business value and risk mitigation
- Concise, impactful statements
`;

        case 'technical':
          return `
TECHNICAL DEEP-DIVE ANALYSIS REQUIREMENTS:

1. METHODOLOGICAL FRAMEWORK
   - Detailed data collection methodology
   - Sensor specifications and data quality metrics
   - Statistical models and assumptions
   - Uncertainty quantification

2. COMPREHENSIVE ENVIRONMENTAL INDICES ANALYSIS
   - NDVI: Temporal patterns, statistical distribution, anomaly detection
   - NDWI: Water stress indicators, seasonal variations
   - NDBI: Urban heat island quantification, imperviousness metrics
   - Elevation/Slope: Terrain analysis, erosion susceptibility modeling
   - Include formulas, calculations, and error margins

3. ADVANCED STATISTICAL ANALYSIS
   - Multivariate analysis of variance (MANOVA)
   - Time series decomposition and trend analysis
   - Spatial autocorrelation tests
   - Effect sizes with confidence intervals
   - P-values and statistical power analysis

4. PREDICTIVE MODELING
   - Environmental degradation projections
   - Climate change impact scenarios
   - Risk probability distributions
   - Monte Carlo simulations for uncertainty

5. DETAILED TECHNICAL RECOMMENDATIONS
   - Specific remediation technologies
   - Environmental monitoring protocols
   - Data collection improvements
   - Scientific validation methods

FOCUS ON:
- Technical accuracy and precision
- Peer-review quality analysis
- Comprehensive data tables
- Scientific references and citations
- Detailed mathematical formulations
`;

        case 'comprehensive':
        default:
          return `
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
      }
    };

    const analysisInstructions = getAnalysisInstructions();

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

    // Customize output format based on report type
    const getOutputFormat = () => {
      const baseFormat = `# ENVIRONMENTAL IMPACT ASSESSMENT REPORT
## ${reportData.company.name} - ${reportData.company.industry}
### Report Type: ${request.reportType === 'summary' ? 'Executive Summary' : request.reportType === 'technical' ? 'Technical Deep-Dive' : 'Comprehensive Analysis'}
### Generated: ${new Date().toLocaleDateString()}`;

      switch (request.reportType) {
        case 'summary':
          return `
OUTPUT FORMAT FOR EXECUTIVE SUMMARY:

${baseFormat}

### KEY FINDINGS
[Bullet points with top 3-5 findings, each 1-2 sentences]

### IMPACT ASSESSMENT
- **Overall Environmental Impact**: [Low/Medium/High]
- **Primary Concern**: [One sentence]
- **Opportunity Area**: [One sentence]

### BUSINESS IMPLICATIONS
[3-4 bullet points, business-focused language]

### RECOMMENDATIONS
1. **Immediate Action**: [Specific recommendation with timeframe]
2. **Short-term (3-6 months)**: [Specific recommendation]
3. **Long-term (12+ months)**: [Strategic initiative]

### NEXT STEPS
[2-3 concrete action items]

Keep the entire report to 2-3 pages maximum. Use clear, non-technical language.
`;

        case 'technical':
          return `
OUTPUT FORMAT FOR TECHNICAL REPORT:

${baseFormat}

### EXECUTIVE SUMMARY
[Technical abstract, 200 words]

### METHODOLOGY
#### Data Acquisition
- Sensor Specifications: [Details]
- Temporal Resolution: [Details]
- Spatial Resolution: ${reportData.metadata.spatial_resolution}
- Processing Chain: [Details]

#### Statistical Methods
[Detailed methodology description]

### ENVIRONMENTAL INDICES ANALYSIS
#### NDVI Analysis
- Mean: [value ± std]
- Temporal Trend: [equation]
- Statistical Significance: [p-value]
[Include formulas and calculations]

#### NDWI Analysis
[Similar detailed structure]

#### NDBI Analysis
[Similar detailed structure]

### STATISTICAL RESULTS
#### Comparative Statistics
[Include detailed tables with test statistics, p-values, effect sizes]

#### Time Series Analysis
[Include decomposition results, trend tests]

### PREDICTIVE MODELING
[Model specifications, validation metrics, projections]

### TECHNICAL RECOMMENDATIONS
[Detailed technical solutions with specifications]

### APPENDICES
A. Data Quality Metrics
B. Statistical Test Assumptions
C. Uncertainty Analysis

Include all formulas, technical specifications, and comprehensive data tables.
`;

        case 'comprehensive':
        default:
          return `
OUTPUT FORMAT:

Provide your analysis in the following structured format:

${baseFormat}

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
      }
    };

    const outputFormat = getOutputFormat();

    return {
      systemPrompt,
      dataContext,
      analysisInstructions,
      visualizationRequirements,
      outputFormat
    };
  }

  /**
   * Save data to JSON file for debugging
   */
  private static async saveDebugData(filename: string, data: any): Promise<void> {
    try {
      // Only save debug data in development mode or when explicitly enabled
      const DEBUG_MODE = process.env.NODE_ENV === 'development' && window.location.search.includes('debug=true');
      
      if (!DEBUG_MODE) {
        // Just log to console in production
        console.log(`📁 Debug data (${filename}):`, data);
        return;
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const debugFilename = `gemini-debug-${filename}-${timestamp}.json`;
      
      // Create a downloadable JSON file only in debug mode
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = debugFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`📁 Debug file saved: ${debugFilename}`);
    } catch (error) {
      console.error('❌ Failed to save debug data:', error);
    }
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

    console.log('🤖 Gemini API Request - Vertex AI payload:', apiPayload);

    // Real Gemini API call through Firebase Functions (falls back to local for dev)
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? (import.meta.env.VITE_API_URL_PRODUCTION || '/api/gemini')  // Firebase Functions endpoint
      : (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api/gemini'; // Local development
    
    console.log('🔗 Making Gemini API request to:', apiUrl);
    
    const requestPayload = {
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
    };
    
    console.log('📤 Gemini Request Payload:', {
      contentLength: fullPrompt.length,
      generationConfig: requestPayload.generationConfig,
      apiUrl
    });
    
    // Save the complete request data to JSON file
    const requestDebugData = {
      timestamp: new Date().toISOString(),
      apiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      fullPrompt: fullPrompt,
      promptStructure: {
        systemPromptLength: prompt.systemPrompt.length,
        dataContextLength: prompt.dataContext.length,
        analysisInstructionsLength: prompt.analysisInstructions.length,
        visualizationRequirementsLength: prompt.visualizationRequirements.length,
        outputFormatLength: prompt.outputFormat.length
      },
      requestPayload: requestPayload
    };
    
    await this.saveDebugData('request', requestDebugData);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    console.log('📡 Gemini API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      console.error('❌ Gemini API request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl
      });
      throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📥 Raw Gemini API Response received - saving to file...');
    
    // Save the complete response data to JSON file
    const responseDebugData = {
      timestamp: new Date().toISOString(),
      responseStatus: response.status,
      responseStatusText: response.statusText,
      responseHeaders: Object.fromEntries(response.headers.entries()),
      rawResponse: data,
      extractedContent: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      contentLength: (data.candidates?.[0]?.content?.parts?.[0]?.text || '').length
    };
    
    await this.saveDebugData('response', responseDebugData);
    
    if (data.error) {
      console.error('❌ Gemini API returned error:', data.error);
      throw new Error(`Gemini API error: ${data.error.message}`);
    }

    // Extract the generated content
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const result = {
      content: generatedText,
      summary: generatedText.substring(0, 500) + '...',
      confidence: 0.95,
      processingTime: 2.3
    };
    
    // Save the final processed result to JSON file
    const finalResultDebugData = {
      timestamp: new Date().toISOString(),
      result: result,
      contentStats: {
        contentLength: result.content.length,
        summaryLength: result.summary.length,
        confidence: result.confidence,
        processingTime: result.processingTime
      },
      contentPreview: generatedText.substring(0, 500) + '...'
    };
    
    await this.saveDebugData('final-result', finalResultDebugData);
    console.log('✅ Gemini API processing complete - all debug data saved to JSON files');
    
    return result;
  }

  /**
   * Generate simple, clean PDF from Gemini analysis with proper multi-page content handling
   */
  private static async generatePDF(
    geminiResponse: any,
    reportData: ReportData,
    request: ReportRequest
  ): Promise<string> {
    console.log('📄 Starting simple PDF generation...');
    
    try {
      const jsPDF = (await import('jspdf')).default;
      console.log('✅ jsPDF library loaded successfully');
      
      // Handle different response formats
      let reportContent = '';
      if (geminiResponse.candidates && geminiResponse.candidates[0]?.content?.parts?.[0]?.text) {
        reportContent = geminiResponse.candidates[0].content.parts[0].text;
      } else if (geminiResponse.content) {
        reportContent = geminiResponse.content;
      } else if (typeof geminiResponse === 'string') {
        reportContent = geminiResponse;
      } else {
        reportContent = 'Report content not available';
      }
      
      console.log('📝 Processing content for simple PDF:', {
        contentLength: reportContent.length,
        hasContent: !!reportContent
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Simple PDF constants
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      const lineHeight = 6;
      const linesPerPage = Math.floor((pageHeight - (margin * 2) - 20) / lineHeight); // Reserve space for page number
      let currentY = margin;
      let pageNumber = 1;

      // Helper function to add page number
      const addPageNumber = () => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      };

      // Helper function to check if we need a new page
      const checkNewPage = (linesNeeded: number = 1) => {
        if (currentY + (linesNeeded * lineHeight) > pageHeight - 20) {
          addPageNumber();
          pdf.addPage();
          pageNumber++;
          currentY = margin;
        }
      };

      // Helper function to add text with proper line wrapping and page breaks
      const addText = (text: string, fontSize: number = 11, fontStyle: string = 'normal', isHeading: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', fontStyle);
        pdf.setTextColor(0, 0, 0);
        
        const lines = pdf.splitTextToSize(text, contentWidth);
        
        // For headings, ensure we don't break them across pages
        if (isHeading && lines.length > 1) {
          checkNewPage(lines.length + 1);
        } else {
          checkNewPage(lines.length);
        }
        
        lines.forEach((line: string, index: number) => {
          checkNewPage(1);
          pdf.text(line, margin, currentY + lineHeight);
          currentY += lineHeight;
        });
        
        // Add extra space after headings
        if (isHeading) {
          currentY += lineHeight * 0.5;
        } else {
          currentY += lineHeight * 0.3; // Small spacing between paragraphs
        }
      };

      // Title page - simple header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Environmental Impact Report', pageWidth / 2, currentY + 10, { align: 'center' });
      currentY += 20;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(reportData.company.name, pageWidth / 2, currentY + 10, { align: 'center' });
      currentY += 15;

      pdf.setFontSize(12);
      pdf.text(`Industry: ${reportData.company.industry}`, pageWidth / 2, currentY + 5, { align: 'center' });
      currentY += 10;

      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY + 5, { align: 'center' });
      currentY += 20;

      // Simple horizontal line
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 15;

      // Basic company information section
      addText('COMPANY INFORMATION', 14, 'bold', true);
      addText(`Company: ${reportData.company.name}`);
      addText(`Industry: ${reportData.company.industry}`);
      addText(`Analysis Date: ${reportData.company.analysisDate}`);
      addText(`Report Type: ${request.reportType}`);
      currentY += 10;

      // Basic metrics
      addText('ENVIRONMENTAL METRICS OVERVIEW', 14, 'bold', true);
      
      // Red areas summary
      if (reportData.redAreas?.length > 0) {
        addText('Operational Areas (Red Zones):', 12, 'bold');
        addText(`Total Areas Analyzed: ${reportData.redAreas.length}`);
        
        const firstRed = reportData.redAreas[0];
        if (firstRed?.environmentalData) {
          const env = firstRed.environmentalData;
          addText(`Vegetation Index (NDVI): ${typeof env.ndvi === 'number' ? env.ndvi.toFixed(3) : (env.ndvi?.mean?.toFixed(3) || 'N/A')}`);
          addText(`Water Index (NDWI): ${typeof env.ndwi === 'number' ? env.ndwi.toFixed(3) : (env.ndwi?.mean?.toFixed(3) || 'N/A')}`);
          addText(`Elevation: ${typeof env.elevation === 'number' ? env.elevation.toFixed(0) + 'm' : (env.elevation?.mean?.toFixed(0) + 'm' || 'N/A')}`);
        }
        currentY += 8;
      }

      // Green areas summary
      if (reportData.greenAreas?.length > 0) {
        addText('Reference Areas (Green Zones):', 12, 'bold');
        addText(`Total Areas Analyzed: ${reportData.greenAreas.length}`);
        
        const firstGreen = reportData.greenAreas[0];
        if (firstGreen?.environmentalData) {
          const env = firstGreen.environmentalData;
          addText(`Vegetation Index (NDVI): ${typeof env.ndvi === 'number' ? env.ndvi.toFixed(3) : (env.ndvi?.mean?.toFixed(3) || 'N/A')}`);
          addText(`Water Index (NDWI): ${typeof env.ndwi === 'number' ? env.ndwi.toFixed(3) : (env.ndwi?.mean?.toFixed(3) || 'N/A')}`);
          addText(`Elevation: ${typeof env.elevation === 'number' ? env.elevation.toFixed(0) + 'm' : (env.elevation?.mean?.toFixed(0) + 'm' || 'N/A')}`);
        }
        currentY += 15;
      }

      // AI Analysis - main content with intelligent pagination
      addText('AI ENVIRONMENTAL ANALYSIS', 14, 'bold', true);
      
      // Parse the content into logical sections
      const contentSections = this.parseContentIntoSections(reportContent);
      
      for (const section of contentSections) {
        if (section.type === 'heading') {
          addText(section.content, 13, 'bold', true);
        } else if (section.type === 'paragraph') {
          addText(section.content, 11, 'normal');
        } else if (section.type === 'list') {
          // Handle bullet points and lists
          addText(section.content, 11, 'normal');
        }
      }

      // Data sources footer section
      currentY += 10;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;
      
      addText('DATA SOURCES & METHODOLOGY', 12, 'bold', true);
      addText('Satellite Data: Google Earth Engine (Landsat, Sentinel)');
      addText('AI Analysis: Google Gemini 2.5 Pro');
      addText(`Analysis Period: ${reportData.metadata?.temporal_coverage?.start_date || '2020-01-01'} to ${reportData.metadata?.temporal_coverage?.end_date || '2025-09-09'}`);
      addText(`Spatial Resolution: ${reportData.metadata?.spatial_resolution || '30m'}`);
      addText(`Confidence Level: ${(reportData.metadata?.confidence_level * 100 || 95).toFixed(0)}%`);

      // Add page number to final page
      addPageNumber();

      const fileName = `${reportData.company.name.replace(/[^a-zA-Z0-9]/g, '_')}_Environmental_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('💾 Saving simple PDF:', fileName);
      pdf.save(fileName);
      
      console.log('🎉 Simple PDF generation completed!', {
        fileName,
        totalPages: pdf.getNumberOfPages(),
        companyName: reportData.company.name
      });
      
      return `downloaded://${fileName}`;
      
    } catch (error) {
      console.error('❌ Simple PDF generation failed:', error);
      throw new Error(`Failed to generate simple PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse content into logical sections for better pagination
   */
  private static parseContentIntoSections(content: string) {
    const sections: Array<{type: 'heading' | 'paragraph' | 'list', content: string}> = [];
    
    // Split content into paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      
      // Detect headings (lines starting with # or all caps)
      if (trimmed.startsWith('#')) {
        sections.push({
          type: 'heading',
          content: trimmed.replace(/^#+\s*/, '')
        });
      } else if (trimmed.match(/^[A-Z][A-Z\s]{10,}:?\s*$/) && trimmed.length < 100) {
        // All caps headings (likely section headers)
        sections.push({
          type: 'heading', 
          content: trimmed
        });
      } else if (trimmed.includes('•') || trimmed.includes('-') || 
                 trimmed.match(/^\d+\./) || trimmed.includes('\n-') || 
                 trimmed.includes('\n•')) {
        // Lists and bullet points
        sections.push({
          type: 'list',
          content: trimmed
        });
      } else {
        // Regular paragraphs
        sections.push({
          type: 'paragraph',
          content: trimmed
        });
      }
    }
    
    return sections;
  }


  /**
   * Generate unique report ID
   */
  private static generateReportId(): string {
    return `RPT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
