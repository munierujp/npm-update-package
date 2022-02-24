
import app from '../../../../package.json'
import type { OutdatedPackage } from '../../../core'
import { readFile } from '../../../file'
import type { ReleasesFetcher } from '../../../github'
import { SemVer } from '../../../semver'
import { PullRequestBodyCreator } from './PullRequestBodyCreator'

jest.mock('../../../file')

describe('PullRequestBodyCreator', () => {
  describe('create', () => {
    const outdatedPackage: OutdatedPackage = {
      name: '@npm-update-package/example',
      currentVersion: SemVer.of('1.0.0'),
      newVersion: SemVer.of('2.0.0'),
      level: 'major'
    }
    const readFileMock = jest.mocked(readFile)
    const releasesFetcherFetchMock = jest.fn()
    const releasesFetcher = {
      fetch: releasesFetcherFetchMock
    } as unknown as ReleasesFetcher
    const pullRequestBodyCreator = new PullRequestBodyCreator({
      releasesFetcher
    })

    beforeEach(() => {
      releasesFetcherFetchMock.mockResolvedValue([
        {
          tag_name: 'v1.0.0',
          html_url: 'https://github.com/npm-update-package/example/releases/tag/v1.0.0'
        },
        {
          tag_name: 'v2.0.0',
          html_url: 'https://github.com/npm-update-package/example/releases/tag/v2.0.0'
        }
      ])
    })

    afterEach(() => {
      readFileMock.mockReset()
      releasesFetcherFetchMock.mockReset()
    })

    it('returns Markdown string which does not contain repository information if package.json does not have repository field', async () => {
      readFileMock.mockResolvedValue(JSON.stringify({
        name: '@npm-update-package/example',
        version: '1.0.0'
      }))

      const actual = await pullRequestBodyCreator.create(outdatedPackage)

      expect(actual).toBe(`This PR updates these packages:

|Package|Repository|Level|Version|
|---|---|---|---|
|[@npm-update-package/example](https://www.npmjs.com/package/@npm-update-package/example)|-|major|[\`1.0.0\`](https://www.npmjs.com/package/@npm-update-package/example/v/1.0.0) -> [\`2.0.0\`](https://www.npmjs.com/package/@npm-update-package/example/v/2.0.0) ([diff](https://renovatebot.com/diffs/npm/@npm-update-package/example/1.0.0/2.0.0))|

## Metadata

**Don't remove or edit this section because it will be used by npm-update-package.**

<details>
<summary>metadata.json</summary>
<div id="npm-update-package-metadata">

\`\`\`json
{
  "version": "${app.version}",
  "packages": [
    {
      "name": "@npm-update-package/example",
      "currentVersion": "1.0.0",
      "newVersion": "2.0.0",
      "level": "major"
    }
  ]
}
\`\`\`

</div>
</details>

---
This PR has been generated by [${app.name}](${app.homepage}) v${app.version}`)
      expect(readFileMock).toBeCalledWith('node_modules/@npm-update-package/example/package.json')
    })

    it('returns Markdown string which contains repository information if package.json has repository field', async () => {
      readFileMock.mockResolvedValue(JSON.stringify({
        name: '@npm-update-package/example',
        version: '1.0.0',
        repository: 'npm-update-package/example'
      }))

      const actual = await pullRequestBodyCreator.create(outdatedPackage)

      expect(actual).toBe(`This PR updates these packages:

|Package|Repository|Level|Version|
|---|---|---|---|
|[@npm-update-package/example](https://www.npmjs.com/package/@npm-update-package/example)|[npm-update-package/example](https://github.com/npm-update-package/example)|major|[\`1.0.0\`](https://www.npmjs.com/package/@npm-update-package/example/v/1.0.0) -> [\`2.0.0\`](https://www.npmjs.com/package/@npm-update-package/example/v/2.0.0) ([diff](https://renovatebot.com/diffs/npm/@npm-update-package/example/1.0.0/2.0.0))|

## Release notes

- [v1.0.0](https://github.com/npm-update-package/example/releases/tag/v1.0.0)
- [v2.0.0](https://github.com/npm-update-package/example/releases/tag/v2.0.0)

## Metadata

**Don't remove or edit this section because it will be used by npm-update-package.**

<details>
<summary>metadata.json</summary>
<div id="npm-update-package-metadata">

\`\`\`json
{
  "version": "${app.version}",
  "packages": [
    {
      "name": "@npm-update-package/example",
      "currentVersion": "1.0.0",
      "newVersion": "2.0.0",
      "level": "major"
    }
  ]
}
\`\`\`

</div>
</details>

---
This PR has been generated by [${app.name}](${app.homepage}) v${app.version}`)
      expect(readFileMock).toBeCalledWith('node_modules/@npm-update-package/example/package.json')
    })
  })
})
