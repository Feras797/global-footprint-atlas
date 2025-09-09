import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Brain, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { useReportGeneration } from '@/hooks/useReportGeneration';
import { Company } from '@/lib/companies';

export interface ReportGeneratorProps {
  company: Company;
  redAreasData: any[];
  greenAreasData: any[];
  className?: string;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  company,
  redAreasData,
  greenAreasData,
  className = ''
}) => {
  const {
    isGenerating,
    progress,
    error,
    reports,
    generateReport,
    downloadReport,
    clearError
  } = useReportGeneration();

  const [selectedReportType, setSelectedReportType] = useState<'comprehensive' | 'summary' | 'technical'>('comprehensive');
  const [includeVisualizations, setIncludeVisualizations] = useState(true);
  const [latestReportId, setLatestReportId] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    try {
      clearError();
      const response = await generateReport(
        company,
        redAreasData,
        greenAreasData,
        {
          reportType: selectedReportType,
          includeVisualizations,
          includeRecommendations: true
        }
      );
      
      if (response.status === 'completed') {
        setLatestReportId(response.reportId);
      }
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const handleDownload = async (reportId: string) => {
    await downloadReport(reportId);
  };

  const latestReport = latestReportId ? reports[latestReportId] : null;
  const hasData = redAreasData.length > 0 && greenAreasData.length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI-Powered Environmental Report
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Gemini 2.5 Pro
                </Badge>
              </CardTitle>
              <CardDescription>
                Generate comprehensive environmental impact analysis comparing operational areas with reference regions
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Data Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <div>
                <div className="font-medium text-sm">Operational Areas</div>
                <div className="text-xs text-muted-foreground">
                  {redAreasData.length} areas analyzed
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <div>
                <div className="font-medium text-sm">Reference Areas</div>
                <div className="text-xs text-muted-foreground">
                  {greenAreasData.length} similar areas found
                </div>
              </div>
            </div>
          </div>

          {/* Report Configuration */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'comprehensive', label: 'Comprehensive', desc: 'Full analysis with all metrics' },
                  { value: 'summary', label: 'Executive Summary', desc: 'Key insights for leadership' },
                  { value: 'technical', label: 'Technical Deep-dive', desc: 'Detailed scientific analysis' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedReportType(type.value as any)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      selectedReportType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeViz"
                checked={includeVisualizations}
                onChange={(e) => setIncludeVisualizations(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="includeViz" className="text-sm">
                Include visualization specifications
              </label>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Data Availability Check */}
          {!hasData && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No analysis data available. Please run environmental analysis first to generate reports.
              </AlertDescription>
            </Alert>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Generating report with Gemini 2.5 Pro...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {progress < 20 && "Preparing environmental data..."}
                {progress >= 20 && progress < 30 && "Structuring analysis request..."}
                {progress >= 30 && progress < 80 && "AI analyzing environmental patterns..."}
                {progress >= 80 && progress < 100 && "Generating report and visualizations..."}
                {progress >= 100 && "Finalizing document..."}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating || !hasData}
              className="flex-1"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate AI Report
                </>
              )}
            </Button>
            
            {latestReport && latestReport.status === 'completed' && (
              <Button
                onClick={() => handleDownload(latestReport.reportId)}
                variant="outline"
                size="lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {latestReport && latestReport.status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Report Generated Successfully
            </CardTitle>
            <CardDescription>
              Environmental impact analysis for {company.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-medium">Environmental Impact Assessment</div>
                    <div className="text-sm text-muted-foreground">
                      Report ID: {latestReport.reportId}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Ready for Download</div>
                  <div className="text-xs text-muted-foreground">
                    Generated {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
              
              {latestReport.preview && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Preview:</label>
                  <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground border-l-4 border-primary">
                    {latestReport.preview}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Statistical Analysis Included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">AI-Generated Insights</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      {Object.keys(reports).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Previously generated environmental assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.values(reports)
                .filter(report => report.reportId !== latestReportId)
                .slice(0, 3)
                .map((report) => (
                  <div key={report.reportId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Report {report.reportId.slice(-8)}</div>
                        <div className="text-xs text-muted-foreground">
                          Status: {report.status}
                        </div>
                      </div>
                    </div>
                    {report.status === 'completed' && report.downloadUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(report.reportId)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
