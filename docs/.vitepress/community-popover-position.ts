export interface CommunityPopoverPositionInput {
  trigger: { top: number; right: number; bottom: number }
  popover: { width: number; height: number }
  viewport: { width: number; height: number }
}

export interface CommunityPopoverPosition {
  left: number
  top: number
  placement: 'above' | 'below'
}

const VIEWPORT_MARGIN = 12
const TRIGGER_GAP = 8

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function computeCommunityPopoverPosition({
  trigger,
  popover,
  viewport,
}: CommunityPopoverPositionInput): CommunityPopoverPosition {
  const left = clamp(
    trigger.right - popover.width,
    VIEWPORT_MARGIN,
    Math.max(VIEWPORT_MARGIN, viewport.width - popover.width - VIEWPORT_MARGIN),
  )
  const belowTop = trigger.bottom + TRIGGER_GAP
  const aboveTop = trigger.top - TRIGGER_GAP - popover.height
  const fitsBelow = belowTop + popover.height <= viewport.height - VIEWPORT_MARGIN
  const placement = fitsBelow || aboveTop < VIEWPORT_MARGIN ? 'below' : 'above'
  const preferredTop = placement === 'below' ? belowTop : aboveTop
  const top = clamp(
    preferredTop,
    VIEWPORT_MARGIN,
    Math.max(VIEWPORT_MARGIN, viewport.height - popover.height - VIEWPORT_MARGIN),
  )

  return { left, top, placement }
}
