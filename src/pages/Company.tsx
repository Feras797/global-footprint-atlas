import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCompanyById, getSimilarCompanies } from '@/lib/companies'
import { ArrowLeft } from 'lucide-react'

const PlaceholderTile = ({ title }: { title: string }) => (
  <Card className="p-6 h-48 flex items-center justify-center text-muted-foreground">
    {title} – coming soon
  </Card>
)

export default function CompanyPage () {
  const params = useParams()
  const companyId = params.companyId || ''
  const company = useMemo(() => getCompanyById(companyId), [companyId])
  const navigate = useNavigate()

  if (!company) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Company not found</h1>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to Companies"
            onClick={() => navigate('/dashboard?view=companies')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>
    )
  }

  const similar = getSimilarCompanies(company, 3)

  return (
    <div className="min-h-screen w-full flex bg-background">
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{company.name}</h1>
              <div className="mt-1 text-muted-foreground">{company.country} · {company.type}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back to Companies"
              onClick={() => navigate('/dashboard?view=companies')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Patch section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Patches</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Main patch</h3>
                  <Badge variant="secondary">Operational</Badge>
                </div>
                <div className="h-40 rounded-md bg-muted/20" />
              </Card>

              {similar.map(ref => (
                <Card key={ref.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Reference</h3>
                    <Badge variant="outline" className="text-xs">{ref.country}</Badge>
                  </div>
                  <div className="h-40 rounded-md bg-muted/20" />
                </Card>
              ))}
            </div>
          </section>

          {/* Analysis section (mock) */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlaceholderTile title="Deforestation over time" />
              <PlaceholderTile title="Vegetation index (NDVI)" />
              <PlaceholderTile title="Water body changes" />
              <PlaceholderTile title="Soil/land cover shifts" />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}


