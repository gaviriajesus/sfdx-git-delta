'use strict'

import { Config } from '../types/config'
import { MetadataRepository } from '../types/metadata'
import { Work } from '../types/work'

export default class BaseProcessor {
  protected readonly config: Config

  constructor(
    protected readonly work: Work,
    // eslint-disable-next-line no-unused-vars
    protected readonly metadata: MetadataRepository
  ) {
    this.config = work.config
  }

  public async process() {
    throw new Error('this class should be derived')
  }
}
