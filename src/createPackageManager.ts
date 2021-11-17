import type { Terminal } from './Terminal'
import type { PackageManager } from './package-manager/PackageManager'
import { Npm } from './package-manager/Npm'
import { Yarn } from './package-manager/Yarn'

// TODO: add logs using logger
export const createPackageManager = (terminal: Terminal): PackageManager => {
  switch (process.env.PACKAGE_MANAGER) {
    case 'npm':
      return new Npm(terminal)
    case 'yarn':
      return new Yarn(terminal)
    default:
      throw new Error(`process.env.PACKAGE_MANAGER is invalid. process.env.PACKAGE_MANAGER=${process.env.PACKAGE_MANAGER ?? 'undefined'}`)
  }
}
