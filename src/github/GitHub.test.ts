import type { Octokit } from '@octokit/rest'
import {
  GitHub,
  type CreatedPullRequest,
  type Label,
  type Repository
} from './GitHub'

describe('GitHub', () => {
  const gitDeleteRefMock = jest.fn()
  const issuesAddLabelsMock = jest.fn()
  const issuesCreateLabelMock = jest.fn()
  const issuesGetLabelMock = jest.fn()
  const pullsCreateMock = jest.fn()
  const pullsRequestReviewersMock = jest.fn()
  const pullsUpdateMock = jest.fn()
  const reposGetMock = jest.fn()
  const octokit = {
    git: {
      deleteRef: gitDeleteRefMock
    },
    issues: {
      addLabels: issuesAddLabelsMock,
      createLabel: issuesCreateLabelMock,
      getLabel: issuesGetLabelMock
    },
    pulls: {
      create: pullsCreateMock,
      requestReviewers: pullsRequestReviewersMock,
      update: pullsUpdateMock
    },
    repos: {
      get: reposGetMock
    }
  } as unknown as Octokit
  const github = new GitHub(octokit)

  afterEach(() => {
    gitDeleteRefMock.mockReset()
    issuesAddLabelsMock.mockReset()
    issuesCreateLabelMock.mockReset()
    issuesGetLabelMock.mockReset()
    pullsCreateMock.mockReset()
    pullsRequestReviewersMock.mockReset()
    pullsUpdateMock.mockReset()
    reposGetMock.mockReset()
  })

  describe('addLabels', () => {
    it('calls octokit.issues.addLabels()', async () => {
      const owner = 'npm-update-package'
      const repo = 'example'
      const issueNumber = 1
      const labels = ['test label']
      await github.addLabels({
        owner,
        repo,
        issueNumber,
        labels
      })

      expect(issuesAddLabelsMock).toBeCalledWith({
        owner,
        repo,
        issue_number: issueNumber,
        labels
      })
    })
  })

  describe('closePullRequest', () => {
    it('calls octokit.pulls.update()', async () => {
      const owner = 'npm-update-package'
      const repo = 'example'
      const pullNumber = 1
      await github.closePullRequest({
        owner,
        repo,
        pullNumber
      })

      expect(pullsUpdateMock).toBeCalledWith({
        owner,
        repo,
        pull_number: pullNumber,
        state: 'closed'
      })
    })
  })

  describe('createLabel', () => {
    it('calls octokit.issues.createLabel()', async () => {
      const owner = 'npm-update-package'
      const repo = 'example'
      const name = 'test label'
      const description = 'test description'
      const color = 'FFFFFF'
      await github.createLabel({
        owner,
        repo,
        name,
        description,
        color
      })

      expect(issuesCreateLabelMock).toBeCalledWith({
        owner,
        repo,
        name,
        description,
        color
      })
    })
  })

  describe('createPullRequest', () => {
    it('calls octokit.pulls.create()', async () => {
      const expected = {} as unknown as CreatedPullRequest
      pullsCreateMock.mockResolvedValue({ data: expected })

      const owner = 'npm-update-package'
      const repo = 'example'
      const baseBranch = 'master'
      const headBranch = 'develop'
      const title = 'test title'
      const body = 'test body'
      const actual = await github.createPullRequest({
        owner,
        repo,
        baseBranch,
        headBranch,
        title,
        body
      })

      expect(actual).toBe(expected)
      expect(pullsCreateMock).toBeCalledWith({
        owner,
        repo,
        base: baseBranch,
        head: headBranch,
        title,
        body
      })
    })
  })

  describe('deleteBranch', () => {
    it('calls octokit.git.deleteRef()', async () => {
      const owner = 'npm-update-package'
      const repo = 'example'
      const branch = 'develop'
      await github.deleteBranch({
        owner,
        repo,
        branch
      })

      expect(gitDeleteRefMock).toBeCalledWith({
        owner,
        repo,
        ref: `heads/${branch}`
      })
    })
  })

  // TODO: fetchBranches

  describe('fetchLabel', () => {
    it('calls octokit.issues.getLabel()', async () => {
      const expected = {} as unknown as Label
      issuesGetLabelMock.mockResolvedValue({ data: expected })

      const owner = 'npm-update-package'
      const repo = 'example'
      const name = 'test label'
      const actual = await github.fetchLabel({
        owner,
        repo,
        name
      })

      expect(actual).toBe(expected)
      expect(issuesGetLabelMock).toBeCalledWith({
        owner,
        repo,
        name
      })
    })
  })

  // TODO: fetchPullRequests

  // TODO: fetchReleases

  describe('fetchRepository', () => {
    it('calls octokit.repos.get()', async () => {
      const expected = {} as unknown as Repository
      reposGetMock.mockResolvedValue({ data: expected })

      const owner = 'npm-update-package'
      const repo = 'example'
      const actual = await github.fetchRepository({
        owner,
        repo
      })

      expect(actual).toBe(expected)
      expect(reposGetMock).toBeCalledWith({
        owner,
        repo
      })
    })
  })

  describe('requestReviewers', () => {
    it('calls octokit.pulls.requestReviewers()', async () => {
      const owner = 'npm-update-package'
      const repo = 'example'
      const pullNumber = 1
      const reviewers = ['npm-update-package-bot']
      await github.requestReviewers({
        owner,
        repo,
        pullNumber,
        reviewers
      })

      expect(pullsRequestReviewersMock).toBeCalledWith({
        owner,
        repo,
        pull_number: pullNumber,
        reviewers
      })
    })
  })
})
