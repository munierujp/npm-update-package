import {
  left,
  right,
  type Either
} from 'fp-ts/lib/Either'
import {
  createBranchName,
  type CommitMessageCreator,
  type Git
} from '../git'
import type {
  BranchFinder,
  PullRequestCreator,
  PullRequestFinder,
  PullRequestsCloser
} from '../github'
import { logger } from '../logger'
import type { PackageManager } from '../package-manager'
import type { FailedResult } from './FailedResult'
import type { OutdatedPackage } from './OutdatedPackage'
import type { PackageUpdater } from './PackageUpdater'
import type { SucceededResult } from './SucceededResult'

// TODO: Add test
// TODO: Split into multiple classes and functions
export class OutdatedPackageProcessor {
  private readonly git: Git
  private readonly packageManager: PackageManager
  private readonly pullRequestCreator: PullRequestCreator
  private readonly branchFinder: BranchFinder
  private readonly commitMessageCreator: CommitMessageCreator
  private readonly pullRequestFinder: PullRequestFinder
  private readonly pullRequestsCloser: PullRequestsCloser
  private readonly packageUpdater: PackageUpdater

  constructor ({
    git,
    packageManager,
    pullRequestCreator,
    branchFinder,
    commitMessageCreator,
    pullRequestFinder,
    pullRequestsCloser,
    packageUpdater
  }: {
    git: Git
    packageManager: PackageManager
    pullRequestCreator: PullRequestCreator
    branchFinder: BranchFinder
    commitMessageCreator: CommitMessageCreator
    pullRequestFinder: PullRequestFinder
    pullRequestsCloser: PullRequestsCloser
    packageUpdater: PackageUpdater
  }) {
    this.git = git
    this.packageManager = packageManager
    this.pullRequestCreator = pullRequestCreator
    this.branchFinder = branchFinder
    this.commitMessageCreator = commitMessageCreator
    this.pullRequestFinder = pullRequestFinder
    this.pullRequestsCloser = pullRequestsCloser
    this.packageUpdater = packageUpdater
  }

  /**
   * Don't run in parallel because it includes file operations.
   */
  async process (outdatedPackage: OutdatedPackage): Promise<Either<FailedResult, SucceededResult>> {
    const branchName = createBranchName(outdatedPackage)
    logger.debug(`branchName=${branchName}`)

    if (this.branchFinder.findByName(branchName) !== undefined) {
      logger.info(`Skip ${outdatedPackage.name} because ${branchName} branch already exists on remote.`)
      return right({
        outdatedPackage,
        skipped: true
      })
    }

    await this.git.createBranch(branchName)
    logger.info(`${branchName} branch has created.`)

    try {
      try {
        await this.packageUpdater.update(outdatedPackage)
      } catch (error) {
        logger.error(error)
        return left({
          outdatedPackage,
          error
        })
      }

      logger.info(`${outdatedPackage.name} has updated from v${outdatedPackage.currentVersion.version} to v${outdatedPackage.newVersion.version}`)

      await this.git.add(this.packageManager.packageFile, this.packageManager.lockFile)
      const message = this.commitMessageCreator.create(outdatedPackage)
      logger.debug(`message=${message}`)

      await this.git.commit(message)
      await this.git.push(branchName)
      const pullRequest = await this.pullRequestCreator.create({
        outdatedPackage,
        branchName
      })
      logger.info(`Pull request for ${outdatedPackage.name} has created. ${pullRequest.html_url}`)
      await this.closeOldPullRequests(outdatedPackage)
      return right({
        outdatedPackage,
        created: true
      })
    } finally {
      await this.git.restore(this.packageManager.packageFile, this.packageManager.lockFile)
      await this.git.switch('-')
      await this.git.removeBranch(branchName)
      logger.info(`${branchName} branch has removed.`)
    }
  }

  private async closeOldPullRequests (outdatedPackage: OutdatedPackage): Promise<void> {
    const pullRequests = this.pullRequestFinder.findByPackageName(outdatedPackage.name)
    logger.debug(`pullRequests=${JSON.stringify(pullRequests)}`)
    await this.pullRequestsCloser.close(pullRequests)
  }
}
