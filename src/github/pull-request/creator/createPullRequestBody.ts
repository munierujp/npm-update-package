import app from '../../../../package.json'
import type { OutdatedPackage } from '../../../core'
import { readFile } from '../../../file'
import type { GitRepository } from '../../../git'
import { toJSON } from '../../../json'
import {
  extractRepository,
  parsePackageJson
} from '../../../package-json'
import { createPullRequestMetadata } from '../metadata'

export const createPullRequestBody = async (outdatedPackage: OutdatedPackage): Promise<string> => {
  const packageJson = await readFile(`node_modules/${outdatedPackage.name}/package.json`)
  const pkg = parsePackageJson(packageJson)
  const repository = extractRepository(pkg)
  const outdatedPackagesTable = await createOutdatedPackagesTable({
    outdatedPackage,
    repository
  })
  const metadataSection = createMetadataSection(outdatedPackage)
  return `This PR updates these packages:

${outdatedPackagesTable}

${metadataSection}

---
This PR has been generated by [${app.name}](${app.homepage}) v${app.version}`
}

const createOutdatedPackagesTable = async ({
  outdatedPackage,
  repository
}: {
  outdatedPackage: OutdatedPackage
  repository?: GitRepository
}): Promise<string> => {
  const packageName = outdatedPackage.name
  const packageLink = `[${packageName}](https://www.npmjs.com/package/${packageName})`
  const repositoryString = repository !== undefined ? `[${repository.owner}/${repository.name}](${repository.url.toString()})` : '-'
  const level = outdatedPackage.level
  const versionString = createVersionString(outdatedPackage)
  return `|Package|Repository|Level|Version|
|---|---|---|---|
|${packageLink}|${repositoryString}|${level}|${versionString}|`
}

const createVersionString = (outdatedPackage: OutdatedPackage): string => {
  const packageName = outdatedPackage.name
  const packageUrl = `https://www.npmjs.com/package/${packageName}`
  const currentVersion = outdatedPackage.currentVersion.version
  const newVersion = outdatedPackage.newVersion.version
  const currentVersionLink = `[\`${currentVersion}\`](${packageUrl}/v/${currentVersion})`
  const newVersionLink = `[\`${newVersion}\`](${packageUrl}/v/${newVersion})`
  const diffLink = `[diff](https://diff.intrinsic.com/${packageName}/${currentVersion}/${newVersion})`
  return `${currentVersionLink} -> ${newVersionLink} (${diffLink})`
}

const createMetadataSection = (outdatedPackage: OutdatedPackage): string => {
  const metadata = createPullRequestMetadata([outdatedPackage])
  const json = toJSON(metadata, { pretty: true })
  return `<details>
<summary>Metadata</summary>

**Don't remove or edit this section because it will be used by npm-update-package.**

<div id="npm-update-package-metadata">

\`\`\`json
${json}
\`\`\`

</div>
</details>`
}
