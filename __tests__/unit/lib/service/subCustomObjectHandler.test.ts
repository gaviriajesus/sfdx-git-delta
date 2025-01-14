'use strict'
import { expect, jest, describe, it } from '@jest/globals'
import { getGlobalMetadata, getWork } from '../../../__utils__/globalTestHelper'
import SubCustomObjectHandler from '../../../../src/service/subCustomObjectHandler'
import { MASTER_DETAIL_TAG } from '../../../../src/utils/metadataConstants'
import { readPathFromGit, copyFiles } from '../../../../src/utils/fsHelper'
import { Work } from '../../../../src/types/work'
import { MetadataRepository } from '../../../../src/types/metadata'

jest.mock('../../../../src/utils/fsHelper')

const mockedReadPathFromGit = jest.mocked(readPathFromGit)

const objectType = 'fields'
const line =
  'A       force-app/main/default/objects/Account/fields/awesome.field-meta.xml'

let work: Work
beforeEach(() => {
  jest.clearAllMocks()
  work = getWork()
})

describe('SubCustomObjectHandler', () => {
  let globalMetadata: MetadataRepository
  beforeAll(async () => {
    // eslint-disable-next-line no-undef
    globalMetadata = await getGlobalMetadata()
  })

  describe('when called with generateDelta false', () => {
    it('should not handle master detail exception', async () => {
      // Arrange
      work.config.generateDelta = false
      const sut = new SubCustomObjectHandler(
        line,
        objectType,
        work,
        globalMetadata
      )

      // Act
      await sut.handleAddition()

      // Assert
      expect(readPathFromGit).not.toBeCalled()
    })
  })
  describe('when called with generateDelta true', () => {
    describe(`when field is not master detail`, () => {
      it('should not handle master detail exception', async () => {
        // Arrange
        mockedReadPathFromGit.mockResolvedValueOnce('')
        const sut = new SubCustomObjectHandler(
          line,
          objectType,
          work,
          globalMetadata
        )

        // Act
        await sut.handleAddition()

        // Assert
        expect(readPathFromGit).toBeCalledTimes(1)
        expect(copyFiles).toBeCalledTimes(1)
      })
    })
    describe(`when field is master detail`, () => {
      it('should copy the parent object', async () => {
        // Arrange
        mockedReadPathFromGit.mockResolvedValueOnce(MASTER_DETAIL_TAG)
        const sut = new SubCustomObjectHandler(
          line,
          objectType,
          work,
          globalMetadata
        )

        // Act
        await sut.handleAddition()

        // Assert
        expect(readPathFromGit).toBeCalledTimes(1)
        expect(copyFiles).toBeCalledTimes(2)
      })
    })
  })
})
