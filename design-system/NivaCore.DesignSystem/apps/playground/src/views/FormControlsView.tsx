import React, { useState } from 'react';
import {
  Input, Textarea, Label,
  Checkbox, Switch, RadioGroup, RadioGroupItem,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  NativeSelect, NativeSelectOption,
  Slider,
  Toggle, ToggleGroup, ToggleGroupItem,
  InputOTP, InputOTPGroup, InputOTPSlot,
  Field, FieldLabel, FieldDescription, FieldGroup,
  InputGroup, InputGroupAddon, InputGroupInput, InputGroupText,
  Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem,
  Search,
} from '@enterprise/component-library';
import { Section, VariantRow, DebugCard, UnknownComponentSection } from './Section.js';

type Props = { componentId?: string; activeTab?: string };

export function FormControlsView({ componentId = 'input', activeTab = 'preview' }: Props) {
  const [val, setVal] = useState('');

  if (activeTab === 'sandbox' && componentId === 'input') {
    return (
      <div className="comp-view">
        <Section title="Interactive Sandbox">
          <div className="sandbox-split">
            <div className="sandbox-preview" style={{ flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch', maxWidth: 360, width: '100%' }}>
              <Label htmlFor="sb-input">Email address</Label>
              <Input id="sb-input" type="email" placeholder="hello@example.com" value={val} onChange={e => setVal(e.target.value)} />
            </div>
            <div className="sandbox-controls">
              <div className="sandbox-controls-header">Props</div>
              <div className="sandbox-control-row">
                <label className="sandbox-control-label">value</label>
                <input type="text" value={val} onChange={e => setVal(e.target.value)} />
              </div>
            </div>
          </div>
        </Section>
      </div>
    );
  }

  let section: React.ReactNode = null;

  switch (componentId) {
    case 'input':
      section = (
        <Section title="Input" desc="Single-line text inputs with tokenized borders and focus states." badge="Input">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.875rem', maxWidth: 480 }}>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <Label htmlFor="i-default">Default</Label>
                <Input id="i-default" placeholder="Type something…" />
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <Label htmlFor="i-email">Email type</Label>
                <Input id="i-email" type="email" placeholder="user@company.com" />
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <Label htmlFor="i-pass">Password</Label>
                <Input id="i-pass" type="password" placeholder="••••••••" />
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <Label htmlFor="i-disabled">Disabled</Label>
                <Input id="i-disabled" placeholder="Not editable" disabled />
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <Label htmlFor="i-invalid">Invalid / Error state</Label>
                <Input id="i-invalid" placeholder="Bad value" aria-invalid="true" />
              </div>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'textarea':
      section = (
        <Section title="Textarea" desc="Multi-line expandable text area." badge="Textarea">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.875rem', maxWidth: 480 }}>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <Label htmlFor="ta-default">Default</Label>
                <Textarea id="ta-default" placeholder="Write a description…" rows={3} />
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <Label htmlFor="ta-disabled">Disabled</Label>
                <Textarea id="ta-disabled" placeholder="Not editable" rows={3} disabled />
              </div>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'select':
      section = (
        <Section title="Select" desc="Custom floating option select picker." badge="Select">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.875rem', maxWidth: 360 }}>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <Label>Custom Select</Label>
                <Select defaultValue="us-east">
                  <SelectTrigger><SelectValue placeholder="Choose region" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east">US East (N. Virginia)</SelectItem>
                    <SelectItem value="us-west">US West (Oregon)</SelectItem>
                    <SelectItem value="eu-central">EU (Frankfurt)</SelectItem>
                    <SelectItem value="ap-southeast">AP (Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'native-select':
      section = (
        <Section title="NativeSelect" desc="High-performance native browser select." badge="NativeSelect">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.25rem', maxWidth: 360 }}>
              <Label>Priority</Label>
              <NativeSelect defaultValue="high">
                <NativeSelectOption value="low">Low Priority</NativeSelectOption>
                <NativeSelectOption value="normal">Normal Priority</NativeSelectOption>
                <NativeSelectOption value="high">High Priority</NativeSelectOption>
                <NativeSelectOption value="critical">Critical / Blocker</NativeSelectOption>
              </NativeSelect>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'checkbox':
      section = (
        <Section title="Checkbox" desc="Boolean selection control." badge="Checkbox">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.625rem' }}>
              <VariantRow label="states">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <Checkbox defaultChecked /> Checked by default
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <Checkbox /> Unchecked
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <Checkbox disabled /> Disabled
                </label>
              </VariantRow>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'switch':
      section = (
        <Section title="Switch" desc="High-visibility boolean toggle switch." badge="Switch">
          <DebugCard>
            <VariantRow label="states">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <Switch defaultChecked /> Enabled
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <Switch /> Off
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <Switch disabled /> Disabled
              </label>
            </VariantRow>
          </DebugCard>
        </Section>
      );
      break;

    case 'radio-group':
      section = (
        <Section title="RadioGroup" desc="Mutually exclusive single-choice option group." badge="RadioGroup">
          <DebugCard>
            <RadioGroup defaultValue="option-1" style={{ display: 'grid', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RadioGroupItem value="option-1" id="r1" />
                <Label htmlFor="r1">Option 1 — Automatic scaling</Label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RadioGroupItem value="option-2" id="r2" />
                <Label htmlFor="r2">Option 2 — Manual scaling</Label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RadioGroupItem value="option-3" id="r3" disabled />
                <Label htmlFor="r3" style={{ opacity: 0.5 }}>Option 3 — Disabled</Label>
              </div>
            </RadioGroup>
          </DebugCard>
        </Section>
      );
      break;

    case 'slider':
      section = (
        <Section title="Slider" desc="Continuous and stepped range control." badge="Slider">
          <DebugCard>
            <div style={{ display: 'grid', gap: '1rem', maxWidth: 400 }}>
              <div style={{ display: 'grid', gap: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <Label>Threshold Allocation</Label>
                  <span style={{ fontFamily: 'monospace', color: 'var(--muted-foreground)' }}>65%</span>
                </div>
                <Slider defaultValue={[65]} max={100} step={5} />
              </div>
              <div style={{ display: 'grid', gap: '0.375rem' }}>
                <Label>Disabled slider</Label>
                <Slider defaultValue={[40]} max={100} disabled />
              </div>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'input-otp':
      section = (
        <Section title="InputOTP" desc="One-time passcode pin input slots." badge="InputOTP">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gap: '0.375rem' }}>
                <Label>4-digit PIN</Label>
                <InputOTP maxLength={4} defaultValue="4829">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div style={{ display: 'grid', gap: '0.375rem' }}>
                <Label>6-digit OTP</Label>
                <InputOTP maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'label':
      section = (
        <Section title="Label" desc="Accessible form control title." badge="Label">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 360 }}>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <Label htmlFor="lbl-demo">Service name</Label>
                <Input id="lbl-demo" placeholder="billing-portal" />
              </div>
              <Label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Secondary label style</Label>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'field':
      section = (
        <Section title="Field" desc="Structured label, control, and helper text." badge="Field">
          <DebugCard>
            <FieldGroup style={{ maxWidth: 400 }}>
              <Field>
                <FieldLabel htmlFor="field-api-key">API Key</FieldLabel>
                <Input id="field-api-key" placeholder="sk_live_…" />
                <FieldDescription>Rotate keys from the security console.</FieldDescription>
              </Field>
            </FieldGroup>
          </DebugCard>
        </Section>
      );
      break;

    case 'input-group':
      section = (
        <Section title="InputGroup" desc="Input with inline addons and icons." badge="InputGroup">
          <DebugCard>
            <InputGroup style={{ maxWidth: 360 }}>
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search services…" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>.com</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </DebugCard>
        </Section>
      );
      break;

    case 'toggle':
      section = (
        <Section title="Toggle" desc="Two-state button for formatting preferences." badge="Toggle">
          <DebugCard>
            <Toggle aria-label="Bold"><strong>B</strong></Toggle>
          </DebugCard>
        </Section>
      );
      break;

    case 'toggle-group':
      section = (
        <Section title="ToggleGroup" desc="Grouped toggles with single or multiple select." badge="ToggleGroup">
          <DebugCard>
            <ToggleGroup defaultValue={['bold']}>
              <ToggleGroupItem value="bold" aria-label="Bold"><strong>B</strong></ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic"><em>I</em></ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Underline"><u>U</u></ToggleGroupItem>
            </ToggleGroup>
          </DebugCard>
        </Section>
      );
      break;

    case 'combobox':
      section = (
        <Section title="Combobox" desc="Searchable select with custom filtering." badge="Combobox">
          <DebugCard>
            <div style={{ maxWidth: 360 }}>
            <Combobox defaultValue="us-east">
              <ComboboxInput placeholder="Select region…" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="us-east">US East</ComboboxItem>
                  <ComboboxItem value="us-west">US West</ComboboxItem>
                  <ComboboxItem value="eu-central">EU Central</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    default:
      section = (
        <UnknownComponentSection componentId={componentId}>
          <Input placeholder={`${componentId} preview`} disabled />
        </UnknownComponentSection>
      );
  }

  return <div className="comp-view">{section}</div>;
}
