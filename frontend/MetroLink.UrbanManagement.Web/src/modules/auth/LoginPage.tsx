import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@enterprise/component-library'
import { useAuth } from '@/auth/AuthContext'
import { parsePermissionList, type PaymentRole } from '@/auth/permissions'
import { defaultSessionFromEnv, type AuthSession } from '@/auth/session'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const defaults = defaultSessionFromEnv()

  const [displayName, setDisplayName] = useState(defaults.displayName)
  const [userSub, setUserSub] = useState(defaults.userSub)
  const [organizationId, setOrganizationId] = useState(defaults.organizationId)
  const [paymentRoles, setPaymentRoles] = useState(defaults.paymentRoles.join(', '))
  const [permissions, setPermissions] = useState(defaults.permissions.join(', '))

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const submit = () => {
    const session: AuthSession = {
      displayName: displayName.trim() || 'Demo Operator',
      userSub: userSub.trim(),
      organizationId: organizationId.trim(),
      paymentRoles: paymentRoles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean) as PaymentRole[],
      permissions: parsePermissionList(permissions),
    }
    login(session)
    navigate('/app')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Sign in (development)</CardTitle>
          <CardDescription>
            Sets a demo session in <code className="text-xs">sessionStorage</code> and sends{' '}
            <code className="text-xs">X-Test-User-Sub</code> /{' '}
            <code className="text-xs">X-Test-User-Roles</code> on API calls. Production uses
            Keycloak JWT via Persona.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="userSub">User sub (X-Test-User-Sub)</Label>
            <Input id="userSub" value={userSub} onChange={(e) => setUserSub(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="orgId">Organization ID</Label>
            <Input id="orgId" value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="roles">Payment roles (comma-separated)</Label>
            <Input id="roles" value={paymentRoles} onChange={(e) => setPaymentRoles(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="permissions">Permissions (comma-separated)</Label>
            <Textarea
              id="permissions"
              rows={4}
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
            />
          </div>
          <Button type="button" onClick={submit} className="w-full">
            Continue to workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
