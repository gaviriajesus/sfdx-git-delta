'use strict'
import { expect, jest, describe, it } from '@jest/globals'
import { getGlobalMetadata, getWork } from '../../../__utils__/globalTestHelper'
import LwcHandler from '../../../../src/service/lwcHandler'
import { copyFiles } from '../../../../src/utils/fsHelper'
import { Work } from '../../../../src/types/work'
import { MetadataRepository } from '../../../../src/types/metadata'
import {
  ADDITION,
  DELETION,
  MODIFICATION,
} from '../../../../src/utils/gitConstants'

jest.mock('../../../../src/utils/fsHelper')

const objectType = 'lwc'
const element = 'component'
const basePath = `force-app/main/default/${objectType}`
const entityPath = `${basePath}/${element}/${element}.js`
const xmlName = 'LightningComponentBundle'
let work: Work
beforeEach(() => {
  jest.clearAllMocks()
  work = getWork()
})

describe('lwcHandler', () => {
  let globalMetadata: MetadataRepository
  beforeAll(async () => {
    // eslint-disable-next-line no-undef
    globalMetadata = await getGlobalMetadata()
  })
  describe('when the line should not be processed', () => {
    it.each([`${basePath}/.eslintrc.json`, `${basePath}/jsconfig.json`])(
      'does not handle the line',
      async entityPath => {
        // Arrange
        const sut = new LwcHandler(
          `${ADDITION}       ${entityPath}`,
          objectType,
          work,
          globalMetadata
        )

        // Act
        await sut.handle()

        // Assert
        expect(work.diffs.package.size).toBe(0)
        expect(copyFiles).not.toHaveBeenCalled()
      }
    )
  })

  describe('when the line should be processed', () => {
    it.each([ADDITION, MODIFICATION])(
      'handles the line for "%s" type change',
      async changeType => {
        // Arrange
        const sut = new LwcHandler(
          `${changeType}       ${entityPath}`,
          objectType,
          work,
          globalMetadata
        )

        // Act
        await sut.handle()

        // Assert
        expect(work.diffs.package.get(xmlName)).toEqual(new Set([element]))
        expect(copyFiles).toHaveBeenCalled()
      }
    )

    it('handles the line for "D" type change', async () => {
      // Arrange
      const sut = new LwcHandler(
        `${DELETION}       ${entityPath}`,
        objectType,
        work,
        globalMetadata
      )

      // Act
      await sut.handle()

      // Assert
      expect(work.diffs.destructiveChanges.get(xmlName)).toEqual(
        new Set([element])
      )
      expect(copyFiles).not.toHaveBeenCalled()
    })
  })
})
