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
      const jsPDF = (await import('jspdf')).default;
      
      const reportContent = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 
                           geminiResponse.content || 
                           'Report content not available';
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Enhanced styling constants
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      const colors = {
        primary: [52, 152, 219] as [number, number, number],
        success: [34, 139, 34] as [number, number, number],
        danger: [220, 20, 60] as [number, number, number],
        dark: [33, 37, 41] as [number, number, number],
        light: [248, 249, 250] as [number, number, number],
        text: [0, 0, 0] as [number, number, number],
        muted: [108, 117, 125] as [number, number, number]
      };

      // Enhanced helper functions
      const addHeader = (pageNumber: number) => {
        // Professional gradient header
        pdf.setFillColor(...colors.primary);
        pdf.rect(0, 0, pageWidth, 35, 'F');
        
        // Accent line
        pdf.setFillColor(colors.primary[0] + 30, colors.primary[1] + 30, colors.primary[2] + 30);
        pdf.rect(0, 30, pageWidth, 5, 'F');
        
        // Company logo placeholder
        pdf.setFillColor(255, 255, 255);
        pdf.circle(25, 17.5, 10, 'F');
        pdf.setTextColor(...colors.primary);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🌍', 20, 21);
        
        // Title
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Environmental Impact Report', 45, 20);
        
        // Subtitle
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${reportData.company.name} • ${reportData.company.industry}`, 45, 27);
        
        // Page number
        pdf.setFontSize(9);
        pdf.text(`Page ${pageNumber}`, pageWidth - margin, 20, { align: 'right' });
        
        currentY = 45;
      };

      const addFooter = () => {
        // Footer background
        pdf.setFillColor(...colors.light);
        pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
        
        // Border line
        pdf.setDrawColor(...colors.primary);
        pdf.setLineWidth(0.5);
        pdf.line(0, pageHeight - 25, pageWidth, pageHeight - 25);
        
        pdf.setTextColor(...colors.muted);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        
        // Platform branding
        pdf.text('ProtectEarth Environmental Monitoring Platform', margin, pageHeight - 16);
        pdf.text('Powered by Google Earth Engine & Gemini 2.5 Pro AI', margin, pageHeight - 11);
        
        // Generation info
        const dateText = `Generated: ${new Date().toLocaleDateString()}`;
        pdf.text(dateText, pageWidth - margin, pageHeight - 16, { align: 'right' });
        pdf.text(`Total Pages: ${pdf.getNumberOfPages()}`, pageWidth - margin, pageHeight - 11, { align: 'right' });
      };

      const checkNewPage = (requiredSpace: number = 20) => {
        if (currentY + requiredSpace > pageHeight - 40) {
          pdf.addPage();
          currentY = margin;
          addHeader(pdf.getNumberOfPages());
        }
      };

      const addSectionHeader = (title: string, icon: string, color: [number, number, number] = colors.primary) => {
        checkNewPage(25);
        
        // Section background with gradient effect
        pdf.setFillColor(color[0], color[1], color[2], 0.1);
        pdf.rect(margin - 5, currentY - 3, contentWidth + 10, 20, 'F');
        
        // Left accent bar
        pdf.setFillColor(...color);
        pdf.rect(margin - 5, currentY - 3, 4, 20, 'F');
        
        // Section title
        pdf.setTextColor(...color);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${icon} ${title}`, margin + 5, currentY + 10);
        
        currentY += 25;
      };

      const addMetricCard = (title: string, metrics: string[], bgColor: [number, number, number], titleColor: [number, number, number]) => {
        const cardHeight = metrics.length * 6 + 20;
        checkNewPage(cardHeight + 10);
        
        // Card shadow effect
        pdf.setFillColor(0, 0, 0, 0.1);
        pdf.rect(margin + 2, currentY + 2, contentWidth, cardHeight, 'F');
        
        // Card background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(margin, currentY, contentWidth, cardHeight, 'F');
        
        // Card border
        pdf.setDrawColor(bgColor[0], bgColor[1], bgColor[2], 0.3);
        pdf.setLineWidth(1);
        pdf.rect(margin, currentY, contentWidth, cardHeight);
        
        // Card header
        pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2], 0.1);
        pdf.rect(margin, currentY, contentWidth, 15, 'F');
        
        // Title
        pdf.setTextColor(...titleColor);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin + 8, currentY + 10);
        
        // Metrics
        pdf.setTextColor(...colors.text);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        metrics.forEach((metric, i) => {
          pdf.text(`• ${metric}`, margin + 10, currentY + 20 + (i * 6));
        });
        
        currentY += cardHeight + 10;
      };

      const addVisualChart = (title: string, redValue: number, greenValue: number, unit: string = '') => {
        checkNewPage(45);
        
        // Chart title
        pdf.setTextColor(...colors.text);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, currentY);
        currentY += 10;
        
        // Chart background
        pdf.setFillColor(...colors.light);
        pdf.rect(margin, currentY, contentWidth, 30, 'F');
        pdf.setDrawColor(...colors.muted);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, currentY, contentWidth, 30);
        
        // Calculate bar widths
        const maxValue = Math.max(Math.abs(redValue), Math.abs(greenValue), 1);
        const barMaxWidth = contentWidth * 0.6;
        const redWidth = (Math.abs(redValue) / maxValue) * barMaxWidth;
        const greenWidth = (Math.abs(greenValue) / maxValue) * barMaxWidth;
        
        // Red zone bar
        pdf.setFillColor(...colors.danger, 0.8);
        pdf.rect(margin + 10, currentY + 5, redWidth, 8, 'F');
        
        // Green zone bar
        pdf.setFillColor(...colors.success, 0.8);
        pdf.rect(margin + 10, currentY + 17, greenWidth, 8, 'F');
        
        // Value labels
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...colors.danger);
        pdf.text(`Red Zone: ${redValue.toFixed(3)}${unit}`, margin + redWidth + 15, currentY + 10);
        pdf.setTextColor(...colors.success);
        pdf.text(`Green Zone: ${greenValue.toFixed(3)}${unit}`, margin + greenWidth + 15, currentY + 22);
        
        currentY += 40;
      };

      // Start first page
      addHeader(1);

      // Executive Summary
      checkNewPage(60);
      pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.05);
      pdf.rect(margin - 5, currentY - 5, contentWidth + 10, 55, 'F');
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXECUTIVE SUMMARY', margin, currentY + 10);
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const summaryText = `This comprehensive environmental impact assessment analyzes ${reportData.company.name}'s operational footprint using advanced satellite imagery and AI-powered analysis. The report provides detailed comparisons between operational areas and environmentally similar reference regions to identify potential impacts and sustainability opportunities.`;
      const summaryLines = pdf.splitTextToSize(summaryText, contentWidth - 10);
      
      let summaryY = currentY + 22;
      summaryLines.forEach((line: string) => {
        pdf.text(line, margin, summaryY);
        summaryY += 5;
      });
      
      currentY += 60;

      // Enhanced metrics section
      addSectionHeader('Environmental Metrics Overview', '📊');

      // Visual comparisons
      const redData = reportData.redAreas?.[0]?.environmentalData;
      const greenData = reportData.greenAreas?.[0]?.environmentalData;
      
      if (redData && greenData) {
        const redNDVI = typeof redData.ndvi === 'number' ? redData.ndvi : redData.ndvi?.mean || 0;
        const greenNDVI = typeof greenData.ndvi === 'number' ? greenData.ndvi : greenData.ndvi?.mean || 0;
        const redNDWI = typeof redData.ndwi === 'number' ? redData.ndwi : redData.ndwi?.mean || 0;
        const greenNDWI = typeof greenData.ndwi === 'number' ? greenData.ndwi : greenData.ndwi?.mean || 0;
        const redElevation = typeof redData.elevation === 'number' ? redData.elevation : redData.elevation?.mean || 0;
        const greenElevation = typeof greenData.elevation === 'number' ? greenData.elevation : greenData.elevation?.mean || 0;
        
        addVisualChart('Vegetation Health Index (NDVI)', redNDVI, greenNDVI);
        addVisualChart('Water Content Index (NDWI)', redNDWI, greenNDWI);
        addVisualChart('Elevation Comparison', redElevation, greenElevation, 'm');
      }

      // Helper function to safely format environmental data
      const formatMetric = (value: any, decimals: number = 2): string => {
        if (typeof value === 'number') {
          return value.toFixed(decimals);
        }
        if (value && typeof value === 'object' && 'mean' in value) {
          return value.mean.toFixed(decimals);
        }
        if (value && typeof value === 'object' && 'annual' in value) {
          return value.annual.toFixed(decimals);
        }
        return 'N/A';
      };

      // Detailed metric cards
      if (reportData.redAreas?.length > 0) {
        const redArea = reportData.redAreas[0];
        const envData = redArea.environmentalData;
        const redMetrics = [
          `Total Areas Analyzed: ${reportData.redAreas.length}`,
          `Vegetation Index (NDVI): ${formatMetric(envData?.ndvi, 3)}`,
          `Water Index (NDWI): ${formatMetric(envData?.ndwi, 3)}`,
          `Average Elevation: ${formatMetric(envData?.elevation, 0)}m`,
          `Temperature: ${formatMetric(envData?.temperature, 1)}°C`,
          `Annual Precipitation: ${formatMetric(envData?.precipitation, 0)}mm`
        ];
        addMetricCard('🔴 Operational Areas (Red Zones)', redMetrics, colors.danger, colors.danger);
      }

      if (reportData.greenAreas?.length > 0) {
        const greenArea = reportData.greenAreas[0];
        const envData = greenArea.environmentalData;
        const greenMetrics = [
          `Total Areas Analyzed: ${reportData.greenAreas.length}`,
          `Vegetation Index (NDVI): ${formatMetric(envData?.ndvi, 3)}`,
          `Water Index (NDWI): ${formatMetric(envData?.ndwi, 3)}`,
          `Average Elevation: ${formatMetric(envData?.elevation, 0)}m`,
          `Temperature: ${formatMetric(envData?.temperature, 1)}°C`,
          `Annual Precipitation: ${formatMetric(envData?.precipitation, 0)}mm`
        ];
        addMetricCard('🟢 Reference Areas (Green Zones)', greenMetrics, colors.success, colors.success);
      }

      // AI Analysis with enhanced formatting
      addSectionHeader('AI-Powered Environmental Analysis', '🤖');

      const paragraphs = reportContent.split(/\n\n+/);
      
      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) continue;
        
        checkNewPage(15);
        
        // Enhanced heading formatting
        if (paragraph.trim().startsWith('#')) {
          const heading = paragraph.replace(/^#+\s*/, '');
          
          // Heading background
          pdf.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2], 0.1);
          pdf.rect(margin, currentY - 3, contentWidth, 15, 'F');
          
          pdf.setFontSize(13);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colors.primary);
          
          const headingLines = pdf.splitTextToSize(heading, contentWidth - 10);
          headingLines.forEach((line: string) => {
            checkNewPage(8);
            pdf.text(line, margin + 5, currentY + 8);
            currentY += 6;
          });
          currentY += 10;
          continue;
        }
        
        // Enhanced list formatting
        if (paragraph.includes('•') || paragraph.includes('-') || paragraph.toLowerCase().includes('recommendation')) {
          pdf.setFillColor(colors.light[0], colors.light[1], colors.light[2], 0.5);
          const lines = pdf.splitTextToSize(paragraph.trim(), contentWidth - 15);
          pdf.rect(margin, currentY, contentWidth, lines.length * 5 + 8, 'F');
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...colors.text);
          
          lines.forEach((line: string) => {
            checkNewPage(6);
            pdf.text(line, margin + 8, currentY + 6);
            currentY += 5;
          });
          currentY += 10;
          continue;
        }
        
        // Regular paragraphs with better spacing
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...colors.text);
        
        const lines = pdf.splitTextToSize(paragraph.trim(), contentWidth);
        checkNewPage(lines.length * 5 + 8);
        
        lines.forEach((line: string) => {
          checkNewPage(6);
          pdf.text(line, margin, currentY);
          currentY += 5;
        });
        currentY += 8;
      }

      // Enhanced methodology section
      addSectionHeader('Methodology & Data Sources', '📊', colors.dark);

      const methodologyData = [
        {
          title: '🛰️ Satellite Data Sources',
          items: [
            'Google Earth Engine Platform',
            'Landsat 8/9 Multispectral Imagery (30m resolution)',
            'SRTM Digital Elevation Model',
            'MODIS Land Cover Classification'
          ]
        },
        {
          title: '📅 Analysis Parameters', 
          items: [
            `Analysis Period: ${reportData.metadata?.temporal_coverage?.start_date || '2020-01-01'} to ${reportData.metadata?.temporal_coverage?.end_date || '2025-09-09'}`,
            `Spatial Resolution: ${reportData.metadata?.spatial_resolution || '30m'}`,
            `Confidence Level: ${reportData.metadata?.confidence_level || '95%'}`,
            `Coordinate System: WGS84 (EPSG:4326)`
          ]
        },
        {
          title: '🤖 AI & Processing',
          items: [
            'AI Model: Google Gemini 2.5 Pro',
            'Environmental Impact Assessment Framework',
            'Statistical Comparative Analysis',
            'Multi-spectral Index Calculations'
          ]
        }
      ];

      methodologyData.forEach(section => {
        addMetricCard(section.title, section.items, colors.light, colors.dark);
      });

      // Add footers to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addFooter();
      }
      
      const fileName = `${reportData.company.name.replace(/[^a-zA-Z0-9]/g, '_')}_Environmental_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('📄 Enhanced multi-page PDF generated:', fileName);
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
