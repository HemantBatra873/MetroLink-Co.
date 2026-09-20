import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  PageHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@enterprise/component-library'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  activateFacility,
  approveFacility,
  closeFacility,
  createZone,
  getFacility,
  getOccupancy,
  listRates,
  listSessions,
  listZones,
  rejectFacility,
  startReviewFacility,
  submitFacility,
  suspendFacility,
} from '@/api/parking'
import { ApiAlert } from '@/shared/components/ApiAlert'
import { RecordEntryDialog } from '@/modules/parking/components/RecordEntryDialog'
import { FacilityStatusBadge } from '@/modules/parking/components/StatusBadge'
import { SessionStatusBadge } from '@/modules/parking/components/StatusBadge'
import type { FacilityStatus, SessionStatus } from '@/api/parking/types'
export function FacilityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const client = useQueryClient()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [entryOpen, setEntryOpen] = useState(false)
  const [zoneName, setZoneName] = useState('')
  const [zoneCode, setZoneCode] = useState('')
  const [zoneCapacity, setZoneCapacity] = useState('50')
  const [actionError, setActionError] = useState('')

  const facilityQuery = useQuery({
    queryKey: ['facility', id],
    queryFn: () => getFacility(id!),
    enabled: Boolean(id),
  })

  const occupancyQuery = useQuery({
    queryKey: ['occupancy', id],
    queryFn: () => getOccupancy(id!),
    enabled: Boolean(id),
  })

  const sessionsQuery = useQuery({
    queryKey: ['sessions', id, 'facility'],
    queryFn: () => listSessions({ facilityId: id, page: 1, pageSize: 10 }),
    enabled: Boolean(id),
  })

  const zonesQuery = useQuery({
    queryKey: ['zones', id],
    queryFn: () => listZones(id!),
    enabled: Boolean(id),
  })

  const ratesQuery = useQuery({
    queryKey: ['rates', id],
    queryFn: () => listRates(id),
    enabled: Boolean(id),
  })

  const lifecycle = useMutation({
    mutationFn: async (action: string) => {
      if (!id) throw new Error('Missing facility')
      switch (action) {
        case 'submit':
          return submitFacility(id)
        case 'start-review':
          return startReviewFacility(id)
        case 'approve':
          return approveFacility(id)
        case 'activate':
          return activateFacility(id)
        case 'suspend':
          return suspendFacility(id)
        case 'close':
          return closeFacility(id)
        case 'reject':
          return rejectFacility(id, rejectReason)
        default:
          throw new Error('Unknown action')
      }
    },
    onSuccess: () => {
      setRejectOpen(false)
      setRejectReason('')
      client.invalidateQueries({ queryKey: ['facility', id] })
      client.invalidateQueries({ queryKey: ['facilities'] })
      client.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (e) => setActionError(e instanceof Error ? e.message : 'Action failed'),
  })

  const addZone = useMutation({
    mutationFn: () =>
      createZone(id!, {
        name: zoneName.trim(),
        code: zoneCode.trim(),
        capacity: Number(zoneCapacity) || 0,
      }),
    onSuccess: () => {
      setZoneName('')
      setZoneCode('')
      client.invalidateQueries({ queryKey: ['zones', id] })
    },
    onError: (e) => setActionError(e instanceof Error ? e.message : 'Could not create zone'),
  })

  const f = facilityQuery.data
  const status = f?.status as FacilityStatus | undefined
  const occ = occupancyQuery.data
  const utilization =
    occ && occ.totalCapacity > 0 ? Math.round((occ.occupied / occ.totalCapacity) * 100) : null

  return (
    <>
      <PageHeader
        title={f?.name ?? 'Facility'}
        description={f?.code ?? 'Loading…'}
        breadcrumbs={[
          { label: 'Facilities', href: '/app/parking/facilities' },
          { label: f?.name ?? '…' },
        ]}
      />
      {facilityQuery.isError && (
        <ApiAlert message={facilityQuery.error instanceof Error ? facilityQuery.error.message : undefined} />
      )}
      {actionError && <ApiAlert message={actionError} />}
      {facilityQuery.isLoading || !f ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {status === 'Draft' && (
              <Button size="sm" disabled={lifecycle.isPending} onClick={() => lifecycle.mutate('submit')}>
                Submit
              </Button>
            )}
            {status === 'Submitted' && (
              <Button size="sm" disabled={lifecycle.isPending} onClick={() => lifecycle.mutate('start-review')}>
                Start review
              </Button>
            )}
            {status === 'UnderReview' && (
              <>
                <Button size="sm" disabled={lifecycle.isPending} onClick={() => lifecycle.mutate('approve')}>
                  Approve
                </Button>
                <Button size="sm" variant="tertiary" onClick={() => setRejectOpen(true)}>
                  Reject
                </Button>
              </>
            )}
            {status === 'Approved' && (
              <Button size="sm" disabled={lifecycle.isPending} onClick={() => lifecycle.mutate('activate')}>
                Activate
              </Button>
            )}
            {status === 'Active' && (
              <>
                <Button size="sm" disabled={lifecycle.isPending} onClick={() => lifecycle.mutate('suspend')}>
                  Suspend
                </Button>
                <Button size="sm" variant="tertiary" onClick={() => setEntryOpen(true)}>
                  Record entry
                </Button>
                <Button size="sm" variant="tertiary" onClick={() => navigate('/app/parking/sessions')}>
                  Record exit
                </Button>
              </>
            )}
            {status === 'Suspended' && (
              <Button size="sm" disabled={lifecycle.isPending} onClick={() => lifecycle.mutate('activate')}>
                Reactivate
              </Button>
            )}
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="zones">Zones</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-2">
                    Summary
                    <FacilityStatusBadge status={f.status} />
                  </CardTitle>
                  <CardDescription>
                    {f.address ?? 'No address'} · Capacity {f.totalCapacity}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{f.facilityType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Occupancy mode</p>
                    <p className="font-medium">{f.occupancyMode}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vehicles</p>
                    <p>{f.vehicleTypesCsv || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Operating hours</p>
                    <p className="font-mono text-xs break-all">{f.operatingHoursJson ?? '—'}</p>
                  </div>
                  {f.rejectionReason && (
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground">Rejection reason</p>
                      <p>{f.rejectionReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="occupancy" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current occupancy</CardTitle>
                  <CardDescription>
                    {occupancyQuery.isLoading
                      ? 'Loading…'
                      : occ
                        ? `${occ.occupied} / ${occ.totalCapacity} occupied · ${utilization}% utilization`
                        : 'No snapshot'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  {occupancyQuery.isError && (
                    <ApiAlert
                      message={
                        occupancyQuery.error instanceof Error ? occupancyQuery.error.message : undefined
                      }
                    />
                  )}
                  {occ && (
                    <dl className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">Available</dt>
                        <dd className="text-2xl font-semibold tabular-nums">{occ.available}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Source</dt>
                        <dd>{occ.source}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-muted-foreground">Recorded</dt>
                        <dd>{new Date(occ.recordedAt).toLocaleString()}</dd>
                      </div>
                    </dl>
                  )}
                  <Link
                    to={`/app/parking/occupancy?facilityId=${f.id}`}
                    className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
                  >
                    Open occupancy page →
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent sessions</CardTitle>
                  <Button size="sm" className="w-fit" onClick={() => setEntryOpen(true)}>
                    Record entry
                  </Button>
                </CardHeader>
                <CardContent>
                  {sessionsQuery.isLoading ? (
                    <Spinner />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plate</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Entry</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(sessionsQuery.data?.items ?? []).map((s) => (
                          <TableRow key={s.id}>
                            <TableCell>
                              <Link to={`/app/parking/sessions/${s.id}`} className="text-primary hover:underline">
                                {s.vehiclePlate}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <SessionStatusBadge status={s.status as SessionStatus} />
                            </TableCell>
                            <TableCell>{new Date(s.entryTime).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rates</CardTitle>
                  <CardDescription>Facility-scoped pricing rules.</CardDescription>
                </CardHeader>
                <CardContent>
                  {ratesQuery.isLoading ? (
                    <Spinner />
                  ) : (ratesQuery.data?.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">No rates for this facility.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead className="text-right">Base</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ratesQuery.data!.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{r.product?.name ?? r.productId}</TableCell>
                            <TableCell>{r.vehicleType}</TableCell>
                            <TableCell className="text-right tabular-nums">₹{r.baseAmount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  <Link to="/app/parking/pricing" className="mt-4 inline-flex text-sm font-medium text-primary hover:underline">
                    Manage pricing →
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="zones" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  {zonesQuery.isLoading ? (
                    <Spinner />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead className="text-right">Capacity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(zonesQuery.data ?? []).map((z) => (
                          <TableRow key={z.id}>
                            <TableCell>{z.name}</TableCell>
                            <TableCell>{z.code}</TableCell>
                            <TableCell className="text-right">{z.capacity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Add zone</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                  <Input placeholder="Name" value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
                  <Input placeholder="Code" value={zoneCode} onChange={(e) => setZoneCode(e.target.value)} />
                  <Input
                    type="number"
                    placeholder="Capacity"
                    value={zoneCapacity}
                    onChange={(e) => setZoneCapacity(e.target.value)}
                  />
                  <Button
                    className="sm:col-span-3 w-fit"
                    disabled={!zoneName.trim() || !zoneCode.trim() || addZone.isPending}
                    onClick={() => addZone.mutate()}
                  >
                    Create zone
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject facility</DialogTitle>
            <DialogDescription>Provide a reason for rejection.</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="tertiary" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!rejectReason.trim() || lifecycle.isPending}
              onClick={() => lifecycle.mutate('reject')}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {id && (
        <RecordEntryDialog
          open={entryOpen}
          onOpenChange={setEntryOpen}
          facilityId={id}
          onCreated={(sessionId) => navigate(`/app/parking/sessions/${sessionId}`)}
        />
      )}
    </>
  )
}
