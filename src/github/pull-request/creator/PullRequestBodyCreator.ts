import app from '../../../../package.json'
import type { OutdatedPackage } from '../../../core'
import { readFile } from '../../../file'
import type { GitRepository } from '../../../git'
import { toJSON } from '../../../json'
import {
  extractRepository,
  parsePackageJson
} from '../../../package-json'
import type { ReleasesFetcher } from '../../releases'
import { createPullRequestMetadata } from '../metadata'

export class PullRequestBodyCreator {
  private readonly releasesFetcher: ReleasesFetcher

  constructor ({
    releasesFetcher
  }: {
    releasesFetcher: ReleasesFetcher
  }) {
    this.releasesFetcher = releasesFetcher
  }

  async create (outdatedPackage: OutdatedPackage): Promise<string> {
    const gitRepo = await this.extractRepository(outdatedPackage)
    const outdatedPackagesTable = this.createOutdatedPackagesTable({
      outdatedPackage,
      gitRepo
    })
    const metadataSection = this.createMetadataSection(outdatedPackage)
    const footer = this.createFooter()

    if (gitRepo === undefined) {
      return `This PR updates these packages:

${outdatedPackagesTable}

${metadataSection}

---
${footer}`
    }

    const releaseNotesSection = await this.createReleaseNotesSection({
      outdatedPackage,
      gitRepo
    })
    return `This PR updates these packages:

${outdatedPackagesTable}

${releaseNotesSection}

${metadataSection}

---
${footer}`
  }

  private async extractRepository (outdatedPackage: OutdatedPackage): Promise<GitRepository | undefined> {
    const packageJson = await readFile(`node_modules/${outdatedPackage.name}/package.json`)
    const pkg = parsePackageJson(packageJson)
    return extractRepository(pkg)
  }

  private async createReleaseNotesSection ({
    outdatedPackage,
    gitRepo
  }: {
    outdatedPackage: OutdatedPackage
    gitRepo: GitRepository
  }): Promise<string> {
    const releases = await this.releasesFetcher.fetch({
      gitRepo,
      from: outdatedPackage.currentVersion,
      to: outdatedPackage.newVersion
    })
    const releaseNoteSections = releases.map(release => {
      return `### [${release.tag_name}](${release.html_url})

${release.body ?? ''}`
    })
    return `## Release notes
${releaseNoteSections.join('\n\n')}`
  }

  private createOutdatedPackagesTable ({
    outdatedPackage,
    gitRepo
  }: {
    outdatedPackage: OutdatedPackage
    gitRepo?: GitRepository
  }): string {
    const packageName = outdatedPackage.name
    const packageLink = `[${packageName}](https://www.npmjs.com/package/${packageName})`
    const repositoryLink = gitRepo !== undefined ? `[${gitRepo.owner}/${gitRepo.name}](${gitRepo.url.toString()})` : '-'
    const level = outdatedPackage.level
    const currentVersion = outdatedPackage.currentVersion.version
    const currentVersionLink = `[\`${currentVersion}\`](https://www.npmjs.com/package/${packageName}/v/${currentVersion})`
    const newVersion = outdatedPackage.newVersion.version
    const newVersionLink = `[\`${newVersion}\`](https://www.npmjs.com/package/${packageName}/v/${newVersion})`
    const diffLink = `[diff](https://renovatebot.com/diffs/npm/${packageName}/${currentVersion}/${newVersion})`
    const version = `${currentVersionLink} -> ${newVersionLink} (${diffLink})`
    return `|Package|Repository|Level|Version|
|---|---|---|---|
|${packageLink}|${repositoryLink}|${level}|${version}|`
  }

  private createMetadataSection (outdatedPackage: OutdatedPackage): string {
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

  private createFooter (): string {
    return `This PR has been generated by [${app.name}](${app.homepage}) v${app.version}`
  }
}
