import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  NativeSelect,
  PageHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@enterprise/component-library'
import {
  activateSubscription,
  cancelSubscription,
  createSubscription,
  listFacilities,
  listProducts,
  listSubscriptions,
  orgId,
} from '@/api/parking'
import { ApiAlert } from '@/shared/components/ApiAlert'

export function SubscriptionsPage() {
  const client = useQueryClient()
  const [error, setError] = useState('')
  const [facilityId, setFacilityId] = useState('')
  const [productId, setProductId] = useState('')
  const [customerLabel, setCustomerLabel] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')

  const subsQuery = useQuery({ queryKey: ['subscriptions'], queryFn: () => listSubscriptions() })
  const facilitiesQuery = useQuery({
    queryKey: ['facilities', 'subs'],
    queryFn: () => listFacilities({ page: 1, pageSize: 100 }),
  })
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: listProducts })

  const create = useMutation({
    mutationFn: () =>
      createSubscription({
        organizationId: orgId(),
        facilityId,
        productId,
        customerLabel: customerLabel.trim(),
        vehiclePlate: vehiclePlate.trim() || null,
        startsAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['subscriptions'] })
      setCustomerLabel('')
      setVehiclePlate('')
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Create failed'),
  })

  const activate = useMutation({
    mutationFn: (id: string) => activateSubscription(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['subscriptions'] }),
  })

  const cancel = useMutation({
    mutationFn: (id: string) => cancelSubscription(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['subscriptions'] }),
  })

  return (
    <>
      <PageHeader title="Subscriptions" description="Monthly and reserved parking passes." />
      {error && <ApiAlert message={error} />}
      <Card className="mb-6 max-w-xl">
        <CardHeader>
          <CardTitle>New subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block space-y-1 text-sm">
            <Label>Facility</Label>
            <NativeSelect value={facilityId} onChange={(e) => setFacilityId(e.target.value)}>
              <option value="">Select…</option>
              {(facilitiesQuery.data?.items ?? []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </NativeSelect>
          </label>
          <label className="block space-y-1 text-sm">
            <Label>Product</Label>
            <NativeSelect value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Select…</option>
              {(productsQuery.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NativeSelect>
          </label>
          <Input placeholder="Customer label" value={customerLabel} onChange={(e) => setCustomerLabel(e.target.value)} />
          <Input placeholder="Vehicle plate (optional)" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} />
          <Button
            disabled={!facilityId || !productId || !customerLabel.trim() || create.isPending}
            onClick={() => create.mutate()}
          >
            Create
          </Button>
        </CardContent>
      </Card>

      {subsQuery.isLoading ? (
        <Spinner />
      ) : subsQuery.isError ? (
        <ApiAlert message={subsQuery.error instanceof Error ? subsQuery.error.message : undefined} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Plate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Starts</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(subsQuery.data ?? []).map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.customerLabel}</TableCell>
                <TableCell>{s.vehiclePlate ?? '—'}</TableCell>
                <TableCell>{s.status}</TableCell>
                <TableCell>{new Date(s.startsAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  {s.status === 'Pending' && (
                    <Button size="sm" variant="tertiary" onClick={() => activate.mutate(s.id)}>
                      Activate
                    </Button>
                  )}
                  {s.status === 'Active' && (
                    <Button size="sm" variant="tertiary" onClick={() => cancel.mutate(s.id)}>
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  )
}
