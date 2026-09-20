import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Spinner } from '@enterprise/component-library'
import { Building2, KeyRound, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { get, type PersonaEntity } from '@/api/persona'
import { ApiAlert } from '@/shared/components/ApiAlert'

export function AdminOverviewPage() {
  const orgs = useQuery({ queryKey: ['identity', 'organizations'], queryFn: () => get<PersonaEntity[]>('/organizations') })
  const users = useQuery({ queryKey: ['identity', 'users'], queryFn: () => get<PersonaEntity[]>('/users') })
  const roles = useQuery({ queryKey: ['identity', 'roles'], queryFn: () => get<PersonaEntity[]>('/roles') })
  const memberships = useQuery({
    queryKey: ['identity', 'memberships'],
    queryFn: () => get<PersonaEntity[]>('/memberships'),
  })

  const failed = [orgs, users, roles, memberships].some((q) => q.isError)
  const loading = [orgs, users, roles, memberships].some((q) => q.isLoading)

  const cards = [
    { label: 'Organizations', value: orgs.data?.length, icon: Building2, to: '/app/administration/organizations' },
    { label: 'People', value: users.data?.length, icon: Users, to: '/app/administration/users' },
    { label: 'Roles', value: roles.data?.length, icon: ShieldCheck, to: '/app/administration/roles' },
    { label: 'Memberships', value: memberships.data?.length, icon: UserPlus, to: '/app/administration/memberships' },
    { label: 'Permissions', value: '—', icon: KeyRound, to: '/app/administration/permissions' },
  ]

  return (
    <>
      <PageHeader
        title="Administration"
        description="Identity platform — organizations, roles, and access assignments."
      />
      {failed && <ApiAlert message="Could not reach Identity API on port 5265." />}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ label, value, icon: Icon, to }) => (
            <Link key={to} to={to}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums">{value ?? '—'}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
