import type {
  Octokit,
  RestEndpointMethodTypes
} from '@octokit/rest'
import type { Branch } from './Branch'
import type { CreatedPullRequest } from './CreatedPullRequest'
import type { Label } from './Label'
import type { PullRequest } from './PullRequest'
import type { Repository } from './Repository'

// TODO: add test
export class GitHub {
  constructor (private readonly octokit: Octokit) {}

  async addLabels (params: RestEndpointMethodTypes['issues']['addLabels']['parameters']): Promise<Label[]> {
    const { data } = await this.octokit.issues.addLabels(params)
    return data
  }

  async createPullRequest (params: RestEndpointMethodTypes['pulls']['create']['parameters']): Promise<CreatedPullRequest> {
    const { data } = await this.octokit.pulls.create(params)
    return data
  }

  async fetchBranches (params: RestEndpointMethodTypes['repos']['listBranches']['parameters']): Promise<Branch[]> {
    const { data } = await this.octokit.repos.listBranches(params)
    return data
  }

  async fetchPullRequests (params: RestEndpointMethodTypes['pulls']['list']['parameters']): Promise<PullRequest[]> {
    const { data } = await this.octokit.pulls.list(params)
    return data
  }

  async fetchRepository (params: RestEndpointMethodTypes['repos']['get']['parameters']): Promise<Repository> {
    const { data } = await this.octokit.repos.get(params)
    return data
  }

  // TODO: removePullRequest
}
