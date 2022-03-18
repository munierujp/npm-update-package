import type { Ncu } from '../ncu'
import type { PackageManager } from '../package-manager'
import type { OutdatedPackage } from './OutdatedPackage'

export class PackageUpdater {
  private readonly packageManager: PackageManager
  private readonly ncu: Ncu

  constructor ({
    packageManager,
    ncu
  }: {
    packageManager: PackageManager
    ncu: Ncu
  }) {
    this.packageManager = packageManager
    this.ncu = ncu
  }

  async update (outdatedPackage: OutdatedPackage): Promise<void> {
    const updatedPackages = await this.ncu.update(outdatedPackage)

    if (updatedPackages.length !== 1) {
      throw new Error(`Failed to update ${outdatedPackage.name}.`)
    }

    await this.packageManager.install()
  }
}
