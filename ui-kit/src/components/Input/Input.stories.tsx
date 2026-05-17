import { type Meta, type StoryObj } from '@storybook/react'

import { Input } from './Input'
import { type InputProps } from './Input.types'

const meta: Meta<InputProps> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    label: { control: 'text' },
    helperText: { control: 'text' },
    error: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    size: 'xl',
    label: 'Label',
    helperText: 'Helper text',
    placeholder: 'Placeholder text',
  },
}

export default meta
type Story = StoryObj<InputProps>

export const Default: Story = {}

export const WithError: Story = {
  args: {
    error: 'This field is required',
    helperText: undefined,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const NoLabel: Story = {
  args: {
    label: undefined,
    helperText: undefined,
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 320 }}>
      <Input size="sm" label="Small (SM)" helperText="32px height" placeholder="Placeholder text" />
      <Input
        size="md"
        label="Medium (MD)"
        helperText="40px height"
        placeholder="Placeholder text"
      />
      <Input size="lg" label="Large (LG)" helperText="48px height" placeholder="Placeholder text" />
      <Input
        size="xl"
        label="Extra Large (XL)"
        helperText="56px height"
        placeholder="Placeholder text"
      />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 320 }}>
      <Input label="Default" helperText="Helper text" placeholder="Placeholder text" />
      <Input label="With value" helperText="Helper text" defaultValue="Typed value" />
      <Input label="Error" error="This field is required" placeholder="Placeholder text" />
      <Input label="Disabled" helperText="Helper text" placeholder="Placeholder text" disabled />
    </div>
  ),
}

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: 320 }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            size={size}
            label={`Size: ${size.toUpperCase()} — Default`}
            helperText="Helper text"
            placeholder="Placeholder text"
          />
          <Input
            size={size}
            label={`Size: ${size.toUpperCase()} — Error`}
            error="This field is required"
            placeholder="Placeholder text"
          />
          <Input
            size={size}
            label={`Size: ${size.toUpperCase()} — Disabled`}
            helperText="Helper text"
            placeholder="Placeholder text"
            disabled
          />
        </div>
      ))}
    </div>
  ),
}
