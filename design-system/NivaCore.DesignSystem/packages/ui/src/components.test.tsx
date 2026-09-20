import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button, Card, Input } from './index.js';

describe('shared controls', () => {
  it('renders a disabled loading button with native semantics', () => {
    const html = renderToStaticMarkup(<Button loading data-testid="save">Save</Button>);
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-busy="true"');
  });
  it('forwards native form-control attributes', () => {
    expect(renderToStaticMarkup(<Input aria-invalid="true" />)).toContain('aria-invalid="true"');
  });
  it('renders the generated shadcn Card base', () => {
    expect(renderToStaticMarkup(<Card>Content</Card>)).toContain('data-slot="card"');
  });
});
