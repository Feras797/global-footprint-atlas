# AI-Powered Environmental Report Generation Guide

## Overview
The platform now includes comprehensive AI-powered report generation using Google Gemini 2.5 Pro. The system generates detailed environmental impact assessments as downloadable PDFs with three distinct report types.

## Features

### 🎯 Three Report Types

#### 1. **Executive Summary**
- **Length**: 2-3 pages
- **Focus**: High-level insights and business implications
- **Language**: Non-technical, executive-friendly
- **Content**: Key findings, impact assessment, strategic recommendations
- **Best For**: C-suite executives, board presentations, stakeholder communications

#### 2. **Technical Deep-Dive**
- **Length**: 10-15 pages
- **Focus**: Scientific analysis and detailed methodology
- **Language**: Technical, peer-review quality
- **Content**: Statistical analysis, formulas, comprehensive data tables
- **Best For**: Environmental scientists, regulatory compliance, technical audits

#### 3. **Comprehensive Analysis**
- **Length**: 5-8 pages
- **Focus**: Balanced technical and business perspective
- **Language**: Professional, accessible to varied audiences
- **Content**: Full environmental assessment with all metrics
- **Best For**: Environmental managers, sustainability teams, general reporting

## Setup Instructions

### Development Environment

1. **Start the Mock Server** (for development without Google Cloud):
```bash
npm run server:mock
```
This starts a mock Gemini server on port 3001 that returns realistic sample reports.

2. **Start the Application**:
```bash
npm run dev
```

### Production Environment

1. **Prerequisites**:
   - Google Cloud SDK installed and authenticated
   - Access to the Gemini 2.5 Pro API
   - Valid GCP project credentials

2. **Start the Production Server**:
```bash
npm run server
```

3. **Deploy to Firebase** (optional):
```bash
npm run build
firebase deploy
```

## How to Generate Reports

### Step 1: Navigate to Company Analysis
1. Go to Companies section
2. Select a company (e.g., Électricité de France SA)
3. Click on the company to view details

### Step 2: Run Satellite Analysis
1. In the company page, go to "Satellite Analysis" tab
2. Click "Search Similar Areas" to analyze environmental data
3. Wait for the analysis to complete (red and green areas will appear on the map)

### Step 3: Generate AI Report
1. Switch to the "AI Reports" tab
2. Select your desired report type:
   - **Comprehensive**: Full analysis with all metrics
   - **Executive Summary**: Key insights for leadership
   - **Technical Deep-dive**: Detailed scientific analysis
3. Check "Include visualization specifications" if needed
4. Click "Generate AI Report"
5. Wait for processing (progress bar will show status)
6. Once complete, click "Download PDF"

## Technical Architecture

### Components

1. **Frontend Components**:
   - `ReportGenerator.tsx`: Main UI component for report generation
   - `useReportGeneration.ts`: React hook managing report state

2. **Backend Services**:
   - `geminiReportService.ts`: Core service handling Gemini API integration
   - `reportDataService.ts`: Data transformation and preprocessing
   - `server.js`: Production server with Google Cloud authentication
   - `server-mock.js`: Development server with mock responses

3. **PDF Generation**:
   - Uses jsPDF library for client-side PDF creation
   - Custom formatting with charts, tables, and professional styling
   - Automatic pagination and layout management

### Data Flow

```
User Request → React Component → Report Hook → Data Service → Gemini Service
                                                                      ↓
                                                              Gemini API Call
                                                                      ↓
PDF Download ← PDF Generation ← Response Processing ← AI-Generated Content
```

## API Integration

### Gemini 2.5 Pro Configuration
- **Model**: `gemini-2.5-pro`
- **Region**: `europe-west1`
- **Temperature**: 0.1 (for factual, consistent analysis)
- **Max Tokens**: 8192
- **Top-K**: 40
- **Top-P**: 0.8

### Request Structure
```javascript
{
  contents: [{
    role: 'user',
    parts: [{
      text: customizedPrompt
    }]
  }],
  generationConfig: {
    temperature: 0.1,
    maxOutputTokens: 8192,
    topP: 0.8,
    topK: 40
  }
}
```

## Customization

### Modifying Report Prompts
Edit `src/lib/services/geminiReportService.ts`:
- `getSystemPrompt()`: Customize AI role and expertise
- `getAnalysisInstructions()`: Modify analysis requirements
- `getOutputFormat()`: Change report structure

### Adjusting PDF Styling
Edit the `generatePDF()` method in `geminiReportService.ts`:
- Colors, fonts, and layout
- Chart configurations
- Page headers and footers

## Debugging

### Enable Debug Mode
The system automatically saves debug files when generating reports:
- `gemini-debug-request-*.json`: Full request payload
- `gemini-debug-response-*.json`: Raw API response
- `gemini-debug-final-result-*.json`: Processed result
- `gemini-debug-summary-*.json`: Generation summary

### Common Issues

1. **"Failed to call Gemini API"**
   - Check if the server is running (`npm run server` or `npm run server:mock`)
   - Verify Google Cloud authentication
   - Ensure CORS is properly configured

2. **PDF Not Downloading**
   - Check browser console for errors
   - Verify jsPDF is properly installed
   - Check for popup blockers

3. **Empty Report Content**
   - Ensure red and green areas data is available
   - Check Gemini API response format
   - Verify data transformation in `reportDataService.ts`

## Testing

### Quick Test Workflow
1. Start mock server: `npm run server:mock`
2. Start dev server: `npm run dev`
3. Navigate to any company
4. Go to AI Reports tab
5. Generate a report (mock data will be used)
6. Verify PDF downloads successfully

### Production Testing
1. Ensure Google Cloud SDK is authenticated
2. Start production server: `npm run server`
3. Follow the same workflow with real Gemini API calls

## Performance Considerations

- **Report Generation Time**: 5-15 seconds (depending on complexity)
- **PDF Size**: 200KB - 2MB (depending on content)
- **API Rate Limits**: Respect Gemini API quotas
- **Caching**: Consider implementing response caching for identical requests

## Future Enhancements

- [ ] Batch report generation for multiple companies
- [ ] Scheduled report generation
- [ ] Email delivery of reports
- [ ] Report templates customization
- [ ] Historical report comparisons
- [ ] Multi-language support
- [ ] Export to other formats (Word, Excel)

## Support

For issues or questions:
1. Check the debug files for detailed error information
2. Review server logs for API communication issues
3. Ensure all dependencies are properly installed
4. Verify environment configuration

## License

This feature uses Google Gemini 2.5 Pro API and requires appropriate licensing and API access.
