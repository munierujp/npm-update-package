import type { GitHubBranch } from './GitHub'

export class RemoteBranchExistenceChecker {
  constructor (private readonly remoteBranchNames: string[]) {}

  static of (remoteBranches: GitHubBranch[]): RemoteBranchExistenceChecker {
    const remoteBranchNames = remoteBranches.map(({ name }) => name)
    return new RemoteBranchExistenceChecker(remoteBranchNames)
  }

  check (branchName: string): boolean {
    return this.remoteBranchNames.includes(branchName)
  }
}
