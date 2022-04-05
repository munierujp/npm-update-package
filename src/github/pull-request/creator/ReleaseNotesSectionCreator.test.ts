import type { Release } from '../../releases'
import type { GitHubUrlOptimizer } from './GitHubUrlOptimizer'
import { ReleaseNotesSectionCreator } from './ReleaseNotesSectionCreator'

describe('ReleaseNotesSectionCreator', () => {
  describe('create', () => {
    const optimizeMock = jest.fn()
    const gitHubUrlOptimizer = {
      optimize: optimizeMock
    } as unknown as GitHubUrlOptimizer
    const releaseNotesSectionCreator = new ReleaseNotesSectionCreator(gitHubUrlOptimizer)

    beforeEach(() => {
      optimizeMock.mockImplementation((url) => {
        const newUrl = new URL(url)
        newUrl.host = 'github.test'
        return newUrl
      })
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('returns release notes section', () => {
      const releases: Release[] = [
        {
          tag: 'v1.0.0',
          url: 'https://github.com/npm-update-package/example/releases/tag/v1.0.0'
        },
        {
          tag: 'v2.0.0',
          url: 'https://github.com/npm-update-package/example/releases/tag/v2.0.0'
        }
      ]

      const actual = releaseNotesSectionCreator.create(releases)

      expect(actual).toBe(`## Release notes

- [v1.0.0](https://github.test/npm-update-package/example/releases/tag/v1.0.0)
- [v2.0.0](https://github.test/npm-update-package/example/releases/tag/v2.0.0)`)
      expect(optimizeMock).toBeCalledWith('https://github.com/npm-update-package/example/releases/tag/v1.0.0')
      expect(optimizeMock).toBeCalledWith('https://github.com/npm-update-package/example/releases/tag/v2.0.0')
    })
  })
})
