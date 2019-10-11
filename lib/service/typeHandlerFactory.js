'use strict'
const CustomObject = require('./customObjectHandler')
const InFolder = require('./inFolderHandler')
const InResource = require('./inResourceHandler')
const Lightning = require('./lightningHandler')
const Standard = require('./standardHandler')
const SubCustomObject = require('./subCustomObjectHandler')

const metadataManager = require('../metadata/metadataManager')
const path = require('path')

const classes = {
  aura: Lightning,
  businessProcesses: SubCustomObject,
  compactLayouts: SubCustomObject,
  dashboards: InFolder,
  documents: InFolder,
  fieldSets: SubCustomObject,
  fields: SubCustomObject,
  listViews: SubCustomObject,
  lwc: Lightning,
  objects: CustomObject,
  recordTypes: SubCustomObject,
  reportTypes: SubCustomObject,
  reports: InFolder,
  sharingReasons: SubCustomObject,
  staticresources: InResource,
  validationRules: SubCustomObject,
  webLinks: SubCustomObject,
}

module.exports = class HandlerFactory {
  constructor(work) {
    this.work = work
    this.metadata = metadataManager.getDefinition(
      'directoryName',
      this.work.config.apiVersion
    )
  }

  getTypeHander(line) {
    const type = line
      .split(path.sep)
      .reduce(
        (acc, value) =>
          Object.prototype.hasOwnProperty.call(this.metadata, value)
            ? value
            : acc,
        ''
      )

    return classes[type]
      ? new classes[type](line, type, this.work)
      : new Standard(line, type, this.work)
  }
}