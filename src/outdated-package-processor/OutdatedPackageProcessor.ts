import type {
  Committer,
  Git,
  BranchCleaner
} from '../git'
import type {
  PullRequestCreator,
  RemoteBranchExistenceChecker
} from '../github'
import { logger } from '../logger'
import type { OutdatedPackageUpdater } from '../outdated-package-updater'
import type { OutdatedPackage } from '../types'
import { createBranchName } from './createBranchName'
import { createCommitMessage } from './createCommitMessage'
import type { UpdateResult } from './UpdateResult'

// TODO: add test
export class OutdatedPackageProcessor {
  private readonly git: Git
  private readonly committer: Committer
  private readonly branchCleaner: BranchCleaner
  private readonly outdatedPackageUpdater: OutdatedPackageUpdater
  private readonly remoteBranchExistenceChecker: RemoteBranchExistenceChecker
  private readonly pullRequestCreator: PullRequestCreator

  constructor ({
    git,
    committer,
    branchCleaner,
    outdatedPackageUpdater,
    remoteBranchExistenceChecker,
    pullRequestCreator
  }: {
    git: Git
    committer: Committer
    branchCleaner: BranchCleaner
    outdatedPackageUpdater: OutdatedPackageUpdater
    remoteBranchExistenceChecker: RemoteBranchExistenceChecker
    pullRequestCreator: PullRequestCreator
  }) {
    this.git = git
    this.committer = committer
    this.branchCleaner = branchCleaner
    this.outdatedPackageUpdater = outdatedPackageUpdater
    this.remoteBranchExistenceChecker = remoteBranchExistenceChecker
    this.pullRequestCreator = pullRequestCreator
  }

  /**
   * Don't run in parallel because it includes file operations.
   */
  async process (outdatedPackage: OutdatedPackage): Promise<UpdateResult> {
    const branchName = createBranchName(outdatedPackage)
    logger.debug(`branchName=${branchName}`)

    if (this.remoteBranchExistenceChecker.check(branchName)) {
      logger.info(`Skip ${outdatedPackage.name} because ${branchName} branch already exists on remote.`)
      return {
        outdatedPackage,
        skipped: true
      }
    }

    await this.git.createBranch(branchName)
    logger.info(`${branchName} branch has created.`)

    await this.outdatedPackageUpdater.update(outdatedPackage)
    logger.info(`${outdatedPackage.name} has updated from v${outdatedPackage.currentVersion.version} to v${outdatedPackage.newVersion.version}`)

    // TODO: add only necessary files （package.json & package-lock.json or yarn.lock）
    await this.git.addAll()
    const message = createCommitMessage(outdatedPackage)
    logger.debug(`message=${message}`)

    await this.committer.commit(message)
    await this.git.push(branchName)
    await this.pullRequestCreator.create({
      outdatedPackage,
      branchName
    })
    await this.branchCleaner.clean()
    logger.info(`${branchName} branch has removed.`)

    return {
      outdatedPackage,
      updated: true
    }
  }
}
