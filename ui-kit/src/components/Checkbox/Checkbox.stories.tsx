import { type Meta, type StoryObj } from '@storybook/react'

import { Checkbox } from './Checkbox'
import { type CheckboxProps } from './Checkbox.types'

const meta: Meta<CheckboxProps> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    size: 'md',
    label: 'Accept terms and conditions',
  },
}

export default meta
type Story = StoryObj<CheckboxProps>

export const Default: Story = {}

export const Checked: Story = {
  args: { checked: true, onChange: () => {} },
}

export const Disabled: Story = {
  args: { disabled: true },
}

export const DisabledChecked: Story = {
  args: { checked: true, disabled: true, onChange: () => {} },
}

export const NoLabel: Story = {
  args: { label: undefined },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Checkbox size="sm" label="Small (16px)" />
      <Checkbox size="md" label="Medium (20px)" />
      <Checkbox size="lg" label="Large (24px)" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" checked onChange={() => {}} />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled + Checked" checked disabled onChange={() => {}} />
    </div>
  ),
}

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Typography_Label size={size} />
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Checkbox size={size} />
            <Checkbox size={size} checked onChange={() => {}} />
            <Checkbox size={size} disabled />
            <Checkbox size={size} checked disabled onChange={() => {}} />
          </div>
        </div>
      ))}
    </div>
  ),
}

// Small helper just for the Showcase labels
function Typography_Label({ size }: { size: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: '#9697a2',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      {size.toUpperCase()}
    </span>
  )
}
