import { serviceConfig } from './service-config'

declare const __WBX_WORKSHOP_BUILD_TIME__: string | undefined

export interface WorkshopEdition {
  id: string
  title: string
  edition: string
  date: string
  fullDate: string
  startsAt: string
  endsAt: string
  time: string
  capacity: string
  venue: string
  area: string
  coverPath: string
  thumbnailPath?: string
  posterPaths: readonly string[]
  displayPosterPaths?: readonly string[]
  activityDetailUrl: string
  registrationQrPath: string
}

export type WorkshopEditionStatus = 'upcoming' | 'ongoing' | 'past'

const workshopBuildTime = typeof __WBX_WORKSHOP_BUILD_TIME__ === 'string'
  ? __WBX_WORKSHOP_BUILD_TIME__
  : new Date().toISOString()

export const homeWorkshopReferenceTime = new Date(workshopBuildTime)
export const MAX_WORKSHOP_REFRESH_DELAY = 2_147_483_647

export interface WorkshopEditionSelection {
  edition: WorkshopEdition
  status: WorkshopEditionStatus
}

const [venue, area] = serviceConfig.workshop.location.split(' · ')

export const workshopEditions: readonly WorkshopEdition[] = [
  {
    id: '815',
    title: '场景实战工作坊',
    edition: '第一期',
    date: '08.15',
    fullDate: '2026 年 8 月 15 日',
    startsAt: '2026-08-15T14:00:00+08:00',
    endsAt: '2026-08-15T18:00:00+08:00',
    time: serviceConfig.workshop.time,
    capacity: serviceConfig.workshop.capacity,
    venue,
    area,
    coverPath: '/article-assets/service/workshop-815.png',
    thumbnailPath: '/article-assets/service/workshop-815-thumb.webp',
    posterPaths: ['/article-assets/service/workshop-815.png', '/article-assets/service/workshop-815-agenda.png', '/article-assets/service/workshop-815-benefits.png'],
    displayPosterPaths: ['/article-assets/service/workshop-815-display.webp', '/article-assets/service/workshop-815-agenda-display.webp', '/article-assets/service/workshop-815-benefits-display.webp'],
    activityDetailUrl: 'https://mp.weixin.qq.com/s/q7Bq2kEmsYlgI4pTZ59srw',
    registrationQrPath: serviceConfig.workshop.registrationQrPath,
  },
  {
    id: '829',
    title: '场景实战工作坊',
    edition: '第二期',
    date: '08.29',
    fullDate: serviceConfig.workshop.date,
    startsAt: '2026-08-29T14:00:00+08:00',
    endsAt: '2026-08-29T18:00:00+08:00',
    time: serviceConfig.workshop.time,
    capacity: serviceConfig.workshop.capacity,
    venue,
    area,
    coverPath: serviceConfig.workshop.coverPath,
    thumbnailPath: '/article-assets/service/workshop-cover-thumb.webp',
    posterPaths: [serviceConfig.workshop.coverPath, '/article-assets/service/workshop-829-agenda.png', '/article-assets/service/workshop-829-benefits.png'],
    displayPosterPaths: ['/article-assets/service/workshop-cover-display.webp', '/article-assets/service/workshop-829-agenda-display.webp', '/article-assets/service/workshop-829-benefits-display.webp'],
    activityDetailUrl: serviceConfig.workshop.activityDetailUrl,
    registrationQrPath: serviceConfig.workshop.registrationQrPath,
  },
  {
    id: '912',
    title: '场景实战工作坊',
    edition: '第三期',
    date: '09.12',
    fullDate: '2026 年 9 月 12 日',
    startsAt: '2026-09-12T14:00:00+08:00',
    endsAt: '2026-09-12T18:00:00+08:00',
    time: serviceConfig.workshop.time,
    capacity: serviceConfig.workshop.capacity,
    venue,
    area,
    coverPath: '/article-assets/service/workshop-912.png',
    thumbnailPath: '/article-assets/service/workshop-912-thumb.webp',
    posterPaths: ['/article-assets/service/workshop-912.png'],
    displayPosterPaths: ['/article-assets/service/workshop-912-display.webp'],
    activityDetailUrl: '',
    registrationQrPath: serviceConfig.workshop.registrationQrPath,
  },
]

function dateValue(value: string) {
  return new Date(value).getTime()
}

export function selectRelevantWorkshopEdition(
  editions: readonly WorkshopEdition[],
  now: Date,
): WorkshopEditionSelection | undefined {
  const nowValue = now.getTime()
  const notEnded = editions
    .filter((edition) => dateValue(edition.endsAt) > nowValue)
    .sort((left, right) => dateValue(left.startsAt) - dateValue(right.startsAt))

  if (notEnded[0]) {
    return {
      edition: notEnded[0],
      status: dateValue(notEnded[0].startsAt) <= nowValue ? 'ongoing' : 'upcoming',
    }
  }

  const mostRecentlyEnded = [...editions]
    .sort((left, right) => dateValue(right.endsAt) - dateValue(left.endsAt))[0]

  return mostRecentlyEnded
    ? { edition: mostRecentlyEnded, status: 'past' }
    : undefined
}

export function nextWorkshopBoundary(
  editions: readonly WorkshopEdition[],
  now: Date,
) {
  const nowValue = now.getTime()
  return editions
    .flatMap((edition) => [edition.startsAt, edition.endsAt])
    .map((value) => dateValue(value))
    .filter((value) => value > nowValue)
    .sort((left, right) => left - right)[0]
}

export function nextWorkshopRefreshDelay(
  editions: readonly WorkshopEdition[],
  now: Date,
) {
  const boundary = nextWorkshopBoundary(editions, now)
  if (boundary === undefined) return undefined
  return Math.min(
    MAX_WORKSHOP_REFRESH_DELAY,
    Math.max(1, boundary - now.getTime() + 1),
  )
}
