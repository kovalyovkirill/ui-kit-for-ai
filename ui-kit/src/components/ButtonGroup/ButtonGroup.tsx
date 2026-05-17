import clsx from 'clsx'
import { createContext, useContext, useState } from 'react'

import styles from './ButtonGroup.module.css'
import {
  type ButtonGroupItemProps,
  type ButtonGroupOrientation,
  type ButtonGroupProps,
  type ButtonGroupSize,
} from './ButtonGroup.types'

interface ButtonGroupContextValue {
  size: ButtonGroupSize
  orientation: ButtonGroupOrientation
  interactive: boolean
  selectedValue: string | undefined
  onSelect: (value: string) => void
}

const ButtonGroupContext = createContext<ButtonGroupContextValue>({
  size: 'md',
  orientation: 'horizontal',
  interactive: false,
  selectedValue: undefined,
  onSelect: () => undefined,
})

export function ButtonGroup({
  size = 'md',
  orientation = 'horizontal',
  interactive = false,
  value,
  defaultValue,
  onChange,
  className,
  children,
}: ButtonGroupProps) {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)

  const isControlled = value !== undefined
  const selectedValue = isControlled ? value : internalValue

  function onSelect(next: string) {
    if (!isControlled) {
      setInternalValue(next)
    }
    onChange?.(next)
  }

  return (
    <ButtonGroupContext.Provider
      value={{ size, orientation, interactive, selectedValue, onSelect }}
    >
      <div
        className={clsx(styles.group, orientation === 'vertical' && styles.vertical, className)}
        role={interactive ? 'radiogroup' : 'group'}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  )
}

export function ButtonGroupItem({
  value,
  active: activeProp = false,
  icon = false,
  className,
  onClick,
  children,
  ...props
}: ButtonGroupItemProps) {
  const { size, interactive, selectedValue, onSelect } = useContext(ButtonGroupContext)

  const isActive = interactive ? selectedValue === value : activeProp

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (interactive && value !== undefined) {
      onSelect(value)
    }
    onClick?.(e)
  }

  return (
    <button
      type="button"
      role={interactive ? 'radio' : undefined}
      aria-checked={interactive ? isActive : undefined}
      aria-pressed={!interactive ? isActive : undefined}
      className={clsx(
        styles.item,
        styles[size],
        isActive && styles.active,
        icon && styles['icon-item'],
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}
