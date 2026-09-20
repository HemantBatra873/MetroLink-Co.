import React from 'react';
import {
  Message, MessageAvatar, MessageContent, MessageHeader, MessageFooter, MessageGroup,
  Bubble, BubbleContent, BubbleGroup,
  Avatar, AvatarFallback,
  Badge, Input, Button,
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

export function MessagingView({ activeTab }: { activeTab: string }) {
  return (
    <div className="comp-view">

      {/* Bubble variants */}
      <Section title="Bubble" desc="Chat bubble with variant styling and rounded tails." badge="Bubble">
        <div className="debug-card">
          <div className="debug-card-body" style={{ display: 'grid', gap: '0.75rem' }}>
            <div className="variant-matrix-row">
              <span className="variant-matrix-label">default</span>
              <Bubble variant="default"><BubbleContent>This is a default bubble message. It appears on the left side of a conversation.</BubbleContent></Bubble>
            </div>
            <div className="variant-matrix-row">
              <span className="variant-matrix-label">secondary</span>
              <Bubble variant="secondary"><BubbleContent>This is a secondary bubble. It appears on the right side — the user's own messages.</BubbleContent></Bubble>
            </div>
          </div>
        </div>
      </Section>

      {/* Full Message thread */}
      <Section title="Message Thread" desc="Full message thread with avatars, metadata, and mixed bubble types." badge="Message / MessageGroup">
        <div className="debug-card">
          <div className="debug-card-body">
            <MessageGroup style={{ maxWidth: 560, display: 'grid', gap: '0.875rem' }}>
              {/* AI message */}
              <Message align="start">
                <MessageAvatar>
                  <Avatar style={{ width: '1.75rem', height: '1.75rem' }}>
                    <AvatarFallback style={{ fontSize: '0.6rem', background: 'var(--muted)' }}>AI</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <MessageHeader>System Bot • Just now</MessageHeader>
                  <Bubble variant="default">
                    <BubbleContent>
                      Theme updated to <strong>dark</strong>. All 60+ components have re-rendered with active CSS custom properties.
                    </BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>

              {/* User message */}
              <Message align="end">
                <MessageContent>
                  <MessageHeader style={{ justifyContent: 'flex-end' }}>Admin User • Just now</MessageHeader>
                  <Bubble variant="secondary">
                    <BubbleContent>Verified! Both Light, Dark, and High-Contrast modes are completely synchronized.</BubbleContent>
                  </Bubble>
                  <MessageFooter style={{ justifyContent: 'flex-end', fontSize: '0.65rem' }}>Delivered &amp; Encrypted</MessageFooter>
                </MessageContent>
              </Message>

              {/* Another AI message */}
              <Message align="start">
                <MessageAvatar>
                  <Avatar style={{ width: '1.75rem', height: '1.75rem' }}>
                    <AvatarFallback style={{ fontSize: '0.6rem', background: 'var(--muted)' }}>AI</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <MessageHeader>System Bot • 1 min ago</MessageHeader>
                  <Bubble variant="default">
                    <BubbleContent>
                      Build pipeline completed in 42.7s. Bundle: <Badge variant="outline" style={{ fontSize: '0.65rem' }}>630 kB</Badge> / <Badge variant="outline" style={{ fontSize: '0.65rem' }}>196 kB gz</Badge>
                    </BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>

              {/* User again */}
              <Message align="end">
                <MessageContent>
                  <MessageHeader style={{ justifyContent: 'flex-end' }}>Admin User • 1 min ago</MessageHeader>
                  <Bubble variant="secondary">
                    <BubbleContent>Great, please trigger the deployment to staging.</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            </MessageGroup>
          </div>
        </div>
      </Section>

      {/* BubbleGroup */}
      <Section title="BubbleGroup" desc="Stacked message bubbles from the same participant." badge="BubbleGroup">
        <div className="debug-card">
          <div className="debug-card-body">
            <BubbleGroup style={{ display: 'grid', gap: '0.25rem', maxWidth: 400 }}>
              <Bubble variant="default"><BubbleContent>First message in the group.</BubbleContent></Bubble>
              <Bubble variant="default"><BubbleContent>Second consecutive message from same sender.</BubbleContent></Bubble>
              <Bubble variant="default"><BubbleContent>Third message — grouped without avatar repetition.</BubbleContent></Bubble>
            </BubbleGroup>
          </div>
        </div>
      </Section>
    </div>
  );
}
