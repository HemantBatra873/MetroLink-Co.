import { useQuery } from '@tanstack/react-query'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@enterprise/component-library'
import { getConfigurationDomains } from '@/api/enforcement'
import { ApiAlert } from '@/shared/components/ApiAlert'

export function ConfigurationPage() {
  const query = useQuery({ queryKey: ['configuration', 'domains'], queryFn: getConfigurationDomains })

  return (
    <>
      <PageHeader
        title="Configuration"
        description="Domains, violation types, and penalty rules for your organization."
      />
      {query.isError && <ApiAlert message={query.error instanceof Error ? query.error.message : undefined} />}
      {query.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          {(query.data ?? []).map((domain) => (
            <Card key={domain.id}>
              <CardHeader>
                <CardTitle>
                  {domain.name}{' '}
                  <span className="text-sm font-normal text-muted-foreground">({domain.code})</span>
                </CardTitle>
                <CardDescription>{domain.description ?? 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion defaultValue={['subjects', 'violations']}>
                  <AccordionItem value="subjects">
                    <AccordionTrigger>Subject types ({domain.subjectTypes.length})</AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>External hint</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {domain.subjectTypes.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell>{s.code}</TableCell>
                              <TableCell>{s.name}</TableCell>
                              <TableCell>{s.externalSystemHint ?? '—'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="violations">
                    <AccordionTrigger>Violation types ({domain.violationTypes.length})</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      {domain.violationTypes.map((v) => (
                        <div key={v.id} className="rounded-md border border-border p-3">
                          <p className="font-medium">
                            {v.name} <span className="text-muted-foreground">({v.code})</span>
                          </p>
                          {v.description && (
                            <p className="text-sm text-muted-foreground mb-2">{v.description}</p>
                          )}
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Offence #</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Effective</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {v.penaltyRules.map((r) => (
                                <TableRow key={r.id}>
                                  <TableCell>{r.offenceNumber}</TableCell>
                                  <TableCell>
                                    {r.currency} {r.amount.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">
                                    {new Date(r.effectiveFrom).toLocaleDateString()}
                                    {r.effectiveTo
                                      ? ` – ${new Date(r.effectiveTo).toLocaleDateString()}`
                                      : ''}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="actions">
                    <AccordionTrigger>Action types ({domain.actionTypes.length})</AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Outcome</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {domain.actionTypes.map((a) => (
                            <TableRow key={a.id}>
                              <TableCell>{a.code}</TableCell>
                              <TableCell>{a.name}</TableCell>
                              <TableCell>{a.outcomeKind}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
