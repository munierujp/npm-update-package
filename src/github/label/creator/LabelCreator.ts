import type { GitRepository } from '../../../git'
import { logger } from '../../../logger'
import { isNotFoundError } from '../../errors'
import type {
  GitHub,
  Label
} from '../../GitHub'

// TODO: Split into multiple classes and functions
export class LabelCreator {
  private readonly github: GitHub
  private readonly gitRepo: GitRepository

  constructor ({
    github,
    gitRepo
  }: {
    github: GitHub
    gitRepo: GitRepository
  }) {
    this.github = github
    this.gitRepo = gitRepo
  }

  async create ({
    name,
    description,
    color
  }: {
    name: string
    description?: string
    color?: string
  }): Promise<void> {
    const label = await this.fetchLabel(name)

    if (label !== undefined) {
      logger.info(`Skip creating ${name} label because it already exists.`)
      return
    }

    await this.createLabel({
      name,
      description,
      color
    })
    logger.info(`${name} label has created.`)
  }

  private async createLabel ({
    name,
    description,
    color
  }: {
    name: string
    description?: string
    color?: string
  }): Promise<void> {
    await this.github.createLabel({
      owner: this.gitRepo.owner,
      repo: this.gitRepo.name,
      name,
      description,
      color
    })
  }

  private async fetchLabel (name: string): Promise<Label | undefined> {
    try {
      return await this.github.fetchLabel({
        owner: this.gitRepo.owner,
        repo: this.gitRepo.name,
        name
      })
    } catch (e) {
      if (isNotFoundError(e)) {
        logger.warn(e)
        return undefined
      } else {
        throw e
      }
    }
  }
}
