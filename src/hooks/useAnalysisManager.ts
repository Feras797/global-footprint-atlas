import { useCallback, useMemo, useState } from 'react'
import { analysisStorage } from '@/lib/services/analysisStorage'
import type { AnalysisResult } from '@/lib/types/analysis'

export function useAnalysisManager (companyId: string) {
  const [isSaving, setIsSaving] = useState(false)

  const latest = useMemo(() => analysisStorage.getAnalysis(companyId), [companyId])
  const status = useMemo(() => analysisStorage.getAnalysisStatus(companyId), [companyId, latest?.quarter, latest?.timestamp])
  const latestQuarter = useMemo(() => analysisStorage.getLatestQuarter(), [])

  const saveResult = useCallback(async (payload: Omit<AnalysisResult, 'companyId' | 'quarter' | 'timestamp'>, quarter?: string) => {
    try {
      setIsSaving(true)
      const saved = await analysisStorage.saveAnalysis(companyId, payload, quarter)
      return saved
    } finally {
      setIsSaving(false)
    }
  }, [companyId])

  const refreshRemoteStatus = useCallback(async (): Promise<'not_analyzed' | 'analyzed' | 'new_quarter'> => {
    return await analysisStorage.getRemoteStatus(companyId)
  }, [companyId])

  return {
    status,
    latest,
    latestQuarter,
    isSaving,
    hasQuarterData: (q: string) => analysisStorage.hasQuarterData(companyId, q),
    saveResult,
    refreshRemoteStatus
  }
}


