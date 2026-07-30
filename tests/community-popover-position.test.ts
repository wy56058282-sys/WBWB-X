import { describe, expect, it } from 'vitest'
import { computeCommunityPopoverPosition } from '../docs/.vitepress/community-popover-position'

describe('computeCommunityPopoverPosition', () => {
  it('places the popover below the trigger with right edges aligned', () => {
    expect(
      computeCommunityPopoverPosition({
        trigger: { top: 20, right: 800, bottom: 60 },
        popover: { width: 270, height: 360 },
        viewport: { width: 837, height: 736 },
      }),
    ).toEqual({ left: 530, top: 68, placement: 'below' })
  })

  it('clamps the popover inside the horizontal viewport margin', () => {
    expect(
      computeCommunityPopoverPosition({
        trigger: { top: 20, right: 180, bottom: 60 },
        popover: { width: 270, height: 360 },
        viewport: { width: 320, height: 736 },
      }),
    ).toEqual({ left: 12, top: 68, placement: 'below' })
  })

  it('places the popover above when there is not enough room below', () => {
    expect(
      computeCommunityPopoverPosition({
        trigger: { top: 600, right: 800, bottom: 640 },
        popover: { width: 270, height: 360 },
        viewport: { width: 837, height: 680 },
      }),
    ).toEqual({ left: 530, top: 232, placement: 'above' })
  })
})
