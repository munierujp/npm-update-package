import {
  left,
  right,
  type Either
} from 'fp-ts/lib/Either'
import {
  createBranchName,
  GitTransaction,
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
import { OutdatedPackageProcessor } from './OutdatedPackageProcessor'
import type { PackageUpdater } from './PackageUpdater'
import type { SucceededResult } from './SucceededResult'

// TODO: Add test
export class Recreate implements OutdatedPackageProcessor {
  private readonly git: Git
  private readonly packageManager: PackageManager
  private readonly pullRequestCreator: PullRequestCreator
  private readonly branchFinder: BranchFinder
  private readonly commitMessageCreator: CommitMessageCreator
  private readonly packageUpdater: PackageUpdater
  private readonly pullRequestFinder: PullRequestFinder
  private readonly pullRequestsCloser: PullRequestsCloser

  constructor ({
    git,
    packageManager,
    pullRequestCreator,
    branchFinder,
    commitMessageCreator,
    packageUpdater,
    pullRequestFinder,
    pullRequestsCloser
  }: {
    git: Git
    packageManager: PackageManager
    pullRequestCreator: PullRequestCreator
    branchFinder: BranchFinder
    commitMessageCreator: CommitMessageCreator
    packageUpdater: PackageUpdater
    pullRequestFinder: PullRequestFinder
    pullRequestsCloser: PullRequestsCloser
  }) {
    this.git = git
    this.packageManager = packageManager
    this.pullRequestCreator = pullRequestCreator
    this.branchFinder = branchFinder
    this.commitMessageCreator = commitMessageCreator
    this.packageUpdater = packageUpdater
    this.pullRequestFinder = pullRequestFinder
    this.pullRequestsCloser = pullRequestsCloser
  }

  async process (outdatedPackage: OutdatedPackage): Promise<Either<FailedResult, SucceededResult>> {
    const branchName = createBranchName(outdatedPackage)
    logger.trace(`branchName=${branchName}`)

    if (this.branchFinder.findByName(branchName) !== undefined) {
      logger.info(`Skip ${outdatedPackage.name} because ${branchName} branch already exists on remote.`)
      return right({
        outdatedPackage,
        skipped: true
      })
    }

    const transaction = new GitTransaction({
      git: this.git,
      branchName,
      files: [this.packageManager.packageFile, this.packageManager.lockFile]
    })
    return await transaction.run(async ({ git, branchName }) => {
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
      await git.add(this.packageManager.packageFile, this.packageManager.lockFile)
      const message = this.commitMessageCreator.create(outdatedPackage)
      logger.trace(`message=${message}`)
      await git.commit(message)
      await git.push(branchName)
      const pullRequest = await this.pullRequestCreator.create({
        outdatedPackage,
        branchName
      })
      logger.trace(`pullRequest=${JSON.stringify(pullRequest)}`)
      logger.info(`Pull request for ${outdatedPackage.name} has created. ${pullRequest.html_url}`)
      const pullRequests = this.pullRequestFinder.findByPackageName(outdatedPackage.name)
      logger.trace(`pullRequests=${JSON.stringify(pullRequests)}`)
      await this.pullRequestsCloser.close(pullRequests)
      return right({
        outdatedPackage,
        created: true
      })
    })
  }
}
