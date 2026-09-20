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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@enterprise/component-library'
import {
  createProduct,
  createRate,
  listFacilities,
  listProducts,
  listRates,
  orgId,
} from '@/api/parking'
import { ApiAlert } from '@/shared/components/ApiAlert'
import type { ProductType, VehicleType } from '@/api/parking/types'

const productTypes: ProductType[] = [
  'Hourly',
  'Daily',
  'Monthly',
  'Reserved',
  'Resident',
  'Commercial',
  'Corporate',
]
const vehicleTypes: VehicleType[] = ['Car', 'TwoWheeler', 'EV', 'Commercial', 'Bus', 'Other']

export function PricingPage() {
  const client = useQueryClient()
  const [error, setError] = useState('')

  const [prodCode, setProdCode] = useState('')
  const [prodName, setProdName] = useState('')
  const [prodType, setProdType] = useState<ProductType>('Hourly')

  const [rateFacilityId, setRateFacilityId] = useState('')
  const [rateProductId, setRateProductId] = useState('')
  const [rateVehicle, setRateVehicle] = useState<VehicleType>('Car')
  const [baseAmount, setBaseAmount] = useState('50')
  const [perHour, setPerHour] = useState('20')

  const productsQuery = useQuery({ queryKey: ['products'], queryFn: listProducts })
  const ratesQuery = useQuery({ queryKey: ['rates'], queryFn: () => listRates() })
  const facilitiesQuery = useQuery({
    queryKey: ['facilities', 'pricing'],
    queryFn: () => listFacilities({ page: 1, pageSize: 100 }),
  })

  const createProd = useMutation({
    mutationFn: () =>
      createProduct({
        organizationId: orgId(),
        code: prodCode.trim(),
        name: prodName.trim(),
        productType: prodType,
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['products'] })
      setProdCode('')
      setProdName('')
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Product create failed'),
  })

  const createRateMutation = useMutation({
    mutationFn: () =>
      createRate({
        organizationId: orgId(),
        facilityId: rateFacilityId || null,
        productId: rateProductId,
        vehicleType: rateVehicle,
        baseAmount: Number(baseAmount),
        perHourAmount: perHour ? Number(perHour) : null,
        effectiveFrom: new Date().toISOString(),
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['rates'] })
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Rate create failed'),
  })

  return (
    <>
      <PageHeader title="Pricing" description="Products and rate cards for parking fees." />
      {error && <ApiAlert message={error} />}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Billable parking product definitions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Code" value={prodCode} onChange={(e) => setProdCode(e.target.value)} />
              <Input placeholder="Name" value={prodName} onChange={(e) => setProdName(e.target.value)} />
              <NativeSelect
                className="sm:col-span-2"
                value={prodType}
                onChange={(e) => setProdType(e.target.value as ProductType)}
              >
                {productTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </NativeSelect>
              <Button
                className="sm:col-span-2 w-fit"
                disabled={!prodCode.trim() || !prodName.trim() || createProd.isPending}
                onClick={() => createProd.mutate()}
              >
                Add product
              </Button>
            </div>
            {productsQuery.isLoading ? (
              <Spinner />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(productsQuery.data ?? []).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.code}</TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.productType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block space-y-1 text-sm">
              <Label>Product</Label>
              <NativeSelect value={rateProductId} onChange={(e) => setRateProductId(e.target.value)}>
                <option value="">Select product…</option>
                {(productsQuery.data ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label className="block space-y-1 text-sm">
              <Label>Facility (optional)</Label>
              <NativeSelect value={rateFacilityId} onChange={(e) => setRateFacilityId(e.target.value)}>
                <option value="">Organization-wide</option>
                {(facilitiesQuery.data?.items ?? []).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <label className="block space-y-1 text-sm">
              <Label>Vehicle type</Label>
              <NativeSelect value={rateVehicle} onChange={(e) => setRateVehicle(e.target.value as VehicleType)}>
                {vehicleTypes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </NativeSelect>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Base ₹" value={baseAmount} onChange={(e) => setBaseAmount(e.target.value)} />
              <Input placeholder="Per hour ₹" value={perHour} onChange={(e) => setPerHour(e.target.value)} />
            </div>
            <Button
              disabled={!rateProductId || createRateMutation.isPending}
              onClick={() => createRateMutation.mutate()}
            >
              Create rate
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Rates</CardTitle>
        </CardHeader>
        <CardContent>
          {ratesQuery.isLoading ? (
            <Spinner />
          ) : ratesQuery.isError ? (
            <ApiAlert message={ratesQuery.error instanceof Error ? ratesQuery.error.message : undefined} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(ratesQuery.data ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.product?.name ?? r.productId}</TableCell>
                    <TableCell>{r.vehicleType}</TableCell>
                    <TableCell className="font-mono text-xs">{r.facilityId?.slice(0, 8) ?? 'All'}</TableCell>
                    <TableCell className="text-right tabular-nums">₹{r.baseAmount}</TableCell>
                    <TableCell>{r.isActive ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
