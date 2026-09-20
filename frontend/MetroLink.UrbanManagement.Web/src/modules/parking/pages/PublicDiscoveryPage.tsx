import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  Spinner,
} from '@enterprise/component-library'
import { MapPin } from 'lucide-react'
import { listPublicFacilities } from '@/api/parking'
import { ApiAlert } from '@/shared/components/ApiAlert'

export function PublicDiscoveryPage() {
  const query = useQuery({ queryKey: ['public-parking'], queryFn: listPublicFacilities })

  return (
    <>
      <PageHeader
        title="Find parking"
        description="Citizen view — active facilities with live availability."
      />
      {query.isError && <ApiAlert message={query.error instanceof Error ? query.error.message : undefined} />}
      {query.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(query.data ?? []).map((f) => {
            const available = f.availableSpaces ?? f.totalCapacity
            const pct =
              f.totalCapacity > 0
                ? Math.round(((f.totalCapacity - (available ?? 0)) / f.totalCapacity) * 100)
                : 0
            return (
              <Card key={f.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span>{f.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{f.code}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {f.address ?? 'Address not listed'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>
                    <span className="text-muted-foreground">Type:</span> {f.facilityType}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Available:</span>{' '}
                    <span className="font-medium tabular-nums">
                      {available ?? '—'} / {f.totalCapacity}
                    </span>
                    <span className="text-muted-foreground"> ({pct}% full)</span>
                  </p>
                  {f.vehicleTypesCsv && (
                    <p>
                      <span className="text-muted-foreground">Vehicles:</span> {f.vehicleTypesCsv}
                    </p>
                  )}
                  {f.operatingHoursJson && (
                    <p className="text-xs text-muted-foreground">Hours: {f.operatingHoursJson}</p>
                  )}
                  {f.latitude != null && f.longitude != null && (
                    <p className="text-xs text-muted-foreground">
                      {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
          {(query.data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">No active facilities published.</p>
          )}
        </div>
      )}
    </>
  )
}
