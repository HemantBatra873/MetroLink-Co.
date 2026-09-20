import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  NativeSelect,
} from '@enterprise/component-library'
import { createSessionEntry, orgId } from '@/api/parking'
import type { EntryExitMethod, VehicleType } from '@/api/parking/types'
import { ApiAlert } from '@/shared/components/ApiAlert'

const vehicleTypes: VehicleType[] = ['Car', 'TwoWheeler', 'EV', 'Commercial', 'Bus', 'Other']
const entryMethods: EntryExitMethod[] = ['Manual', 'Qr', 'Rfid', 'Anpr', 'Sensor', 'External']

export function RecordEntryDialog({
  open,
  onOpenChange,
  facilityId,
  defaultZoneId,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  facilityId: string
  defaultZoneId?: string
  onCreated?: (sessionId: string) => void
}) {
  const client = useQueryClient()
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car')
  const [entryMethod, setEntryMethod] = useState<EntryExitMethod>('Manual')
  const [zoneId, setZoneId] = useState(defaultZoneId ?? '')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createSessionEntry({
        organizationId: orgId(),
        facilityId,
        zoneId: zoneId || null,
        vehiclePlate: vehiclePlate.trim(),
        vehicleType,
        entryMethod,
      }),
    onSuccess: (session) => {
      client.invalidateQueries({ queryKey: ['sessions'] })
      client.invalidateQueries({ queryKey: ['dashboard'] })
      client.invalidateQueries({ queryKey: ['occupancy'] })
      onOpenChange(false)
      setVehiclePlate('')
      onCreated?.(session.id)
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Entry failed'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record entry</DialogTitle>
          <DialogDescription>Register a vehicle entering this facility.</DialogDescription>
        </DialogHeader>
        {error && <ApiAlert message={error} />}
        <div className="space-y-3">
          <label className="block space-y-1 text-sm">
            <Label>License plate</Label>
            <Input value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} placeholder="ABC-1234" />
          </label>
          <label className="block space-y-1 text-sm">
            <Label>Vehicle type</Label>
            <NativeSelect value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)}>
              {vehicleTypes.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </NativeSelect>
          </label>
          <label className="block space-y-1 text-sm">
            <Label>Entry method</Label>
            <NativeSelect value={entryMethod} onChange={(e) => setEntryMethod(e.target.value as EntryExitMethod)}>
              {entryMethods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </NativeSelect>
          </label>
          <label className="block space-y-1 text-sm">
            <Label>Zone ID (optional)</Label>
            <Input value={zoneId} onChange={(e) => setZoneId(e.target.value)} placeholder="Zone GUID" />
          </label>
        </div>
        <DialogFooter>
          <Button variant="tertiary" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!vehiclePlate.trim() || mutation.isPending}
            onClick={() => {
              setError('')
              mutation.mutate()
            }}
          >
            Record entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
