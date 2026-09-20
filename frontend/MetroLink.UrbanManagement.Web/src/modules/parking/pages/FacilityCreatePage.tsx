import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  NativeSelect,
  PageHeader,
  Textarea,
} from '@enterprise/component-library'
import { useNavigate } from 'react-router-dom'
import { createFacility, orgId, submitFacility } from '@/api/parking'
import type { CreateFacilityRequest, FacilityType, OccupancyMode, VehicleType } from '@/api/parking/types'
import { ApiAlert } from '@/shared/components/ApiAlert'

const steps = ['Basic', 'Location', 'Capacity', 'Hours', 'Review'] as const

const facilityTypes: FacilityType[] = ['Surface', 'Multilevel', 'Underground', 'OnStreet', 'Mixed']
const occupancyModes: OccupancyMode[] = ['Capacity', 'IndividualSpaces', 'Integrated']
const vehicleTypes: VehicleType[] = ['Car', 'TwoWheeler', 'EV', 'Commercial', 'Bus', 'Other']

export function FacilityCreatePage() {
  const navigate = useNavigate()
  const client = useQueryClient()

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [facilityType, setFacilityType] = useState<FacilityType>('Surface')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [totalCapacity, setTotalCapacity] = useState('100')
  const [occupancyMode, setOccupancyMode] = useState<OccupancyMode>('Capacity')
  const [selectedVehicles, setSelectedVehicles] = useState<VehicleType[]>(['Car', 'TwoWheeler'])
  const [hoursJson, setHoursJson] = useState('{"mon-fri":"06:00-22:00","sat-sun":"08:00-20:00"}')
  const [submitAfterCreate, setSubmitAfterCreate] = useState(true)
  const [error, setError] = useState('')

  const toggleVehicle = (v: VehicleType) => {
    setSelectedVehicles((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
  }

  const submit = useMutation({
    mutationFn: async () => {
      const body: CreateFacilityRequest = {
        organizationId: orgId(),
        ownerOrganizationId: orgId(),
        operatorOrganizationId: orgId(),
        name: name.trim(),
        code: code.trim(),
        description: description.trim() || null,
        facilityType,
        address: address.trim() || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        totalCapacity: Number(totalCapacity) || 0,
        occupancyMode,
        vehicleTypesCsv: selectedVehicles.join(','),
        operatingHoursJson: hoursJson.trim() || null,
      }
      let created = await createFacility(body)
      if (submitAfterCreate) {
        created = await submitFacility(created.id)
      }
      return created
    },
    onSuccess: (created) => {
      client.invalidateQueries({ queryKey: ['facilities'] })
      client.invalidateQueries({ queryKey: ['dashboard'] })
      navigate(`/app/parking/facilities/${created.id}`)
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Could not create facility'),
  })

  function next() {
    setError('')
    if (step === 0 && (!name.trim() || !code.trim()))
      return setError('Name and code are required.')
    if (step === 2 && (!totalCapacity || Number(totalCapacity) <= 0))
      return setError('Enter a valid capacity.')
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  function back() {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  return (
    <>
      <PageHeader
        title="Register parking facility"
        description="Multi-step wizard — save as draft and submit for verification."
      />
      {error && <ApiAlert message={error} />}
      <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {steps.map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-muted' : 'border border-border'}`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
          <CardDescription>
            {step === 0 && 'Identity and facility classification.'}
            {step === 1 && 'Physical location for maps and citizen discovery.'}
            {step === 2 && 'Capacity, occupancy tracking mode, and allowed vehicles.'}
            {step === 3 && 'Operating hours JSON for public display.'}
            {step === 4 && 'Confirm and create facility record.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <label className="block space-y-2 text-sm">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="block space-y-2 text-sm">
                <Label>Code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="LOT-001" />
              </label>
              <label className="block space-y-2 text-sm">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </label>
              <label className="block space-y-2 text-sm">
                <Label>Facility type</Label>
                <NativeSelect
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value as FacilityType)}
                >
                  {facilityTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </NativeSelect>
              </label>
            </>
          )}
          {step === 1 && (
            <>
              <label className="block space-y-2 text-sm">
                <Label>Address</Label>
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-sm">
                  <Label>Latitude</Label>
                  <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} />
                </label>
                <label className="block space-y-2 text-sm">
                  <Label>Longitude</Label>
                  <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} />
                </label>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <label className="block space-y-2 text-sm">
                <Label>Total capacity</Label>
                <Input type="number" value={totalCapacity} onChange={(e) => setTotalCapacity(e.target.value)} />
              </label>
              <label className="block space-y-2 text-sm">
                <Label>Occupancy mode</Label>
                <NativeSelect
                  value={occupancyMode}
                  onChange={(e) => setOccupancyMode(e.target.value as OccupancyMode)}
                >
                  {occupancyModes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              <div className="space-y-2">
                <Label>Vehicle types</Label>
                <div className="flex flex-wrap gap-3">
                  {vehicleTypes.map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={selectedVehicles.includes(v)} onCheckedChange={() => toggleVehicle(v)} />
                      {v}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <label className="block space-y-2 text-sm">
              <Label>Operating hours (JSON)</Label>
              <Textarea value={hoursJson} onChange={(e) => setHoursJson(e.target.value)} rows={4} className="font-mono text-xs" />
            </label>
          )}
          {step === 4 && (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Code</dt>
                <dd className="font-medium">{code}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd>{facilityType}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Capacity</dt>
                <dd>{totalCapacity}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Address</dt>
                <dd>{address || '—'}</dd>
              </div>
              <label className="sm:col-span-2 flex items-center gap-2 pt-2">
                <Checkbox checked={submitAfterCreate} onCheckedChange={(c) => setSubmitAfterCreate(Boolean(c))} />
                <span className="text-sm">Submit for verification after create</span>
              </label>
            </dl>
          )}
          <div className="flex justify-between pt-4">
            <Button variant="tertiary" type="button" disabled={step === 0} onClick={back}>
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button type="button" disabled={submit.isPending} onClick={() => submit.mutate()}>
                Create facility
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
