import { type Meta, type StoryObj } from '@storybook/react'

import { Button } from './Button'
import { type ButtonProps } from './Button.types'

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 10h12M10 4l6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const meta: Meta<ButtonProps> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'xl',
    disabled: false,
  },
}

export default meta
type Story = StoryObj<ButtonProps>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}

export const WithLeftIcon: Story = {
  args: {
    children: 'New item',
    leftIcon: <PlusIcon />,
  },
}

export const WithRightIcon: Story = {
  args: {
    children: 'Continue',
    rightIcon: <ArrowIcon />,
  },
}

export const WithBothIcons: Story = {
  args: {
    children: 'Action',
    leftIcon: <PlusIcon />,
    rightIcon: <ArrowIcon />,
  },
}

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
      <Button {...args} size="xl">
        Extra Large
      </Button>
    </div>
  ),
}

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
    </div>
  ),
}

export const DisabledVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button {...args} variant="primary" disabled>
        Primary
      </Button>
      <Button {...args} variant="secondary" disabled>
        Secondary
      </Button>
    </div>
  ),
}

export const SecondaryWithIcons: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button {...args} variant="secondary" leftIcon={<PlusIcon />}>
        Add item
      </Button>
      <Button {...args} variant="secondary" rightIcon={<ArrowIcon />}>
        Continue
      </Button>
    </div>
  ),
}
