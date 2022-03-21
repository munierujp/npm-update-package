import { Octokit } from '@octokit/rest'
import { createOctokit } from './createOctokit'

describe('createOctokit', () => {
  describe('returns new Octokit instance', () => {
    interface TestCase {
      host: string
      token?: string
    }
    const cases: TestCase[] = [
      // for GitHub without token
      {
        host: 'github.com',
        token: undefined
      },
      // for GitHub with token
      {
        host: 'github.com',
        token: 'test token'
      },
      // for GitHub Enterprise with token
      {
        host: 'git.test',
        token: 'test token'
      }
    ]

    it.each(cases)('host=$host, token=$token', ({ host, token }) => {
      const actual = createOctokit({
        host,
        token
      })

      expect(actual).toBeInstanceOf(Octokit)
    })
  })
})
