import { render } from 'mustache'
import { app } from '../../../app'
import type { OutdatedPackage } from '../../../ncu'
import { createPullRequestMetadata } from '../metadata'

const TEMPLATE = `This PR updates these packages:

|package|type|current version|new version|
|---|---|---|---|
|[{{{packageName}}}](https://www.npmjs.com/package/{{{packageName}}})|{{updateType}}|\`{{currentVersion}}\`|\`{{newVersion}}\`|

<details>
<summary>Metadata</summary>

**Don't remove or edit this section because it will be used by npm-update-package.**

<div id="npm-update-package-metadata">

\`\`\`json
{{{metadata}}}
\`\`\`

</div>
</details>

---
This PR has been generated by [{{{appName}}}]({{{appWeb}}}) v{{appVersion}}`

export const createPullRequestBody = (outdatedPackage: OutdatedPackage): string => {
  const appName = app.name
  const appVersion = app.version
  const appWeb = app.web
  const currentVersion = outdatedPackage.currentVersion.version
  const newVersion = outdatedPackage.newVersion.version
  const packageName = outdatedPackage.name
  const updateType = outdatedPackage.type
  const metadata = JSON.stringify(createPullRequestMetadata([outdatedPackage]), null, 2)
  return render(TEMPLATE, {
    appName,
    appVersion,
    appWeb,
    currentVersion,
    newVersion,
    packageName,
    updateType,
    metadata
  })
}
