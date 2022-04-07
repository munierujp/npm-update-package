import type { OutdatedPackage } from '../../../core'
import type { GitRepository } from '../../../git'
import { logger } from '../../../logger'
import type { Options } from '../../../options'
import type {
  CreatedPullRequest,
  GitHub,
  Repository as GitHubRepository
} from '../../GitHub'
import type { AssigneesAdder } from './AssigneesAdder'
import type { PullRequestBodyCreator } from './PullRequestBodyCreator'
import type { PullRequestTitleCreator } from './PullRequestTitleCreator'
import type { ReviewersAdder } from './ReviewersAdder'

export class PullRequestCreator {
  private readonly options: Options
  private readonly github: GitHub
  private readonly gitRepo: GitRepository
  private readonly githubRepo: GitHubRepository
  private readonly pullRequestTitleCreator: PullRequestTitleCreator
  private readonly pullRequestBodyCreator: PullRequestBodyCreator
  private readonly assigneesAdder: AssigneesAdder
  private readonly reviewersAdder: ReviewersAdder

  constructor ({
    options,
    github,
    gitRepo,
    githubRepo,
    pullRequestTitleCreator,
    pullRequestBodyCreator,
    assigneesAdder,
    reviewersAdder
  }: {
    options: Options
    github: GitHub
    gitRepo: GitRepository
    githubRepo: GitHubRepository
    pullRequestTitleCreator: PullRequestTitleCreator
    pullRequestBodyCreator: PullRequestBodyCreator
    assigneesAdder: AssigneesAdder
    reviewersAdder: ReviewersAdder
  }) {
    this.options = options
    this.github = github
    this.gitRepo = gitRepo
    this.githubRepo = githubRepo
    this.pullRequestTitleCreator = pullRequestTitleCreator
    this.pullRequestBodyCreator = pullRequestBodyCreator
    this.assigneesAdder = assigneesAdder
    this.reviewersAdder = reviewersAdder
  }

  async create ({
    outdatedPackage,
    branchName
  }: {
    outdatedPackage: OutdatedPackage
    branchName: string
  }): Promise<CreatedPullRequest> {
    const title = this.pullRequestTitleCreator.create(outdatedPackage)
    logger.debug(`title=${title}`)

    const body = await this.pullRequestBodyCreator.create(outdatedPackage)
    logger.debug(`body=${body}`)

    const pullRequest = await this.github.createPullRequest({
      owner: this.gitRepo.owner,
      repo: this.gitRepo.name,
      baseBranch: this.githubRepo.default_branch,
      headBranch: branchName,
      title,
      body
    })
    logger.debug(`pullRequest=${JSON.stringify(pullRequest)}`)

    await this.github.addLabels({
      owner: this.gitRepo.owner,
      repo: this.gitRepo.name,
      issueNumber: pullRequest.number,
      labels: ['npm-update-package']
    })

    if (this.options.assignees !== undefined) {
      await this.assigneesAdder.add({
        issueNumber: pullRequest.number,
        assignees: this.options.assignees,
        sampleSize: this.options.assigneesSampleSize
      })
    }

    if (this.options.reviewers !== undefined) {
      await this.reviewersAdder.add({
        pullNumber: pullRequest.number,
        reviewers: this.options.reviewers,
        sampleSize: this.options.reviewersSampleSize
      })
    }

    return pullRequest
  }
}
