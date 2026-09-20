import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  Spinner,
  Textarea,
} from '@enterprise/component-library'
import { useNavigate } from 'react-router-dom'
import {
  addEvidence,
  createCase,
  getCase,
  getConfigurationDomains,
  issueCase,
  orgId,
} from '@/api/enforcement'
import type { CreateCaseRequest, EnforcementDomain, EvidenceType } from '@/api/enforcement/types'
import { ApiAlert } from '@/shared/components/ApiAlert'

const steps = ['Domain', 'Subject', 'Violation', 'Location', 'Evidence', 'Review'] as const

export function CreateCasePage() {
  const navigate = useNavigate()
  const client = useQueryClient()
  const domainsQuery = useQuery({ queryKey: ['configuration', 'domains'], queryFn: getConfigurationDomains })

  const [step, setStep] = useState(0)
  const [domainId, setDomainId] = useState('')
  const [subjectTypeCode, setSubjectTypeCode] = useState('')
  const [subjectLabel, setSubjectLabel] = useState('')
  const [subjectExternalId, setSubjectExternalId] = useState('')
  const [violationTypeId, setViolationTypeId] = useState('')
  const [locationLabel, setLocationLabel] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [notes, setNotes] = useState('')
  const [evidenceTitle, setEvidenceTitle] = useState('')
  const [evidenceUri, setEvidenceUri] = useState('')
  const [issueAfterCreate, setIssueAfterCreate] = useState(true)
  const [error, setError] = useState('')

  const domain: EnforcementDomain | undefined = useMemo(
    () => domainsQuery.data?.find((d) => d.id === domainId),
    [domainsQuery.data, domainId],
  )

  const violation = domain?.violationTypes.find((v) => v.id === violationTypeId)

  const submit = useMutation({
    mutationFn: async () => {
      if (!domain) throw new Error('Select a domain')
      const body: CreateCaseRequest = {
        organizationId: orgId(),
        enforcementDomainId: domain.id,
        subjectTypeCode,
        subjectDisplayLabel: subjectLabel,
        subjectExternalId: subjectExternalId || null,
        violationTypeId,
        locationLabel: locationLabel || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        notes: notes || null,
      }
      let created = await createCase(body)
      if (evidenceTitle.trim()) {
        await addEvidence(created.id, {
          type: 'Photograph' as EvidenceType,
          title: evidenceTitle.trim(),
          uriOrValue: evidenceUri || null,
        })
        created = await getCase(created.id)
      }
      if (issueAfterCreate) {
        created = await issueCase(created.id, notes || undefined)
      }
      return created
    },
    onSuccess: (created) => {
      client.invalidateQueries({ queryKey: ['cases'] })
      client.invalidateQueries({ queryKey: ['dashboard'] })
      navigate(`/app/enforcement/cases/${created.id}`)
    },
    onError: (e) => setError(e instanceof Error ? e.message : 'Could not create case'),
  })

  function next() {
    setError('')
    if (step === 0 && !domainId) return setError('Choose an enforcement domain.')
    if (step === 1 && (!subjectTypeCode || !subjectLabel.trim()))
      return setError('Subject type and display label are required.')
    if (step === 2 && !violationTypeId) return setError('Select a violation type.')
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  function back() {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  return (
    <>
      <PageHeader
        title="Create enforcement case"
        description="Guided intake for field officers — draft, then optionally issue."
      />
      {domainsQuery.isError && (
        <ApiAlert message={domainsQuery.error instanceof Error ? domainsQuery.error.message : undefined} />
      )}
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
            {step === 0 && 'Pick parking, market, or another configured domain.'}
            {step === 1 && 'Who or what is being enforced against?'}
            {step === 2 && 'Select the violation and offence tier is inferred from rules.'}
            {step === 3 && 'Where did the violation occur?'}
            {step === 4 && 'Optional photo or document reference.'}
            {step === 5 && 'Confirm details before submitting.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {domainsQuery.isLoading ? (
            <Spinner />
          ) : (
            <>
              {step === 0 && (
                <label className="block space-y-2 text-sm">
                  <Label>Enforcement domain</Label>
                  <NativeSelect value={domainId} onChange={(e) => setDomainId(e.target.value)}>
                    <option value="">Select domain…</option>
                    {(domainsQuery.data ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </NativeSelect>
                </label>
              )}
              {step === 1 && domain && (
                <>
                  <label className="block space-y-2 text-sm">
                    <Label>Subject type</Label>
                    <NativeSelect
                      value={subjectTypeCode}
                      onChange={(e) => setSubjectTypeCode(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {domain.subjectTypes.map((s) => (
                        <option key={s.id} value={s.code}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </NativeSelect>
                  </label>
                  <label className="block space-y-2 text-sm">
                    <Label>Display label</Label>
                    <Input
                      value={subjectLabel}
                      onChange={(e) => setSubjectLabel(e.target.value)}
                      placeholder="e.g. MH12AB1234 or Stall #42"
                    />
                  </label>
                  <label className="block space-y-2 text-sm">
                    <Label>External ID (optional)</Label>
                    <Input
                      value={subjectExternalId}
                      onChange={(e) => setSubjectExternalId(e.target.value)}
                      placeholder="Plate number, license ID…"
                    />
                  </label>
                </>
              )}
              {step === 2 && domain && (
                <label className="block space-y-2 text-sm">
                  <Label>Violation type</Label>
                  <NativeSelect
                    value={violationTypeId}
                    onChange={(e) => setViolationTypeId(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {domain.violationTypes
                      .filter((v) => v.isActive)
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                  </NativeSelect>
                  {violation && (
                    <p className="text-xs text-muted-foreground">
                      Base penalty from rule tier 1:{' '}
                      {violation.penaltyRules[0]
                        ? `${violation.penaltyRules[0].currency} ${violation.penaltyRules[0].amount}`
                        : 'see configuration'}
                    </p>
                  )}
                </label>
              )}
              {step === 3 && (
                <>
                  <label className="block space-y-2 text-sm">
                    <Label>Location label</Label>
                    <Input
                      value={locationLabel}
                      onChange={(e) => setLocationLabel(e.target.value)}
                      placeholder="Street, zone, or landmark"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block space-y-2 text-sm">
                      <Label>Latitude</Label>
                      <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} inputMode="decimal" />
                    </label>
                    <label className="block space-y-2 text-sm">
                      <Label>Longitude</Label>
                      <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} inputMode="decimal" />
                    </label>
                  </div>
                  <label className="block space-y-2 text-sm">
                    <Label>Officer notes</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                  </label>
                </>
              )}
              {step === 4 && (
                <>
                  <label className="block space-y-2 text-sm">
                    <Label>Evidence title (optional)</Label>
                    <Input
                      value={evidenceTitle}
                      onChange={(e) => setEvidenceTitle(e.target.value)}
                      placeholder="Photo of violation"
                    />
                  </label>
                  <label className="block space-y-2 text-sm">
                    <Label>URI or reference</Label>
                    <Input
                      value={evidenceUri}
                      onChange={(e) => setEvidenceUri(e.target.value)}
                      placeholder="https://… or file ref"
                    />
                  </label>
                </>
              )}
              {step === 5 && (
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Domain</dt>
                    <dd className="font-medium text-right">{domain?.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Subject</dt>
                    <dd className="font-medium text-right">
                      {subjectLabel} ({subjectTypeCode})
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Violation</dt>
                    <dd className="font-medium text-right">{violation?.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium text-right">{locationLabel || '—'}</dd>
                  </div>
                  <label className="flex items-center gap-2 pt-2">
                    <Checkbox
                      checked={issueAfterCreate}
                      onCheckedChange={(v) => setIssueAfterCreate(v === true)}
                    />
                    <span>Issue case immediately (creates payable fine when configured)</span>
                  </label>
                </dl>
              )}
            </>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            {step > 0 && (
              <Button variant="secondary" type="button" onClick={back}>
                Back
              </Button>
            )}
            {step < steps.length - 1 ? (
              <Button type="button" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button loading={submit.isPending} type="button" onClick={() => submit.mutate()}>
                Create case
              </Button>
            )}
            <Button variant="ghost" type="button" onClick={() => navigate('/app/enforcement/cases')}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
