import { SemVer } from '../../../semver'
import { PullRequestTitleCreator } from './PullRequestTitleCreator'

describe('PullRequestTitleCreator', () => {
  describe('create', () => {
    it('returns pull request title', () => {
      const pullRequestTitleCreator = new PullRequestTitleCreator('chore(deps): {{level}} update {{{packageName}}} from {{currentVersion}} to v{{newVersion}}')
      const actual = pullRequestTitleCreator.create({
        name: '@typescript-eslint/eslint-plugin',
        currentVersion: SemVer.of('1.0.0'),
        newVersion: SemVer.of('2.0.0'),
        level: 'major'
      })
      expect(actual).toBe('chore(deps): major update @typescript-eslint/eslint-plugin from 1.0.0 to v2.0.0')
    })
  })
})
