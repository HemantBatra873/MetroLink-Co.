import React from 'react';
import {
  Message, MessageAvatar, MessageContent, MessageHeader, MessageFooter, MessageGroup,
  Bubble, BubbleContent, BubbleGroup,
  MessageScroller, MessageScrollerViewport, MessageScrollerContent, MessageScrollerButton,
  Attachment, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentMedia,
  Avatar, AvatarFallback,
  Badge, Button,
  FileText,
} from '@enterprise/component-library';
import { Section, DebugCard, UnknownComponentSection } from './Section.js';

type Props = { componentId?: string; activeTab?: string };

export function MessagingView({ componentId = 'bubble' }: Props) {
  let section: React.ReactNode = null;

  switch (componentId) {
    case 'bubble':
      section = (
        <Section title="Bubble" desc="Chat bubble with variant styling and rounded tails." badge="Bubble">
          <DebugCard>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <Bubble variant="default"><BubbleContent>Default bubble on the left.</BubbleContent></Bubble>
              <Bubble variant="secondary"><BubbleContent>Secondary bubble on the right.</BubbleContent></Bubble>
            </div>
          </DebugCard>
        </Section>
      );
      break;

    case 'message':
      section = (
        <Section title="Message" desc="Full message thread with avatars, metadata, and bubbles." badge="Message">
          <DebugCard>
            <MessageGroup style={{ maxWidth: 560, display: 'grid', gap: '0.875rem' }}>
              <Message align="start">
                <MessageAvatar>
                  <Avatar style={{ width: '1.75rem', height: '1.75rem' }}>
                    <AvatarFallback style={{ fontSize: '0.6rem' }}>AI</AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <MessageHeader>System Bot • Just now</MessageHeader>
                  <Bubble variant="default">
                    <BubbleContent>Theme updated to <strong>dark</strong>.</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
              <Message align="end">
                <MessageContent>
                  <MessageHeader style={{ justifyContent: 'flex-end' }}>Admin • Just now</MessageHeader>
                  <Bubble variant="secondary">
                    <BubbleContent>Verified across Light and Dark modes.</BubbleContent>
                  </Bubble>
                  <MessageFooter style={{ justifyContent: 'flex-end', fontSize: '0.65rem' }}>Delivered</MessageFooter>
                </MessageContent>
              </Message>
            </MessageGroup>
          </DebugCard>
        </Section>
      );
      break;

    case 'bubble-group':
      section = (
        <Section title="BubbleGroup" desc="Stacked message bubbles from the same participant." badge="BubbleGroup">
          <DebugCard>
            <BubbleGroup style={{ display: 'grid', gap: '0.25rem', maxWidth: 400 }}>
              <Bubble variant="default"><BubbleContent>First message in the group.</BubbleContent></Bubble>
              <Bubble variant="default"><BubbleContent>Second consecutive message.</BubbleContent></Bubble>
              <Bubble variant="default"><BubbleContent>Third — grouped without avatar repetition.</BubbleContent></Bubble>
            </BubbleGroup>
          </DebugCard>
        </Section>
      );
      break;

    case 'message-scroller':
      section = (
        <Section title="MessageScroller" desc="Auto-scrolling viewport for chat threads." badge="MessageScroller">
          <DebugCard>
            <MessageScroller style={{ height: 200, border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
              <MessageScrollerViewport>
                <MessageScrollerContent style={{ display: 'grid', gap: '0.5rem', padding: '0.75rem' }}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <Bubble key={i} variant={i % 2 ? 'secondary' : 'default'}>
                      <BubbleContent>Message line {i + 1}</BubbleContent>
                    </Bubble>
                  ))}
                </MessageScrollerContent>
                <MessageScrollerButton direction="end" />
              </MessageScrollerViewport>
            </MessageScroller>
          </DebugCard>
        </Section>
      );
      break;

    case 'attachment':
      section = (
        <Section title="Attachment" desc="File attachment chip for messaging UIs." badge="Attachment">
          <DebugCard>
            <Attachment>
              <AttachmentMedia variant="icon"><FileText className="h-4 w-4" /></AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>release-notes.pdf</AttachmentTitle>
                <AttachmentDescription>240 KB · Ready</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          </DebugCard>
        </Section>
      );
      break;

    default:
      section = (
        <UnknownComponentSection componentId={componentId}>
          <Bubble variant="default"><BubbleContent>Preview</BubbleContent></Bubble>
        </UnknownComponentSection>
      );
  }

  return <div className="comp-view">{section}</div>;
}
