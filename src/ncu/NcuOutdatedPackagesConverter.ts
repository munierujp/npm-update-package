import type { PackageDependencies } from '../read-package-json'
import type { OutdatedPackage } from '../types'
import { PackageVersion } from '../values'
import type { NcuOutdatedPackages } from './NcuOutdatedPackages'
import { toUpdateType } from './toUpdateType'

// TODO: add test
export class NcuOutdatedPackagesConverter {
  constructor (private readonly currentDependencies: PackageDependencies) {}

  toOutdatedPackages (outdatedPackages: NcuOutdatedPackages): OutdatedPackage[] {
    return Object.entries(outdatedPackages)
      .map(([name, newVersion]) => ({
        name,
        currentVersion: PackageVersion.of(this.currentDependencies[name]),
        newVersion: PackageVersion.of(newVersion)
      }))
      .map(({ name, currentVersion, newVersion }) => ({
        name,
        currentVersion,
        newVersion,
        type: toUpdateType(currentVersion, newVersion)
      }))
  }
}
