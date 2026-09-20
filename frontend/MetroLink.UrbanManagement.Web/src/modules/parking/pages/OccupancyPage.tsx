import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  NativeSelect,
  PageHeader,
  Spinner,
  Textarea,
} from '@enterprise/component-library'
import { useSearchParams } from 'react-router-dom'
import { getOccupancy, listFacilities, updateManualOccupancy } from '@/api/parking'
import { ApiAlert } from '@/shared/components/ApiAlert'

export function OccupancyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const client = useQueryClient()
  const facilityFromUrl = searchParams.get('facilityId') ?? ''
  const [facilityId, setFacilityId] = useState(facilityFromUrl)
  const [occupied, setOccupied] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const facilitiesQuery = useQuery({
    queryKey: ['facilities', 'occupancy'],
    queryFn: () => listFacilities({ page: 1, pageSize: 100 }),
  })

  const occupancyQuery = useQuery({
    queryKey: ['occupancy', facilityId],
    queryFn: () => getOccupancy(facilityId),
    enabled: Boolean(facilityId),
  })

  const manual = useMutation({
    mutationFn: () =>
      updateManualOccupancy(facilityId, {
        occupied: Number(occupied),
        notes: notes.trim() || null,
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['occupancy', facilityId] })
      setNotes('')
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Update failed'),
  })

  const occ = occupancyQuery.data
  const utilization =
    occ && occ.totalCapacity > 0 ? Math.round((occ.occupied / occ.totalCapacity) * 100) : null

  return (
    <>
      <PageHeader
        title="Occupancy"
        description="Live capacity utilization and manual corrections."
      />
      <label className="block max-w-md space-y-1 text-sm mb-4">
        <span className="text-muted-foreground">Facility</span>
        <NativeSelect
          value={facilityId}
          onChange={(e) => {
            setFacilityId(e.target.value)
            if (e.target.value) setSearchParams({ facilityId: e.target.value })
            else setSearchParams({})
          }}
        >
          <option value="">Select facility…</option>
          {(facilitiesQuery.data?.items ?? []).map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.code})
            </option>
          ))}
        </NativeSelect>
      </label>

      {!facilityId ? (
        <p className="text-sm text-muted-foreground">Choose a facility to view occupancy.</p>
      ) : occupancyQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          {occupancyQuery.isError && (
            <ApiAlert message={occupancyQuery.error instanceof Error ? occupancyQuery.error.message : undefined} />
          )}
          {error && <ApiAlert message={error} />}
          {occ && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Current snapshot</CardTitle>
                  <CardDescription>
                    {utilization != null ? `${utilization}% utilization` : 'No capacity data'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="text-3xl font-semibold tabular-nums">{occ.totalCapacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Occupied</p>
                    <p className="text-3xl font-semibold tabular-nums">{occ.occupied}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="text-3xl font-semibold tabular-nums">{occ.available}</p>
                  </div>
                  <div className="sm:col-span-3 text-left text-sm">
                    <p className="text-muted-foreground">Source · {occ.source}</p>
                    <p className="text-muted-foreground">
                      Recorded {new Date(occ.recordedAt).toLocaleString()}
                    </p>
                    {occ.notes && <p className="mt-2">{occ.notes}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manual update</CardTitle>
                  <CardDescription>Override occupied count for sensors-down scenarios.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="block space-y-1 text-sm">
                    <Label>Occupied count</Label>
                    <Input
                      type="number"
                      value={occupied}
                      onChange={(e) => setOccupied(e.target.value)}
                      placeholder={String(occ.occupied)}
                    />
                  </label>
                  <label className="block space-y-1 text-sm">
                    <Label>Notes</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                  </label>
                  <Button
                    disabled={occupied === '' || manual.isPending}
                    onClick={() => {
                      setError('')
                      manual.mutate()
                    }}
                  >
                    Apply manual count
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </>
  )
}
