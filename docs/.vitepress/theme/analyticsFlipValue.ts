export interface FlipToken {
  id: string
  char: string
  kind: 'digit' | 'separator'
  place: number
}

const DIGIT_DURATIONS = [360, 410, 460, 500] as const

export function digitTokens(value: string): FlipToken[] {
  let place = [...value].filter((char) => /\d/.test(char)).length - 1
  let separator = 0

  return [...value].map((char) => /\d/.test(char)
    ? { id: `place-${place}`, char, kind: 'digit' as const, place: place-- }
    : { id: `separator-${separator++}`, char, kind: 'separator' as const, place: -1 })
}

export function digitTiming(place: number) {
  const boundedPlace = Math.min(Math.max(place, 0), 3)
  return {
    duration: `${DIGIT_DURATIONS[boundedPlace]}ms`,
    delay: `${boundedPlace * 35}ms`,
  }
}
