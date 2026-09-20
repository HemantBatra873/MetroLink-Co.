import React, { useState } from 'react';
import {
  Input, Textarea, Label,
  Checkbox, Switch, RadioGroup, RadioGroupItem,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  NativeSelect, NativeSelectOption,
  Slider,
  Toggle, ToggleGroup, ToggleGroupItem,
  InputOTP, InputOTPGroup, InputOTPSlot,
  Badge,
} from '@enterprise/component-library';

function Section({ title, desc, badge, children }: { title: string; desc?: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="comp-section">
      <div className="comp-section-header">
        <div>
          <h3 className="comp-section-title">{title}</h3>
          {desc && <p className="comp-section-desc">{desc}</p>}
        </div>
        {badge && <span className="comp-section-badge">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function VariantRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="variant-matrix-row">
      <span className="variant-matrix-label">{label}</span>
      <div className="variant-row">{children}</div>
    </div>
  );
}

// ─── Input View ────────────────────────────────────
export function InputView({ activeTab }: { activeTab: string }) {
  const [val, setVal] = useState('');

  if (activeTab === 'sandbox') return (
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

  return (
    <div className="comp-view">
      {/* Input */}
      <Section title="Input" desc="Single-line text inputs with tokenized borders and focus states." badge="Input">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.875rem', maxWidth: 480 }}>
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
        </div>
      </Section>

      {/* Textarea */}
      <Section title="Textarea" desc="Multi-line expandable text area." badge="Textarea">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.875rem', maxWidth: 480 }}>
            <div style={{ display: 'grid', gap: '0.25rem' }}>
              <Label htmlFor="ta-default">Default</Label>
              <Textarea id="ta-default" placeholder="Write a description…" rows={3} />
            </div>
            <div style={{ display: 'grid', gap: '0.25rem' }}>
              <Label htmlFor="ta-disabled">Disabled</Label>
              <Textarea id="ta-disabled" placeholder="Not editable" rows={3} disabled />
            </div>
          </div>
        </div>
      </Section>

      {/* Select */}
      <Section title="Select" desc="Custom floating option select picker." badge="Select">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.875rem', maxWidth: 360 }}>
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
            <div style={{ display: 'grid', gap: '0.25rem' }}>
              <Label>NativeSelect</Label>
              <NativeSelect defaultValue="high">
                <NativeSelectOption value="low">Low Priority</NativeSelectOption>
                <NativeSelectOption value="normal">Normal Priority</NativeSelectOption>
                <NativeSelectOption value="high">High Priority</NativeSelectOption>
                <NativeSelectOption value="critical">Critical / Blocker</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>
        </div>
      </Section>

      {/* Checkbox & Switch */}
      <Section title="Checkbox & Switch" desc="Boolean selection controls." badge="Checkbox / Switch">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.625rem' }}>
            <VariantRow label="Checkbox">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <Checkbox defaultChecked /> Checked by default
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <Checkbox /> Unchecked
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <Checkbox disabled /> Disabled
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <Checkbox disabled defaultChecked /> Disabled checked
              </label>
            </VariantRow>
            <VariantRow label="Switch">
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
          </div>
        </div>
      </Section>

      {/* RadioGroup */}
      <Section title="RadioGroup" desc="Mutually exclusive single-choice option group." badge="RadioGroup">
        <div className="debug-card">
          <div className="debug-card-body">
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
          </div>
        </div>
      </Section>

      {/* Slider */}
      <Section title="Slider" desc="Continuous and stepped range control." badge="Slider">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '1rem', maxWidth: 400 }}>
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
        </div>
      </Section>

      {/* InputOTP */}
      <Section title="InputOTP" desc="One-time passcode pin input slots." badge="InputOTP">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.875rem' }}>
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
        </div>
      </Section>
    </div>
  );
}
