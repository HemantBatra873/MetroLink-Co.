import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  PageHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@enterprise/component-library'
import { Plus, RefreshCw } from 'lucide-react'
import { displayTitle, get, post, type PersonaEntity } from '@/api/persona'
import { ApiAlert } from '@/shared/components/ApiAlert'

export type AdminResource =
  | 'organizations'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'memberships'
  | 'areas'

const endpoints: Record<AdminResource, string> = {
  organizations: '/organizations',
  users: '/users',
  roles: '/roles',
  permissions: '/permissions',
  memberships: '/memberships',
  areas: '/areas',
}

const titles: Record<AdminResource, string> = {
  organizations: 'Organizations',
  users: 'Users',
  roles: 'Roles',
  permissions: 'Permissions',
  memberships: 'Memberships',
  areas: 'Areas',
}

export function AdminResourcePage({ resource }: { resource: AdminResource }) {
  const [open, setOpen] = useState(false)
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['identity', resource],
    queryFn: () => get<PersonaEntity[]>(endpoints[resource]),
  })

  return (
    <>
      <PageHeader
        title={titles[resource]}
        description={
          resource === 'users'
            ? 'Users synchronized from Keycloak via the Identity API.'
            : `Manage ${resource} for your urban platform tenant.`
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="tertiary" type="button" onClick={() => query.refetch()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Add {resource.slice(0, -1)}
            </Button>
          </div>
        }
      />
      {query.isError && (
        <ApiAlert
          message={
            query.error instanceof Error
              ? query.error.message
              : 'Identity API unreachable on port 5265.'
          }
        />
      )}
      {query.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code / email</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No {resource} yet. Add the first record to get started.
                  </TableCell>
                </TableRow>
              ) : (
                (query.data ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium">{displayTitle(row)}</p>
                      {row.displayName && row.email && (
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{row.code || row.email || row.keycloakUserId || '—'}</code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.description ||
                        (row.role
                          ? `${displayTitle(row.role)} · ${displayTitle(row.organization || {})}`
                          : row.units
                            ? `${row.units.length} units · ${row.areas?.length || 0} areas`
                            : '—')}
                    </TableCell>
                    <TableCell>
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <CreateResourceDialog
        resource={resource}
        open={open}
        onOpenChange={setOpen}
        onCreated={() => {
          client.invalidateQueries({ queryKey: ['identity', resource] })
          setOpen(false)
        }}
      />
    </>
  )
}

function CreateResourceDialog({
  resource,
  open,
  onOpenChange,
  onCreated,
}: {
  resource: AdminResource
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [error, setError] = useState('')
  const mutation = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const data = new FormData(form)
      const v = (name: string) => String(data.get(name) || '')
      const nullable = (name: string) => v(name) || null
      if (resource === 'organizations') return post('/organizations', { name: v('name'), code: v('code') })
      if (resource === 'users')
        return post('/users/sync', {
          keycloakUserId: v('keycloakUserId'),
          email: v('email'),
          displayName: v('displayName'),
        })
      if (resource === 'permissions')
        return post('/permissions', { code: v('code'), description: v('description') })
      if (resource === 'roles')
        return post('/roles', {
          organizationId: nullable('organizationId'),
          name: v('name'),
          code: v('code'),
          permissionIds: [],
        })
      if (resource === 'areas')
        return post('/areas', {
          organizationId: v('organizationId'),
          parentAreaId: null,
          name: v('name'),
          code: v('code'),
        })
      return post('/memberships', {
        userId: v('userId'),
        organizationId: v('organizationId'),
        organizationUnitId: null,
        roleId: v('roleId'),
        scopeAreaId: null,
      })
    },
    onSuccess: onCreated,
    onError: (e) => setError(e instanceof Error ? e.message : 'Could not save record'),
  })

  const fields: Array<{ name: string; label: string; required: boolean }> =
    resource === 'users'
      ? [
          { name: 'displayName', label: 'Display name', required: true },
          { name: 'email', label: 'Email address', required: true },
          { name: 'keycloakUserId', label: 'Keycloak user ID', required: true },
        ]
      : resource === 'permissions'
        ? [
            { name: 'code', label: 'Permission code', required: true },
            { name: 'description', label: 'Description', required: true },
          ]
        : resource === 'memberships'
          ? [
              { name: 'userId', label: 'User ID', required: true },
              { name: 'organizationId', label: 'Organization ID', required: true },
              { name: 'roleId', label: 'Role ID', required: true },
            ]
          : resource === 'areas'
            ? [
                { name: 'name', label: 'Area name', required: true },
                { name: 'code', label: 'Area code', required: true },
                { name: 'organizationId', label: 'Organization ID', required: true },
              ]
            : resource === 'roles'
              ? [
                  { name: 'name', label: 'Role name', required: true },
                  { name: 'code', label: 'Role code', required: true },
                  { name: 'organizationId', label: 'Organization ID (optional)', required: false },
                ]
              : [
                  { name: 'name', label: 'Organization name', required: true },
                  { name: 'code', label: 'Organization code', required: true },
                ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setError('')
            mutation.mutate(e.currentTarget)
          }}
        >
          <DialogHeader>
            <DialogTitle>Create {resource.slice(0, -1)}</DialogTitle>
            <DialogDescription>Creates a record via the Identity API.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {fields.map(({ name, label, required }) => (
              <div key={name} className="grid gap-1.5">
                <Label htmlFor={name}>{label}</Label>
                <Input id={name} name={name} required={required} placeholder={label} />
              </div>
            ))}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="tertiary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
