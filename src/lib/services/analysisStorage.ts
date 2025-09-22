import { AnalysisResult } from '@/lib/types/analysis'

const STORAGE_KEY = 'gfa.analysis.results'
const SERVER_BASE = 'http://localhost:3001'

function getLatestQuarter (): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const quarter = Math.ceil(month / 3)
  return `${year}-Q${quarter}`
}

function loadAll (): Record<string, AnalysisResult[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
    return {}
  } catch (err) {
    console.error('Failed to load analysis results from storage', err)
    return {}
  }
}

function saveAll (data: Record<string, AnalysisResult[]>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save analysis results to storage', err)
  }
}

async function getRemoteStatus (companyId: string): Promise<'not_analyzed' | 'analyzed' | 'new_quarter'> {
  try {
    const res = await fetch(`${SERVER_BASE}/api/analysis/${companyId}/status`)
    if (!res.ok) throw new Error('status failed')
    const data = await res.json()
    return data.status
  } catch (e) {
    // fallback to local
    return getAnalysisStatusLocal(companyId)
  }
}

function getAnalysisStatusLocal (companyId: string): 'not_analyzed' | 'analyzed' | 'new_quarter' {
  const all = loadAll()
  const records = all[companyId] || []
  if (records.length === 0) return 'not_analyzed'
  const latest = records[records.length - 1]
  const currentQuarter = getLatestQuarter()
  return latest.quarter === currentQuarter ? 'analyzed' : 'new_quarter'
}

function hasQuarterData (companyId: string, quarter: string): boolean {
  const all = loadAll()
  const records = all[companyId] || []
  return records.some(r => r.quarter === quarter)
}

function getAnalysis (companyId: string): AnalysisResult | null {
  const all = loadAll()
  const records = all[companyId] || []
  if (records.length === 0) return null
  return records[records.length - 1]
}

async function saveAnalysis (companyId: string, data: Omit<AnalysisResult, 'companyId' | 'quarter' | 'timestamp'>, quarter?: string): Promise<AnalysisResult> {
  const all = loadAll()
  const q = quarter || getLatestQuarter()
  const localRecord: AnalysisResult = {
    companyId,
    quarter: q,
    timestamp: new Date().toISOString(),
    ...data
  }
  // Write to disk via server (best-effort)
  try {
    const res = await fetch(`${SERVER_BASE}/api/analysis/${companyId}/${q}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localRecord)
    })
    if (res.ok) {
      const saved = await res.json()
      // sync timestamp from server
      localRecord.timestamp = saved.timestamp || localRecord.timestamp
    }
  } catch (e) {
    // offline or server not running; continue with local cache
  }
  const list = all[companyId] || []
  const existingIndex = list.findIndex(r => r.quarter === q)
  if (existingIndex >= 0) list[existingIndex] = localRecord
  else list.push(localRecord)
  all[companyId] = list
  saveAll(all)
  return localRecord
}

export const analysisStorage = {
  getLatestQuarter,
  getAnalysisStatus: getAnalysisStatusLocal,
  getRemoteStatus,
  async getRemoteLatest (companyId: string) {
    try {
      const res = await fetch(`${SERVER_BASE}/api/analysis/${companyId}/latest`)
      if (!res.ok) return null
      const data = await res.json()
      // write-through to local cache for quick reads
      const all = loadAll()
      const list = all[companyId] || []
      const existingIndex = list.findIndex(r => r.quarter === data.quarter)
      if (existingIndex >= 0) list[existingIndex] = data
      else list.push(data)
      all[companyId] = list
      saveAll(all)
      return data as AnalysisResult
    } catch (e) {
      return getAnalysis(companyId)
    }
  },
  saveAnalysis,
  getAnalysis,
  hasQuarterData
}


