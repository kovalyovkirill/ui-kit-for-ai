import { type Meta, type StoryObj } from '@storybook/react'

import { Textarea } from './Textarea'
import { type TextareaProps } from './Textarea.types'

const meta: Meta<TextareaProps> = {
  title: 'Components/Textarea',
  component: Textarea,
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
    placeholder: 'Enter text here...',
  },
}

export default meta
type Story = StoryObj<TextareaProps>

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
      <Textarea size="sm" label="Small (SM)" helperText="56px min-height" />
      <Textarea size="md" label="Medium (MD)" helperText="80px min-height" />
      <Textarea size="lg" label="Large (LG)" helperText="112px min-height" />
      <Textarea size="xl" label="Extra Large (XL)" helperText="144px min-height" />
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 320 }}>
      <Textarea label="Default" helperText="Helper text" placeholder="Enter text here..." />
      <Textarea label="With value" helperText="Helper text" defaultValue="Typed value" />
      <Textarea label="Error" error="This field is required" placeholder="Enter text here..." />
      <Textarea
        label="Disabled"
        helperText="Helper text"
        placeholder="Enter text here..."
        disabled
      />
    </div>
  ),
}
