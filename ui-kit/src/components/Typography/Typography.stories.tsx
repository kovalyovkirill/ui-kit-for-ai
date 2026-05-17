import { type Meta, type StoryObj } from '@storybook/react'

import { Typography } from './Typography'
import { type TypographyProps } from './Typography.types'

const meta: Meta<TypographyProps> = {
  title: 'Components/Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'display',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'bodyLg',
        'body',
        'bodySm',
        'label',
        'caption',
        'overline',
      ],
    },
    color: {
      control: 'select',
      options: [
        'foreground-primary',
        'foreground-secondary',
        'foreground-tertiary',
        'foreground-quaternary',
        'foreground-on-accent',
        'neutrals-background',
        'neutrals-surface',
        'neutrals-subtle',
        'neutrals-muted',
        'neutrals-emphasis',
        'border-default',
        'border-strong',
        'accents-brand',
        'accents-success',
        'accents-info',
        'accents-danger',
        'accents-warning',
        'tint-brand',
        'tint-danger',
        'tint-success',
        'tint-info',
        'tint-warning',
        'interactive-brand-default',
        'interactive-brand-hover',
        'interactive-brand-active',
        'interactive-brand-disabled',
        'interactive-danger-default',
        'interactive-danger-hover',
        'interactive-danger-active',
        'interactive-danger-disabled',
        'interactive-secondary-default',
        'interactive-secondary-hover',
        'interactive-secondary-active',
        'interactive-secondary-disabled',
        'focus-ring-brand',
        'focus-ring-danger',
        'focus-ring-neutral',
      ],
    },
    children: { control: 'text' },
  },
  args: {
    variant: 'body',
    color: 'foreground-primary',
    children: 'The quick brown fox jumps over the lazy dog.',
  },
}

export default meta
type Story = StoryObj<TypographyProps>

export const Default: Story = {}

export const Display: Story = {
  args: { variant: 'display', children: 'Design System' },
}

export const Headings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Typography variant="h1">H1 — Design System</Typography>
      <Typography variant="h2">H2 — Design System</Typography>
      <Typography variant="h3">H3 — Design System</Typography>
      <Typography variant="h4">H4 — Design System</Typography>
      <Typography variant="h5">H5 — Design System</Typography>
      <Typography variant="h6">H6 — Design System</Typography>
    </div>
  ),
}

export const BodyStyles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Typography variant="bodyLg">
        Body LG — The quick brown fox jumps over the lazy dog.
      </Typography>
      <Typography variant="body">Body — The quick brown fox jumps over the lazy dog.</Typography>
      <Typography variant="bodySm">
        Body SM — The quick brown fox jumps over the lazy dog.
      </Typography>
    </div>
  ),
}

export const UIStyles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Typography variant="label">Label — Form field label</Typography>
      <Typography variant="caption">Caption — Secondary text, timestamps, helper</Typography>
      <Typography variant="overline">Overline — Section label</Typography>
    </div>
  ),
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Typography variant="body" color="foreground-primary">
        foreground-primary — The quick brown fox
      </Typography>
      <Typography variant="body" color="foreground-secondary">
        foreground-secondary — The quick brown fox
      </Typography>
      <Typography variant="body" color="foreground-tertiary">
        foreground-tertiary — The quick brown fox
      </Typography>
      <Typography variant="body" color="foreground-quaternary">
        foreground-quaternary — The quick brown fox
      </Typography>
      <Typography variant="body" color="accents-brand">
        accents-brand — The quick brown fox
      </Typography>
      <Typography variant="body" color="accents-success">
        accents-success — The quick brown fox
      </Typography>
      <Typography variant="body" color="accents-danger">
        accents-danger — The quick brown fox
      </Typography>
      <Typography variant="body" color="accents-warning">
        accents-warning — The quick brown fox
      </Typography>
      <Typography variant="body" color="accents-info">
        accents-info — The quick brown fox
      </Typography>
    </div>
  ),
}

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(
        [
          {
            variant: 'display',
            label: 'Display',
            spec: '48px / Bold / 1.1',
            text: 'Design System',
          },
          { variant: 'h1', label: 'H1', spec: '36px / Bold / 1.15', text: 'Design System' },
          { variant: 'h2', label: 'H2', spec: '30px / Bold / 1.2', text: 'Design System' },
          { variant: 'h3', label: 'H3', spec: '24px / Bold / 1.25', text: 'Design System' },
          { variant: 'h4', label: 'H4', spec: '20px / Semi Bold / 1.3', text: 'Design System' },
          { variant: 'h5', label: 'H5', spec: '18px / Semi Bold / 1.35', text: 'Design System' },
          { variant: 'h6', label: 'H6', spec: '16px / Semi Bold / 1.4', text: 'Design System' },
          {
            variant: 'bodyLg',
            label: 'Body LG',
            spec: '18px / Regular / 1.6',
            text: 'The quick brown fox jumps over the lazy dog.',
          },
          {
            variant: 'body',
            label: 'Body',
            spec: '16px / Regular / 1.6',
            text: 'The quick brown fox jumps over the lazy dog.',
          },
          {
            variant: 'bodySm',
            label: 'Body SM',
            spec: '14px / Regular / 1.5',
            text: 'The quick brown fox jumps over the lazy dog.',
          },
          {
            variant: 'label',
            label: 'Label',
            spec: '14px / Medium / 1.4',
            text: 'Form field label',
          },
          {
            variant: 'caption',
            label: 'Caption',
            spec: '12px / Regular / 1.4',
            text: 'Secondary text, timestamps, helper',
          },
          {
            variant: 'overline',
            label: 'Overline',
            spec: '11px / Semi Bold / 1.4',
            text: 'Section label',
          },
        ] as const
      ).map(({ variant, label, spec, text }) => (
        <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 112, flexShrink: 0 }}>
            <Typography variant="caption" color="foreground-primary" style={{ fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography variant="caption" color="foreground-tertiary">
              {spec}
            </Typography>
          </div>
          <Typography variant={variant}>{text}</Typography>
        </div>
      ))}
    </div>
  ),
}
