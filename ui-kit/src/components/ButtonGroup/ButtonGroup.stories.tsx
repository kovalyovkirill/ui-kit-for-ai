import { type Meta, type StoryObj } from '@storybook/react'

import { ButtonGroup, ButtonGroupItem } from './ButtonGroup'
import { type ButtonGroupProps } from './ButtonGroup.types'

const GridIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
)

const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 6h12M4 10h12M4 14h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 14l4-4 3 3 5-6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const meta: Meta<ButtonGroupProps> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    size: 'md',
    orientation: 'horizontal',
  },
}

export default meta
type Story = StoryObj<ButtonGroupProps>

export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupItem>Day</ButtonGroupItem>
      <ButtonGroupItem>Week</ButtonGroupItem>
      <ButtonGroupItem>Month</ButtonGroupItem>
    </ButtonGroup>
  ),
}

export const WithActive: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupItem>Day</ButtonGroupItem>
      <ButtonGroupItem active>Week</ButtonGroupItem>
      <ButtonGroupItem>Month</ButtonGroupItem>
    </ButtonGroup>
  ),
}

export const WithIcons: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupItem icon>
        <GridIcon />
      </ButtonGroupItem>
      <ButtonGroupItem icon active>
        <ListIcon />
      </ButtonGroupItem>
      <ButtonGroupItem icon>
        <ChartIcon />
      </ButtonGroupItem>
    </ButtonGroup>
  ),
}

export const WithTextAndIcons: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupItem>
        <GridIcon />
        Grid
      </ButtonGroupItem>
      <ButtonGroupItem active>
        <ListIcon />
        List
      </ButtonGroupItem>
      <ButtonGroupItem>
        <ChartIcon />
        Chart
      </ButtonGroupItem>
    </ButtonGroup>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <ButtonGroup size="sm">
        <ButtonGroupItem>Day</ButtonGroupItem>
        <ButtonGroupItem active>Week</ButtonGroupItem>
        <ButtonGroupItem>Month</ButtonGroupItem>
      </ButtonGroup>
      <ButtonGroup size="md">
        <ButtonGroupItem>Day</ButtonGroupItem>
        <ButtonGroupItem active>Week</ButtonGroupItem>
        <ButtonGroupItem>Month</ButtonGroupItem>
      </ButtonGroup>
      <ButtonGroup size="lg">
        <ButtonGroupItem>Day</ButtonGroupItem>
        <ButtonGroupItem active>Week</ButtonGroupItem>
        <ButtonGroupItem>Month</ButtonGroupItem>
      </ButtonGroup>
    </div>
  ),
}

export const Vertical: Story = {
  render: (args) => (
    <ButtonGroup {...args} orientation="vertical">
      <ButtonGroupItem>Day</ButtonGroupItem>
      <ButtonGroupItem active>Week</ButtonGroupItem>
      <ButtonGroupItem>Month</ButtonGroupItem>
    </ButtonGroup>
  ),
}

export const WithDisabled: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupItem>Day</ButtonGroupItem>
      <ButtonGroupItem active>Week</ButtonGroupItem>
      <ButtonGroupItem disabled>Month</ButtonGroupItem>
    </ButtonGroup>
  ),
}

export const Interactive: Story = {
  render: (args) => (
    <ButtonGroup {...args} interactive defaultValue="week">
      <ButtonGroupItem value="day">Day</ButtonGroupItem>
      <ButtonGroupItem value="week">Week</ButtonGroupItem>
      <ButtonGroupItem value="month">Month</ButtonGroupItem>
    </ButtonGroup>
  ),
}

export const InteractiveWithIcons: Story = {
  render: (args) => (
    <ButtonGroup {...args} interactive defaultValue="list">
      <ButtonGroupItem value="grid" icon>
        <GridIcon />
      </ButtonGroupItem>
      <ButtonGroupItem value="list" icon>
        <ListIcon />
      </ButtonGroupItem>
      <ButtonGroupItem value="chart" icon>
        <ChartIcon />
      </ButtonGroupItem>
    </ButtonGroup>
  ),
}

export const InteractiveVertical: Story = {
  render: (args) => (
    <ButtonGroup {...args} interactive orientation="vertical" defaultValue="week">
      <ButtonGroupItem value="day">Day</ButtonGroupItem>
      <ButtonGroupItem value="week">Week</ButtonGroupItem>
      <ButtonGroupItem value="month">Month</ButtonGroupItem>
    </ButtonGroup>
  ),
}
