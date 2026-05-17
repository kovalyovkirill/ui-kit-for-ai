import { type Meta, type StoryObj } from '@storybook/react'

import { Badge } from './Badge'
import { type BadgeProps } from './Badge.types'

const meta: Meta<BadgeProps> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'bordered', 'danger', 'success', 'warning'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    children: { control: 'text' },
  },
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Badge',
  },
}

export default meta
type Story = StoryObj<BadgeProps>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="bordered">Bordered</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge variant="primary" size={size}>
            Primary
          </Badge>
          <Badge variant="secondary" size={size}>
            Secondary
          </Badge>
          <Badge variant="bordered" size={size}>
            Bordered
          </Badge>
          <Badge variant="danger" size={size}>
            Danger
          </Badge>
          <Badge variant="success" size={size}>
            Success
          </Badge>
          <Badge variant="warning" size={size}>
            Warning
          </Badge>
        </div>
      ))}
    </div>
  ),
}

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(
        [
          { variant: 'primary', label: 'Primary' },
          { variant: 'secondary', label: 'Secondary' },
          { variant: 'bordered', label: 'Bordered' },
          { variant: 'danger', label: 'Danger' },
          { variant: 'success', label: 'Success' },
          { variant: 'warning', label: 'Warning' },
        ] as const
      ).map(({ variant, label }) => (
        <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 72,
              fontSize: 11,
              fontWeight: 600,
              color: '#9697a2',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              flexShrink: 0,
            }}
          >
            {label}
          </span>
          <Badge variant={variant} size="sm">
            Badge
          </Badge>
          <Badge variant={variant} size="md">
            Badge
          </Badge>
          <Badge variant={variant} size="lg">
            Badge
          </Badge>
        </div>
      ))}
    </div>
  ),
}
