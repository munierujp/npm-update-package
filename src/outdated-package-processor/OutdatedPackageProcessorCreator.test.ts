import type { PackageUpdater } from '../core'
import type {
  CommitMessageCreator,
  Git
} from '../git'
import type {
  BranchFinder,
  PullRequestCreator,
  PullRequestFinder,
  PullRequestsCloser
} from '../github'
import type { Options } from '../options'
import type { PackageManager } from '../package-manager'
import { Create } from './create'
import { OutdatedPackageProcessorCreator } from './OutdatedPackageProcessorCreator'
import { OutdatedPullRequestStrategy } from './OutdatedPullRequestStrategy'
import { Recreate } from './recreate'
import { Skip } from './skip'

describe('OutdatedPackageProcessorCreator', () => {
  describe('create', () => {
    describe('returns new OutdatedPackageProcessor instance', () => {
      it.each([
        [OutdatedPullRequestStrategy.Create, Create],
        [OutdatedPullRequestStrategy.Recreate, Recreate],
        [OutdatedPullRequestStrategy.Skip, Skip]
      ])('outdatedPrStrategy=%p', async (outdatedPrStrategy, expected) => {
        const options = {
          outdatedPrStrategy
        } as unknown as Options
        const outdatedPackageProcessorCreator = new OutdatedPackageProcessorCreator(options)
        const git = {} as unknown as Git
        const packageManager = {} as unknown as PackageManager
        const pullRequestCreator = {} as unknown as PullRequestCreator
        const branchFinder = {} as unknown as BranchFinder
        const commitMessageCreator = {} as unknown as CommitMessageCreator
        const pullRequestFinder = {} as unknown as PullRequestFinder
        const pullRequestsCloser = {} as unknown as PullRequestsCloser
        const packageUpdater = {} as unknown as PackageUpdater

        const actual = outdatedPackageProcessorCreator.create({
          git,
          packageManager,
          pullRequestCreator,
          branchFinder,
          commitMessageCreator,
          pullRequestFinder,
          pullRequestsCloser,
          packageUpdater
        })

        expect(actual).toBeInstanceOf(expected)
      })
    })
  })
})
