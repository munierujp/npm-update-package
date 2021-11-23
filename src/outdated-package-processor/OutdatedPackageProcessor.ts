import type {
  Committer,
  Git
} from '../git'
import type {
  PullRequestCreator,
  RemoteBranchExistenceChecker
} from '../github'
import type { Logger } from '../logger'
import type { Ncu } from '../ncu'
import type { PackageManager } from '../package-manager'
import type {
  OutdatedPackage,
  Result
} from '../types'
import { createBranchName } from './createBranchName'
import { createCommitMessage } from './createCommitMessage'

// TODO: add test
export class OutdatedPackageProcessor {
  private readonly committer: Committer
  private readonly git: Git
  private readonly ncu: Ncu
  private readonly packageManager: PackageManager
  private readonly pullRequestCreator: PullRequestCreator
  private readonly remoteBranchExistenceChecker: RemoteBranchExistenceChecker
  private readonly logger: Logger

  constructor ({
    committer,
    git,
    ncu,
    packageManager,
    pullRequestCreator,
    remoteBranchExistenceChecker,
    logger
  }: {
    committer: Committer
    git: Git
    ncu: Ncu
    packageManager: PackageManager
    pullRequestCreator: PullRequestCreator
    remoteBranchExistenceChecker: RemoteBranchExistenceChecker
    logger: Logger
  }) {
    this.committer = committer
    this.git = git
    this.ncu = ncu
    this.packageManager = packageManager
    this.pullRequestCreator = pullRequestCreator
    this.remoteBranchExistenceChecker = remoteBranchExistenceChecker
    this.logger = logger
  }

  /**
   * Don't run in parallel because it includes file operations.
   */
  async process (outdatedPackage: OutdatedPackage): Promise<Result> {
    const branchName = createBranchName(outdatedPackage)
    this.logger.debug(`branchName=${branchName}`)

    if (this.remoteBranchExistenceChecker.check(branchName)) {
      this.logger.info(`Skip ${outdatedPackage.name} because ${branchName} branch already exists on remote.`)
      return {
        outdatedPackage,
        skipped: true
      }
    }

    await this.git.createBranch(branchName)
    this.logger.info(`${branchName} branch has created.`)

    const updatedPackages = await this.ncu.update(outdatedPackage)

    if (updatedPackages.length !== 1) {
      throw new Error(`Failed to update ${outdatedPackage.name}.`)
    }

    await this.packageManager.install()
    this.logger.info(`${outdatedPackage.name} has updated from v${outdatedPackage.currentVersion.version} to v${outdatedPackage.newVersion.version}`)

    await this.git.add(...this.packageManager.packageFiles)
    const message = createCommitMessage(outdatedPackage)
    this.logger.debug(`message=${message}`)

    await this.committer.commit(message)
    await this.git.push(branchName)
    await this.pullRequestCreator.create({
      outdatedPackage,
      branchName
    })
    await this.git.checkout('-')
    await this.git.removeBranch(branchName)
    this.logger.info(`${branchName} branch has removed.`)

    return {
      outdatedPackage,
      updated: true
    }
  }
}
