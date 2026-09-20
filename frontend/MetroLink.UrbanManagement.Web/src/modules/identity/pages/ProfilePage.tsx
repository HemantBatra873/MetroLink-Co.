import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from '@enterprise/component-library'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export function ProfilePage() {
  const { session, logout } = useAuth()
  if (!session) return null

  return (
    <>
      <PageHeader title="Profile" description="Signed-in operator context for this browser session." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{session.displayName}</CardTitle>
            <CardDescription>Dev / Persona session (sessionStorage)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">User sub:</span>{' '}
              <code className="text-xs">{session.userSub}</code>
            </p>
            <p>
              <span className="text-muted-foreground">Organization:</span>{' '}
              <code className="text-xs">{session.organizationId}</code>
            </p>
            <p>
              <span className="text-muted-foreground">Payment roles:</span>{' '}
              {session.paymentRoles.join(', ') || '—'}
            </p>
            <p className="text-muted-foreground pt-2">
              Production: replace demo headers with Keycloak JWT (Authorization bearer) and permission
              claims from Persona.
            </p>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => {
                logout()
                window.location.assign('/login')
              }}
            >
              Sign out
            </button>
            <span className="text-muted-foreground"> · </span>
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              Switch demo identity
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>{session.permissions.length} codes in this session</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="max-h-64 overflow-auto text-xs font-mono space-y-1">
              {session.permissions.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
