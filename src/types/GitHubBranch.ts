import type { RestEndpointMethodTypes } from '@octokit/rest'
import type { ValuesType } from 'utility-types'

export type GitHubBranch = ValuesType<RestEndpointMethodTypes['repos']['listBranches']['response']['data']>
