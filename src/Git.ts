import { logger } from './logger'
import type { Terminal } from './terminal'
import { GitRepository } from './values'

// TODO: add test
export class Git {
  constructor (private readonly terminal: Terminal) {}

  async add (...files: string[]): Promise<void> {
    await this.terminal.run('git', 'add', ...files)
  }

  async addAll (): Promise<void> {
    await this.terminal.run('git', 'add', '--all')
  }

  async checkout (branchName: string): Promise<void> {
    await this.terminal.run('git', 'checkout', branchName)
  }

  async commit (message: string): Promise<void> {
    await this.terminal.run('git', 'commit', '--message', message)
  }

  async createBranch (branchName: string): Promise<void> {
    await this.terminal.run('git', 'checkout', '-b', branchName)
  }

  async getConfig (key: string): Promise<string> {
    const { stdout } = await this.terminal.run('git', 'config', key)
    return stdout.trim()
  }

  async getRemoteUrl (): Promise<string> {
    const { stdout } = await this.terminal.run('git', 'remote', 'get-url', '--push', 'origin')
    return stdout.trim()
  }

  async getRepository (): Promise<GitRepository> {
    const url = await this.getRemoteUrl()
    logger.debug(`url=${url}`)
    return GitRepository.of(url)
  }

  async push (branchName: string): Promise<void> {
    await this.terminal.run('git', 'push', 'origin', branchName)
  }

  async removeBranch (branchName: string): Promise<void> {
    await this.terminal.run('git', 'branch', '-D', branchName)
  }

  async setConfig (key: string, value: string): Promise<void> {
    await this.terminal.run('git', 'config', key, value)
  }
}
