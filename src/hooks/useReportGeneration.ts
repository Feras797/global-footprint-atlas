import { useState, useCallback } from 'react';
import { ReportRequest, ReportResponse, ReportData } from '@/lib/types/report';
import { GeminiReportService } from '@/lib/services/geminiReportService';
import { ReportDataService } from '@/lib/services/reportDataService';
import { Company } from '@/lib/companies';

export interface UseReportGenerationState {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  reports: Record<string, ReportResponse>;
}

export interface UseReportGenerationActions {
  generateReport: (
    company: Company,
    redAreasData: any[],
    greenAreasData: any[],
    options?: Partial<ReportRequest>
  ) => Promise<ReportResponse>;
  downloadReport: (reportId: string) => Promise<void>;
  clearError: () => void;
  getReportStatus: (reportId: string) => ReportResponse | null;
}

export function useReportGeneration(): UseReportGenerationState & UseReportGenerationActions {
  const [state, setState] = useState<UseReportGenerationState>({
    isGenerating: false,
    progress: 0,
    error: null,
    reports: {}
  });

  const updateState = useCallback((updates: Partial<UseReportGenerationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const generateReport = useCallback(async (
    company: Company,
    redAreasData: any[],
    greenAreasData: any[],
    options: Partial<ReportRequest> = {}
  ): Promise<ReportResponse> => {
    try {
      updateState({ 
        isGenerating: true, 
        progress: 0, 
        error: null 
      });

      // Step 1: Transform data (10% progress)
      updateState({ progress: 10 });
      const reportData: ReportData = ReportDataService.transformToReportData(
        company,
        redAreasData,
        greenAreasData
      );

      // Step 2: Prepare request (20% progress)
      updateState({ progress: 20 });
      const request: ReportRequest = {
        companyId: company.id,
        reportType: 'comprehensive',
        includeVisualizations: true,
        includeRecommendations: true,
        ...options
      };

      // Step 3: Call Gemini service (30-80% progress)
      updateState({ progress: 30 });
      
      // Simulate progressive updates during AI processing
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 80)
        }));
      }, 500);

      const reportResponse = await GeminiReportService.generateReport(reportData, request);
      clearInterval(progressInterval);

      // Step 4: Finalize (90-100% progress)
      updateState({ progress: 90 });
      
      // Store the report
      updateState({
        progress: 100,
        reports: {
          ...state.reports,
          [reportResponse.reportId]: reportResponse
        }
      });

      // Reset state after completion
      setTimeout(() => {
        updateState({ 
          isGenerating: false, 
          progress: 0 
        });
      }, 1000);

      return reportResponse;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
      updateState({
        isGenerating: false,
        progress: 0,
        error: errorMessage
      });
      
      // Return error response
      return {
        reportId: `ERROR_${Date.now()}`,
        status: 'failed',
        error: errorMessage
      };
    }
  }, [state.reports, updateState]);

  const downloadReport = useCallback(async (reportId: string): Promise<void> => {
    try {
      const report = state.reports[reportId];
      if (!report) {
        throw new Error('Report not found');
      }
      
      // Check if downloadUrl starts with "downloaded://" which means PDF was generated
      if (report.downloadUrl && report.downloadUrl.startsWith('downloaded://')) {
        // PDF was already generated and downloaded automatically
        const fileName = report.downloadUrl.replace('downloaded://', '');
        console.log('✅ PDF already downloaded as:', fileName);
        // Optionally show a message to the user
        updateState({ 
          error: `Report already downloaded as: ${fileName}. Check your Downloads folder.` 
        });
        return;
      }
      
      if (!report.downloadUrl) {
        throw new Error('PDF generation failed. Please try generating the report again.');
      }

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = report.downloadUrl;
      link.download = `environmental-report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // In a real implementation, this would handle:
      // - Authentication headers for protected downloads
      // - Progress tracking for large files
      // - Error handling for failed downloads
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download report';
      updateState({ error: errorMessage });
    }
  }, [state.reports, updateState]);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const getReportStatus = useCallback((reportId: string): ReportResponse | null => {
    return state.reports[reportId] || null;
  }, [state.reports]);

  return {
    ...state,
    generateReport,
    downloadReport,
    clearError,
    getReportStatus
  };
}

// Hook for managing multiple report generations
export function useReportQueue() {
  const [queue, setQueue] = useState<Array<{
    id: string;
    company: Company;
    redAreasData: any[];
    greenAreasData: any[];
    options?: Partial<ReportRequest>;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: ReportResponse;
  }>>([]);

  const addToQueue = useCallback((
    company: Company,
    redAreasData: any[],
    greenAreasData: any[],
    options?: Partial<ReportRequest>
  ) => {
    const id = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setQueue(prev => [...prev, {
      id,
      company,
      redAreasData,
      greenAreasData,
      options,
      status: 'pending'
    }]);
    return id;
  }, []);

  const processQueue = useCallback(async () => {
    const pendingItems = queue.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return;

    // Process items sequentially to avoid overwhelming the API
    for (const item of pendingItems) {
      setQueue(prev => prev.map(queueItem =>
        queueItem.id === item.id 
          ? { ...queueItem, status: 'processing' }
          : queueItem
      ));

      try {
        const reportData = ReportDataService.transformToReportData(
          item.company,
          item.redAreasData,
          item.greenAreasData
        );

        const request: ReportRequest = {
          companyId: item.company.id,
          reportType: 'comprehensive',
          includeVisualizations: true,
          includeRecommendations: true,
          ...item.options
        };

        const result = await GeminiReportService.generateReport(reportData, request);

        setQueue(prev => prev.map(queueItem =>
          queueItem.id === item.id 
            ? { ...queueItem, status: 'completed', result }
            : queueItem
        ));

      } catch (error) {
        setQueue(prev => prev.map(queueItem =>
          queueItem.id === item.id 
            ? { 
                ...queueItem, 
                status: 'failed', 
                result: {
                  reportId: `ERROR_${item.id}`,
                  status: 'failed',
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              }
            : queueItem
        ));
      }

      // Add delay between requests to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }, [queue]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(item => item.status !== 'completed' && item.status !== 'failed'));
  }, []);

  return {
    queue,
    addToQueue,
    processQueue,
    removeFromQueue,
    clearCompleted
  };
}
