import React from 'react';
import { ReportData, ReportRequest } from '@/lib/types/report';

interface PDFTemplateProps {
  reportData: ReportData;
  request: ReportRequest;
  geminiContent: string;
}

/**
 * Professional PDF template for environmental impact reports
 * This component renders the HTML that will be converted to PDF
 */
export const PDFTemplate: React.FC<PDFTemplateProps> = ({ 
  reportData, 
  request, 
  geminiContent 
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Parse Gemini content into sections (assuming structured response)
  const parseContent = (content: string) => {
    const sections = content.split(/\n\n(?=[A-Z][A-Z\s]+:|\d+\.)/);
    return sections.map((section, index) => ({
      id: index,
      content: section.trim()
    }));
  };

  const contentSections = parseContent(geminiContent);

  return (
    <div className="pdf-template" style={{
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      padding: '20mm',
      backgroundColor: 'white',
      color: '#000',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineHeight: '1.6'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '3px solid #0ea5e9',
        paddingBottom: '20px',
        marginBottom: '30px'
      }}>
        <h1 style={{
          margin: '0 0 10px 0',
          color: '#0ea5e9',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          Environmental Impact Report
        </h1>
        <h2 style={{
          margin: '0 0 15px 0',
          color: '#374151',
          fontSize: '18px',
          fontWeight: 'normal'
        }}>
          {reportData.company.name}
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#6b7280'
        }}>
          <div>
            <strong>Industry:</strong> {reportData.company.industry}<br/>
            <strong>Analysis Date:</strong> {reportData.company.analysisDate}<br/>
            <strong>Report Type:</strong> {request.reportType}
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Generated:</strong> {currentDate}<br/>
            <strong>Powered by:</strong> Gemini 2.5 Pro<br/>
            <strong>Data Source:</strong> Google Earth Engine
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h3 style={{
          margin: '0 0 15px 0',
          color: '#0ea5e9',
          fontSize: '16px'
        }}>
          📊 Key Environmental Metrics
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151' }}>
              Operational Areas (Red Zones)
            </h4>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '11px' }}>
              <li>Total Areas Analyzed: {reportData.redAreas.length}</li>
              <li>Average NDVI: {reportData.redAreas[0]?.environmentalData?.ndvi?.toFixed(3) || 'N/A'}</li>
              <li>Average NDWI: {reportData.redAreas[0]?.environmentalData?.ndwi?.toFixed(3) || 'N/A'}</li>
              <li>Average Elevation: {reportData.redAreas[0]?.environmentalData?.elevation?.toFixed(0) || 'N/A'}m</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151' }}>
              Reference Areas (Green Zones)
            </h4>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '11px' }}>
              <li>Total Areas Analyzed: {reportData.greenAreas.length}</li>
              <li>Average NDVI: {reportData.greenAreas[0]?.environmentalData?.ndvi?.toFixed(3) || 'N/A'}</li>
              <li>Average NDWI: {reportData.greenAreas[0]?.environmentalData?.ndwi?.toFixed(3) || 'N/A'}</li>
              <li>Average Elevation: {reportData.greenAreas[0]?.environmentalData?.elevation?.toFixed(0) || 'N/A'}m</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Analysis Content */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{
          margin: '0 0 20px 0',
          color: '#0ea5e9',
          fontSize: '16px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '5px'
        }}>
          🤖 AI-Powered Analysis
        </h3>
        
        {contentSections.map((section, index) => (
          <div key={section.id} style={{
            marginBottom: '20px',
            fontSize: '12px',
            lineHeight: '1.6'
          }}>
            <div style={{
              whiteSpace: 'pre-wrap',
              textAlign: 'justify'
            }}>
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Data Source Information */}
      <div style={{
        borderTop: '2px solid #e2e8f0',
        paddingTop: '20px',
        marginTop: '40px',
        fontSize: '10px',
        color: '#6b7280'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#374151' }}>
          Data Sources & Methodology
        </h4>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong>Satellite Data:</strong> Google Earth Engine (Landsat, Sentinel)
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong>AI Analysis:</strong> Google Gemini 2.5 Pro with environmental expertise
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong>Analysis Period:</strong> {reportData.metadata.analysisStartDate} to {reportData.metadata.analysisEndDate}
        </p>
        <p style={{ margin: '0' }}>
          <strong>Coordinate System:</strong> WGS84 (EPSG:4326) | 
          <strong> Resolution:</strong> {reportData.metadata.spatialResolution}m | 
          <strong> Confidence:</strong> {reportData.metadata.confidence}%
        </p>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: '10mm',
        left: '20mm',
        right: '20mm',
        textAlign: 'center',
        fontSize: '10px',
        color: '#9ca3af',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '10px'
      }}>
        ProtectEarth Environmental Impact Monitoring Platform | Powered by AI & Satellite Data
      </div>
    </div>
  );
};

export default PDFTemplate;
