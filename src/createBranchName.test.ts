import { createBranchName } from './createBranchName'
import { PackageVersion } from './PackageVersion'

describe('createBranchName', () => {
  it('returns branch name', () => {
    const actual = createBranchName({
      name: 'package-name',
      currentVersion: PackageVersion.of('1.0.0'),
      newVersion: PackageVersion.of('1.2.3')
    })
    expect(actual).toBe('npm-update-package/package-name/v1.2.3')
  })
})
