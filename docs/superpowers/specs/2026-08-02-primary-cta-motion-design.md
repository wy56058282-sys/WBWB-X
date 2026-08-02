# Primary CTA Motion Design

## Scope

Change only the homepage hero “开始阅读” link. The secondary “查看阅读路线” button, downstream primary buttons, navigation target, copy, dimensions, and straight-corner visual system remain unchanged.

## Structure

The link keeps its existing accessible text and `/wb-x/` destination. Its visible contents become a label plus a dedicated arrow stage containing two decorative right-arrow icons rotated toward the upper right.

## Interaction

- Default: black button, white label, white outgoing arrow on a black arrow stage.
- Hover and `:focus-visible`: a translucent white sheen crosses the button in `0.5s`; the outgoing arrow exits toward the upper right; a black incoming arrow enters from the lower left; the arrow stage fills with `#32e6b9`.
- Arrow and fill transitions use `0.3s ease`.
- Active: no displacement and a green `0 4px 12px rgba(50, 230, 185, 0.28)` shadow.
- The existing button lift and hard black shadow are disabled only for this CTA.
- Under `prefers-reduced-motion: reduce`, the sheen and positional transitions are disabled while the green arrow-stage state remains visible on hover and focus.

## Verification

A Vitest regression test asserts the scoped DOM structure, preserved link and label, animation parameters, green pressed shadow, and reduced-motion rule. Run the full test suite and production build before publishing.
