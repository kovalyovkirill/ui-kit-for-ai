import { type ButtonHTMLAttributes, type ReactNode } from 'react'

/**
 * @values "sm" | "md" | "lg"
 */
export type ButtonGroupSize = 'sm' | 'md' | 'lg'

/**
 * @values "horizontal" | "vertical"
 */
export type ButtonGroupOrientation = 'horizontal' | 'vertical'

/**
 * ButtonGroup container props
 * @design https://pixso.net/app/design/dJRiDr4Ixp89b2OcUPanKg?item-id=1:11314
 */
export interface ButtonGroupProps {
  /**
   * Size applied to all items in the group
   * @default "md"
   */
  size?: ButtonGroupSize

  /**
   * Layout direction of the group
   * @default "horizontal"
   */
  orientation?: ButtonGroupOrientation

  /**
   * Enables radio-button selection behaviour.
   * Clicking an item selects it and deselects all others.
   * @default false
   */
  interactive?: boolean

  /**
   * The currently selected item value (controlled).
   * Only used when `interactive` is true.
   */
  value?: string

  /**
   * The initially selected item value (uncontrolled).
   * Only used when `interactive` is true.
   */
  defaultValue?: string

  /**
   * Called when the selected item changes.
   * Only fired when `interactive` is true.
   */
  onChange?: (value: string) => void

  /** Group items — should be ButtonGroupItem elements */
  children: ReactNode

  className?: string
}

/**
 * ButtonGroup item (single cell) props
 */
export interface ButtonGroupItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Unique value that identifies this item within the group.
   * Required when the parent ButtonGroup uses `interactive`.
   */
  value?: string

  /**
   * Whether this item is in the active/selected state.
   * In non-interactive groups this is controlled externally.
   * In interactive groups it is managed automatically by the parent.
   * @default false
   */
  active?: boolean

  /**
   * Icon-only mode — renders as a square cell
   * @default false
   */
  icon?: boolean

  children?: ReactNode
}
