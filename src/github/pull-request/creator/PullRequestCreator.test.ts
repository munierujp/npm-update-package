import type { OutdatedPackage } from '../../../core'
import type { GitRepository } from '../../../git'
import type { Options } from '../../../options'
import type {
  GitHub,
  Repository as GitHubRepository
} from '../../GitHub'
import type { AssigneesAdder } from './AssigneesAdder'
import type { PullRequestBodyCreator } from './PullRequestBodyCreator'
import { PullRequestCreator } from './PullRequestCreator'
import type { PullRequestTitleCreator } from './PullRequestTitleCreator'
import type { ReviewersAdder } from './ReviewersAdder'

describe('PullRequestCreator', () => {
  describe('create', () => {
    const pullRequestBodyCreatorCreateMock = jest.fn()
    const pullRequestTitleCreatorCreateMock = jest.fn()
    const githubAddLabelsMock = jest.fn()
    const githubCreatePullRequestMock = jest.fn()
    const assigneesAdderAddMock = jest.fn()
    const reviewersAdderAddMock = jest.fn()
    const github = {
      addLabels: githubAddLabelsMock,
      createPullRequest: githubCreatePullRequestMock
    } as unknown as GitHub
    const gitRepo = {
      owner: 'repository owner',
      name: 'repository name'
    } as unknown as GitRepository
    const githubRepo = {
      default_branch: 'master'
    } as unknown as GitHubRepository
    const pullRequestBodyCreator = {
      create: pullRequestBodyCreatorCreateMock
    } as unknown as PullRequestBodyCreator
    const pullRequestTitleCreator = {
      create: pullRequestTitleCreatorCreateMock
    } as unknown as PullRequestTitleCreator
    const assigneesAdder = {
      add: assigneesAdderAddMock
    } as unknown as AssigneesAdder
    const reviewersAdder = {
      add: reviewersAdderAddMock
    } as unknown as ReviewersAdder
    const options = {
      assignees: ['alice', 'bob'],
      assigneesSampleSize: 1,
      reviewers: ['carol', 'dave'],
      reviewersSampleSize: 1
    } as unknown as Options
    const pullRequestCreator = new PullRequestCreator({
      options,
      github,
      gitRepo,
      githubRepo,
      pullRequestTitleCreator,
      pullRequestBodyCreator,
      assigneesAdder,
      reviewersAdder
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('creates pull request', async () => {
      const title = 'pull request title'
      pullRequestTitleCreatorCreateMock.mockReturnValue(title)
      const body = 'pull request body'
      pullRequestBodyCreatorCreateMock.mockResolvedValue(body)
      const pullRequest = {
        number: 1
      }
      githubCreatePullRequestMock.mockResolvedValue(pullRequest)
      const outdatedPackage = {} as unknown as OutdatedPackage
      const branchName = 'branch name'

      await pullRequestCreator.create({
        outdatedPackage,
        branchName
      })

      expect(pullRequestTitleCreatorCreateMock).toBeCalledWith(outdatedPackage)
      expect(pullRequestBodyCreatorCreateMock).toBeCalledWith(outdatedPackage)
      expect(githubCreatePullRequestMock).toBeCalledWith({
        owner: gitRepo.owner,
        repo: gitRepo.name,
        baseBranch: githubRepo.default_branch,
        headBranch: branchName,
        title,
        body
      })
      expect(githubAddLabelsMock).toBeCalledWith({
        owner: gitRepo.owner,
        repo: gitRepo.name,
        issueNumber: pullRequest.number,
        labels: ['npm-update-package']
      })
      expect(assigneesAdderAddMock).toBeCalledWith({
        issueNumber: pullRequest.number,
        assignees: options.assignees,
        sampleSize: options.assigneesSampleSize
      })
      expect(reviewersAdderAddMock).toBeCalledWith({
        pullNumber: pullRequest.number,
        reviewers: options.reviewers,
        sampleSize: options.reviewersSampleSize
      })
    })
  })
})
