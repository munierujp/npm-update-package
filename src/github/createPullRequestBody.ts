import pkg from '../../package.json'
import type { OutdatedPackage } from '../types'

export const createPullRequestBody = (outdatedPackage: OutdatedPackage): string => {
  const packageName = outdatedPackage.name
  const currentVersion = outdatedPackage.currentVersion.version
  const newVersion = outdatedPackage.newVersion.version
  const updateType = outdatedPackage.type
  return `This PR updates these packages:

|package|type|current version|new version|
|---|---|---|---|
|[${packageName}](https://www.npmjs.com/package/${packageName})|${updateType}|\`${currentVersion}\`|\`${newVersion}\`|

---
This PR has been generated by ${pkg.name}`
}
