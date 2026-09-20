import React from 'react';

export function Section({
  title,
  desc,
  badge,
  children,
}: {
  title: string;
  desc?: string;
  badge?: string;
  children: React.ReactNode;
}) {
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

export function VariantRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="variant-matrix-row">
      <span className="variant-matrix-label">{label}</span>
      <div className="variant-row">{children}</div>
    </div>
  );
}

export function DebugCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="debug-card">
      <div className="debug-card-body">{children}</div>
    </div>
  );
}

export function UnknownComponentSection({
  componentId,
  children,
}: {
  componentId: string;
  children?: React.ReactNode;
}) {
  return (
    <Section
      title={componentId}
      desc="Preview placeholder — expand this demo as the component evolves."
      badge={componentId}
    >
      <DebugCard>
        {children ?? (
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
            No dedicated playground section yet for <code>{componentId}</code>.
          </p>
        )}
      </DebugCard>
    </Section>
  );
}
