# Reading Card Team Hover Design

## Scope

Only the four homepage reading-path cards (`.wbx-reading-card`) change. Card content, layout, spacing, straight corners, icon styling, and all other card families stay unchanged.

## Interaction

- Default cards retain the current surface and border.
- Pointer hover and keyboard `:focus-visible` move the card vertically by `-4px`.
- The active card uses `0 12px 32px rgba(0, 0, 0, 0.08)`.
- Transform, shadow, and border-color transitions run for `0.3s` with `ease` timing.
- The interaction does not darken the border or move the card horizontally.
- Focus-visible keeps `outline: none` because it receives the same clearly visible lift and shadow treatment as hover.

## Verification

An automated CSS regression test must assert the exact transition, vertical transform, shadow, and unchanged border color. The full project test and production build must pass.
