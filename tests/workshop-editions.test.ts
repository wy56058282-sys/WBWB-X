import { describe, expect, it } from 'vitest'
import {
  nextWorkshopRefreshDelay,
  selectRelevantWorkshopEdition,
  type WorkshopEdition,
} from '../docs/.vitepress/workshop-editions'

const editions: readonly WorkshopEdition[] = [
  {
    id: 'past-with-detail', title: '场景实战工作坊', edition: '第一期', date: '08.15', fullDate: '2026 年 8 月 15 日', startsAt: '2026-08-15T14:00:00+08:00', endsAt: '2026-08-15T18:00:00+08:00', time: '14:00–18:00', capacity: '15–25 人', venue: '星辉 OPC', area: '人工智能产业园', coverPath: '/cover-1.png', posterPaths: ['/cover-1.png'], activityDetailUrl: 'https://example.com/recap', registrationQrPath: '/qr.png',
  },
  {
    id: 'ongoing', title: '场景实战工作坊', edition: '第二期', date: '08.29', fullDate: '2026 年 8 月 29 日', startsAt: '2026-08-29T14:00:00+08:00', endsAt: '2026-08-29T18:00:00+08:00', time: '14:00–18:00', capacity: '15–25 人', venue: '星辉 OPC', area: '人工智能产业园', coverPath: '/cover-2.png', posterPaths: ['/cover-2.png'], activityDetailUrl: '', registrationQrPath: '/qr.png',
  },
  {
    id: 'upcoming', title: '场景实战工作坊', edition: '第三期', date: '09.12', fullDate: '2026 年 9 月 12 日', startsAt: '2026-09-12T14:00:00+08:00', endsAt: '2026-09-12T18:00:00+08:00', time: '14:00–18:00', capacity: '15–25 人', venue: '星辉 OPC', area: '人工智能产业园', coverPath: '/cover-3.png', posterPaths: ['/cover-3.png'], activityDetailUrl: '', registrationQrPath: '/qr.png',
  },
]

describe('selectRelevantWorkshopEdition', () => {
  it('chooses the nearest upcoming edition', () => {
    expect(selectRelevantWorkshopEdition(editions, new Date('2026-08-20T12:00:00+08:00'))).toMatchObject({ edition: { id: 'ongoing' }, status: 'upcoming' })
  })

  it('keeps an ongoing edition available for registration', () => {
    expect(selectRelevantWorkshopEdition(editions, new Date('2026-08-29T16:00:00+08:00'))).toMatchObject({ edition: { id: 'ongoing' }, status: 'ongoing' })
  })

  it('treats the exact end instant as past', () => {
    expect(selectRelevantWorkshopEdition(editions.slice(1, 2), new Date('2026-08-29T18:00:00+08:00'))).toMatchObject({ edition: { id: 'ongoing' }, status: 'past' })
  })

  it('uses the most recently ended edition as a detail recap', () => {
    expect(selectRelevantWorkshopEdition(editions.slice(0, 1), new Date('2026-08-20T12:00:00+08:00'))).toMatchObject({ edition: { id: 'past-with-detail', activityDetailUrl: 'https://example.com/recap' }, status: 'past' })
  })

  it('uses the most recently ended edition even when its recap URL is unavailable', () => {
    expect(selectRelevantWorkshopEdition(editions.slice(1, 2), new Date('2026-09-20T12:00:00+08:00'))).toMatchObject({ edition: { id: 'ongoing', activityDetailUrl: '' }, status: 'past' })
  })

  it('caps a distant boundary refresh and allows it to be rescheduled', () => {
    const now = new Date('2026-01-01T00:00:00+08:00')
    const distant = editionWithDates('2099-01-01T14:00:00+08:00', '2099-01-01T18:00:00+08:00')
    const near = editionWithDates('2026-01-01T00:00:01+08:00', '2026-01-01T00:00:02+08:00')

    expect(nextWorkshopRefreshDelay([distant], now)).toBe(2_147_483_647)
    expect(nextWorkshopRefreshDelay([near], now)).toBe(1_001)
  })
})

function editionWithDates(startsAt: string, endsAt: string): WorkshopEdition {
  return { ...editions[0], startsAt, endsAt }
}
