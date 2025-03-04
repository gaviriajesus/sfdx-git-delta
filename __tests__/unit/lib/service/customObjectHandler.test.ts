'use strict'
import { expect, jest, describe, it } from '@jest/globals'
import { getGlobalMetadata, getWork } from '../../../__utils__/globalTestHelper'
import CustomObjectHandler from '../../../../src/service/customObjectHandler'
import { MASTER_DETAIL_TAG } from '../../../../src/utils/metadataConstants'
import {
  copyFiles,
  pathExists,
  readDir,
  readPathFromGit,
} from '../../../../src/utils/fsHelper'
import { Work } from '../../../../src/types/work'
import { MetadataRepository } from '../../../../src/types/metadata'
jest.mock('../../../../src/utils/fsHelper')

const mockedPathExist = jest.mocked(pathExists)
const mockedReadDir = jest.mocked(readDir)
const mockedReadPathFromGit = jest.mocked(readPathFromGit)

mockedPathExist.mockResolvedValue(true)

const objectType = 'objects'
const line =
  'A       force-app/main/default/objects/Account/Account.object-meta.xml'

let work: Work
beforeEach(() => {
  jest.clearAllMocks()
  work = getWork()
})

describe('CustomObjectHandler', () => {
  let globalMetadata: MetadataRepository
  beforeAll(async () => {
    // eslint-disable-next-line no-undef
    globalMetadata = await getGlobalMetadata()
  })

  describe('when called with generateDelta false', () => {
    it('should not handle master detail exception', async () => {
      // Arrange
      work.config.generateDelta = false
      const sut = new CustomObjectHandler(
        line,
        objectType,
        work,
        globalMetadata
      )

      // Act
      await sut.handleAddition()

      // Assert
      expect(pathExists).not.toBeCalled()
    })
  })

  describe('when called with generateDelta true', () => {
    describe(`when called with not 'objects' type`, () => {
      it('should not handle try to find master details fields', async () => {
        // Arrange
        const sut = new CustomObjectHandler(
          'A       force-app/main/default/territory2Models/EU/EU.territory2Model-meta.xml',
          'territory2Models',
          work,
          globalMetadata
        )

        // Act
        await sut.handleAddition()

        // Assert
        expect(pathExists).not.toBeCalled()
      })
    })

    describe('when field folder exist', () => {
      describe('when field folder contains master details', () => {
        it('should copy master detail fields', async () => {
          // Arrange
          mockedReadDir.mockResolvedValueOnce(['Name.field-meta.xml'])
          mockedReadPathFromGit.mockResolvedValueOnce(MASTER_DETAIL_TAG)
          const sut = new CustomObjectHandler(
            line,
            objectType,
            work,
            globalMetadata
          )

          // Act
          await sut.handleAddition()

          // Assert
          expect(copyFiles).toBeCalledTimes(2)
        })
      })

      describe('when field folder does not contain master details', () => {
        it('should not copy master detail fields', async () => {
          // Arrange
          mockedReadDir.mockResolvedValue([])
          mockedReadPathFromGit.mockResolvedValueOnce('')
          const sut = new CustomObjectHandler(
            line,
            objectType,
            work,
            globalMetadata
          )

          // Act
          await sut.handleAddition()

          // Assert
          expect(copyFiles).toBeCalledTimes(1)
        })
      })
    })

    describe('when field folder does not exist', () => {
      it('should not look into the field folder', async () => {
        // Arrange
        mockedPathExist.mockResolvedValueOnce(false)
        const sut = new CustomObjectHandler(
          line,
          objectType,
          work,
          globalMetadata
        )

        // Act
        await sut.handleAddition()

        // Assert
        expect(readDir).not.toBeCalled()
      })
    })
  })
})
