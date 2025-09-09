# Gemini 2.5 Pro Integration Setup Guide

## Overview

This guide explains how to set up Gemini 2.5 Pro for AI-powered environmental report generation in the Global Footprint Atlas project.

## Architecture

```
GEE Data → Report Data Service → Gemini 2.5 Pro → PDF Generation → User Download
     ↓              ↓                ↓              ↓             ↓
Red Areas      Data Transform    AI Analysis    Report Format   File Delivery
Green Areas    Statistical Prep  Insights Gen   Visualization   Storage
```

## 🚀 Quick Start (Development)

The system is configured to work with mock data out-of-the-box for development:

1. **Navigate to Company Page**: Go to any company page (e.g., `/company/company1`)
2. **Run Analysis**: Switch to "Satellite Analysis" tab and wait for red/green areas to load
3. **Generate Report**: Switch to "AI Reports" tab and click "Generate AI Report"
4. **View Results**: See the mock Gemini-generated comprehensive environmental assessment

## 🔧 Production Setup

### Step 1: Google Cloud Project Setup

1. **Create/Select Google Cloud Project**:
   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Enable Required APIs**:
   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable storage.googleapis.com
   gcloud services enable earthengine.googleapis.com
   ```

3. **Create Service Account**:
   ```bash
   gcloud iam service-accounts create gemini-reports-sa \
     --description="Service account for Gemini report generation" \
     --display-name="Gemini Reports SA"
   ```

4. **Grant Permissions**:
   ```bash
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:gemini-reports-sa@your-project-id.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

5. **Download Service Account Key**:
   ```bash
   gcloud iam service-accounts keys create ./service-account-key.json \
     --iam-account=gemini-reports-sa@your-project-id.iam.gserviceaccount.com
   ```

### Step 2: Vertex AI Configuration

1. **Set Environment Variables**:
   ```bash
   export REACT_APP_GOOGLE_CLOUD_PROJECT_ID="your-project-id"
   export REACT_APP_VERTEX_AI_LOCATION="us-central1"
   export REACT_APP_VERTEX_AI_ENDPOINT="https://us-central1-aiplatform.googleapis.com"
   export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
   ```

2. **Test Vertex AI Access**:
   ```bash
   gcloud ai models list --region=us-central1
   ```

### Step 3: Update Gemini Service

Replace the mock implementation in `src/lib/services/geminiReportService.ts`:

```typescript
// Remove this line:
// return this.generateMockGeminiResponse();

// Add real Vertex AI implementation:
const response = await fetch(
  `${this.VERTEX_AI_ENDPOINT}/v1/projects/${this.PROJECT_ID}/locations/${this.LOCATION}/publishers/google/models/gemini-2.5-pro:generateContent`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await this.getAccessToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
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
  }
);
```

### Step 4: PDF Generation Setup

1. **Option A: Client-side PDF (Simple)**:
   ```bash
   npm install jspdf html2canvas
   ```

2. **Option B: Server-side PDF (Recommended)**:
   ```bash
   # Deploy a Cloud Function for PDF generation
   gcloud functions deploy generate-pdf \
     --runtime=nodejs18 \
     --trigger=http \
     --allow-unauthenticated
   ```

3. **Option C: Third-party Service**:
   - Use services like Bannerbear, PDFShift, or Documint
   - Update `REACT_APP_PDF_GENERATION_SERVICE` in environment

## 📋 Report Types & Capabilities

### Comprehensive Report
- **Content**: Full environmental impact assessment
- **Length**: 15-25 pages
- **Includes**: Executive summary, detailed analysis, statistical tests, recommendations
- **Use Case**: Regulatory compliance, detailed stakeholder reporting

### Executive Summary
- **Content**: Key insights and high-level recommendations
- **Length**: 3-5 pages
- **Includes**: Key metrics, risk assessment, action items
- **Use Case**: Board presentations, quick decision making

### Technical Deep-dive
- **Content**: Scientific analysis with methodological details
- **Length**: 20-40 pages
- **Includes**: Statistical methodology, data quality assessment, technical appendices
- **Use Case**: Scientific publications, technical audits

## 🔍 Data Analysis Capabilities

### Environmental Metrics Analyzed
- **Vegetation Health**: NDVI analysis and trends
- **Water Resources**: NDWI and surface water changes
- **Urban Development**: NDBI and built-up area analysis
- **Topography**: Elevation, slope, and terrain analysis
- **Climate**: Temperature, precipitation, humidity patterns
- **Land Cover**: Forest, urban, agricultural distributions

### Statistical Analysis
- **Comparative Tests**: ANOVA, t-tests between red and green areas
- **Effect Size**: Cohen's d, eta-squared for practical significance
- **Trend Analysis**: Time series decomposition and forecasting
- **Risk Assessment**: Multi-criteria decision analysis

### AI-Generated Insights
- **Pattern Recognition**: Automated identification of environmental anomalies
- **Causal Analysis**: Identification of potential causes for environmental changes
- **Risk Prediction**: Machine learning-based risk forecasting
- **Recommendation Engine**: Contextual mitigation strategies

## 🎯 Key Features

### Dynamic Data Handling
- **Flexible Schema**: Adapts to varying GEE data structures
- **Missing Data**: Intelligent handling of incomplete datasets
- **Quality Assessment**: Automatic data quality scoring
- **Temporal Alignment**: Smart temporal matching for time series

### Intelligent Analysis
- **Context-Aware**: Industry-specific environmental analysis
- **Regulatory Compliance**: Built-in compliance checking
- **Benchmarking**: Comparison with industry standards
- **Uncertainty Quantification**: Confidence intervals and error propagation

### Professional Reporting
- **Multi-format Output**: PDF, HTML, JSON exports
- **Corporate Branding**: Customizable report templates
- **Interactive Elements**: Embedded charts and maps
- **Version Control**: Report versioning and change tracking

## 🚨 Production Considerations

### Security
- **Data Privacy**: All data processed in Google Cloud (GDPR compliant)
- **Access Control**: IAM-based permissions
- **Audit Logging**: Complete audit trail for all operations
- **Encryption**: Data encrypted in transit and at rest

### Scalability
- **Rate Limiting**: Built-in API rate limiting for Vertex AI
- **Queue Management**: Batch processing for multiple reports
- **Caching**: Intelligent caching of similar analyses
- **Load Balancing**: Auto-scaling for high demand

### Monitoring
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Metrics**: Response time and success rate monitoring
- **Cost Optimization**: Usage tracking and budget alerts
- **Quality Assurance**: Automated report quality checks

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to generate report" Error**:
   - Check Google Cloud authentication
   - Verify Vertex AI API is enabled
   - Ensure service account has proper permissions

2. **Empty or Invalid Reports**:
   - Verify input data quality
   - Check GEE data availability
   - Review prompt engineering parameters

3. **Slow Report Generation**:
   - Check Vertex AI quota limits
   - Optimize data preprocessing
   - Consider batch processing for multiple reports

### Debug Mode
Enable debug logging:
```bash
export REACT_APP_LOG_LEVEL=debug
export REACT_APP_MOCK_GEMINI_RESPONSES=false
```

### Support Contacts
- **Google Cloud Support**: For Vertex AI and infrastructure issues
- **Development Team**: For application-specific problems
- **GEE Community**: For Google Earth Engine data questions

## 📚 Additional Resources

- [Vertex AI Gemini Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [Google Earth Engine API Reference](https://developers.google.com/earth-engine)
- [Environmental Reporting Best Practices](https://www.cdp.net/en/guidance)
- [Statistical Analysis Guidelines](https://www.epa.gov/quality/guidance-quality-assurance-project-plans)

---

*This setup enables enterprise-grade AI-powered environmental reporting with Gemini 2.5 Pro, providing comprehensive insights for environmental impact assessment and corporate sustainability reporting.*
