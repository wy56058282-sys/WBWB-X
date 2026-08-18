import { mkdir, rename, rm } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { pathExists } from './paths.mjs'

export async function replaceCandidatesAtomically(candidates, stagingRoot) {
  const backupRoot = join(stagingRoot, 'backups')
  await mkdir(backupRoot, { recursive: true })
  const applied = []

  try {
    for (const [index, { candidate, target }] of candidates.entries()) {
      await mkdir(dirname(target), { recursive: true })
      const backup = join(backupRoot, String(index))
      const hadTarget = await pathExists(target)
      if (hadTarget) await rename(target, backup)

      try {
        await rename(candidate, target)
      } catch (error) {
        if (hadTarget) await rename(backup, target)
        throw error
      }
      applied.push({ backup, hadTarget, target })
    }
  } catch (error) {
    for (const { backup, hadTarget, target } of applied.reverse()) {
      await rm(target, { recursive: true, force: true })
      if (hadTarget) await rename(backup, target)
    }
    throw error
  }
}
