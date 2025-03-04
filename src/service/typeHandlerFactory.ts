'use strict'
import Bot from './botHandler'
import CustomObject from './customObjectHandler'
import InBundleHandler from './inBundleHandler'
import InFile from './inFileHandler'
import InFolder from './inFolderHandler'
import InResource from './inResourceHandler'
import LwcHandler from './lwcHandler'
import Standard from './standardHandler'
import SubCustomObject from './subCustomObjectHandler'
import ObjectTranslation from './objectTranslationHandler'
import SharedFolder from './sharedFolderHandler'

import { getType } from '../utils/typeUtils'
import { Work } from '../types/work'
import { MetadataRepository } from '../types/metadata'

const handlerMap = {
  assignmentRules: InFile,
  autoResponseRules: InFile,
  aura: LwcHandler,
  bots: Bot,
  businessProcesses: SubCustomObject,
  compactLayouts: SubCustomObject,
  dashboards: InFolder,
  digitalExperiences: InBundleHandler,
  discovery: SharedFolder,
  documents: InFolder,
  email: InFolder,
  escalationRules: InFile,
  experiences: InResource,
  fieldSets: SubCustomObject,
  fields: SubCustomObject,
  globalValueSetTranslations: InFile,
  indexes: SubCustomObject,
  labels: InFile,
  listViews: SubCustomObject,
  lwc: LwcHandler,
  matchingRules: InFile,
  moderation: SharedFolder,
  objects: CustomObject,
  objectTranslations: ObjectTranslation,
  profiles: InFile,
  recordTypes: SubCustomObject,
  reports: InFolder,
  rules: SubCustomObject,
  sharingReasons: SubCustomObject,
  sharingRules: InFile,
  standardValueSetTranslations: InFile,
  staticresources: InResource,
  territories: SubCustomObject,
  territory2Models: CustomObject,
  translations: InFile,
  validationRules: SubCustomObject,
  wave: SharedFolder,
  waveTemplates: InResource,
  webLinks: SubCustomObject,
  workflows: InFile,
}

export default class TypeHandlerFactory {
  constructor(
    // eslint-disable-next-line no-unused-vars
    protected readonly work: Work,
    // eslint-disable-next-line no-unused-vars
    protected readonly metadata: MetadataRepository
  ) {}

  public getTypeHandler(line: string) {
    const type = getType(line, this.metadata) as keyof typeof handlerMap

    return type in handlerMap
      ? new handlerMap[type](line, type, this.work, this.metadata)
      : new Standard(line, type, this.work, this.metadata)
  }
}
