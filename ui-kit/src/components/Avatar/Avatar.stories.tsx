import { type Meta, type StoryObj } from '@storybook/react'

import { Avatar } from './Avatar'
import { type AvatarProps } from './Avatar.types'

const meta: Meta<AvatarProps> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    src: { control: 'text' },
    alt: { control: 'text' },
    name: { control: 'text' },
    initials: { control: 'text' },
  },
  args: {
    size: 'md',
    name: 'Jane Doe',
  },
}

export default meta
type Story = StoryObj<AvatarProps>

export const Default: Story = {}

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=47',
    name: 'Jane Doe',
  },
}

export const BrokenImage: Story = {
  args: {
    src: 'https://this-url-does-not-exist.invalid/photo.jpg',
    name: 'Jane Doe',
  },
}

export const ExplicitInitials: Story = {
  args: {
    initials: 'AB',
  },
}

export const FallbackIcon: Story = {
  args: {
    name: undefined,
    initials: undefined,
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Avatar size="sm" name="Jane Doe" />
      <Avatar size="md" name="Jane Doe" />
      <Avatar size="lg" name="Jane Doe" />
      <Avatar size="xl" name="Jane Doe" />
    </div>
  ),
}

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Initials */}
      <Row label="Initials">
        <Avatar size="sm" name="Jane Doe" />
        <Avatar size="md" name="Jane Doe" />
        <Avatar size="lg" name="Jane Doe" />
        <Avatar size="xl" name="Jane Doe" />
      </Row>

      {/* Image */}
      <Row label="Image">
        <Avatar size="sm" src="https://i.pravatar.cc/150?img=12" name="Alex Kim" />
        <Avatar size="md" src="https://i.pravatar.cc/150?img=12" name="Alex Kim" />
        <Avatar size="lg" src="https://i.pravatar.cc/150?img=12" name="Alex Kim" />
        <Avatar size="xl" src="https://i.pravatar.cc/150?img=12" name="Alex Kim" />
      </Row>

      {/* Fallback icon */}
      <Row label="Fallback icon">
        <Avatar size="sm" />
        <Avatar size="md" />
        <Avatar size="lg" />
        <Avatar size="xl" />
      </Row>
    </div>
  ),
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#9697a2',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 10,
        }}
      >
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>{children}</div>
    </div>
  )
}
