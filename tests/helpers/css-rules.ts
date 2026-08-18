import { expect } from 'vitest'

export function baseRule(css: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const declarations = css.match(
    new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`),
  )?.[1]

  expect(declarations, `missing base rule for ${selector}`).toBeDefined()
  return declarations ?? ''
}

export function numericDeclaration(
  declarations: string,
  property: string,
  unit: 'deg' | 'px' | '%',
): number {
  const value = optionalNumericDeclaration(declarations, property, unit)

  expect(value, `missing ${property} in ${declarations}`).toBeDefined()
  return Number(value)
}

export function optionalNumericDeclaration(
  declarations: string,
  property: string,
  unit: 'deg' | 'px' | '%',
): number | undefined {
  const value = declarations.match(
    new RegExp(`${property}:\\s*(-?[\\d.]+)${unit};`),
  )?.[1]

  return value === undefined ? undefined : Number(value)
}

export function rotatedCardBounds(
  declarations: string,
  artWidth: number,
  cardSize: number,
  artHeight = 568,
): { left: number; right: number; top: number; bottom: number } {
  const angle =
    (numericDeclaration(declarations, '--wbx-icon-rotation', 'deg') *
      Math.PI) /
    180
  const paintedSize =
    cardSize * (Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle)))
  const rotationOverflow = (paintedSize - cardSize) / 2
  const left =
    (numericDeclaration(declarations, 'left', '%') / 100) * artWidth
  const declaredTop = optionalNumericDeclaration(declarations, 'top', 'px')
  const declaredBottom = optionalNumericDeclaration(
    declarations,
    'bottom',
    'px',
  )

  expect(
    declaredTop ?? declaredBottom,
    `missing vertical position in ${declarations}`,
  ).toBeDefined()

  const top =
    declaredTop ?? artHeight - (declaredBottom ?? 0) - cardSize

  return {
    left: left - rotationOverflow,
    right: left + cardSize + rotationOverflow,
    top: top - rotationOverflow - 8,
    bottom: top + cardSize + rotationOverflow,
  }
}

export function cardClearance(
  first: ReturnType<typeof rotatedCardBounds>,
  second: ReturnType<typeof rotatedCardBounds>,
): number {
  const horizontal = Math.max(
    second.left - first.right,
    first.left - second.right,
  )
  const vertical = Math.max(
    second.top - first.bottom,
    first.top - second.bottom,
  )

  return Math.max(horizontal, vertical)
}
