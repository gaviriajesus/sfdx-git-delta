'use strict'
import { expect, jest, describe, it } from '@jest/globals'
import { getGlobalMetadata, getWork } from '../../../__utils__/globalTestHelper'
import BotHandler from '../../../../src/service/botHandler'
import { copyFiles } from '../../../../src/utils/fsHelper'
import { Work } from '../../../../src/types/work'
import { MetadataRepository } from '../../../../src/types/metadata'

jest.mock('../../../../src/utils/fsHelper')

const objectType = 'bots'
const line =
  'A       force-app/main/default/bots/TestBot/v1.botVersion-meta.xml'

let work: Work
beforeEach(() => {
  jest.clearAllMocks()
  work = getWork()
})

describe('BotHandler', () => {
  let globalMetadata: MetadataRepository
  beforeAll(async () => {
    // eslint-disable-next-line no-undef
    globalMetadata = await getGlobalMetadata()
  })

  describe('when called for a bot', () => {
    it('should add the bot', async () => {
      // Arrange
      work.config.generateDelta = false
      const sut = new BotHandler(
        'A       force-app/main/default/bots/TestBot/TestBot.bot-meta.xml',
        objectType,
        work,
        globalMetadata
      )

      // Act
      await sut.handleAddition()

      // Assert
      expect(work.diffs.package.get('Bot')).toEqual(new Set(['TestBot']))
      expect(work.diffs.package.get('BotVersion')).toBeUndefined()
      expect(copyFiles).not.toBeCalled()
    })
  })

  describe('when called for a bot version', () => {
    describe('when called with generateDelta false', () => {
      it('should add the related bot', async () => {
        // Arrange
        work.config.generateDelta = false
        const sut = new BotHandler(line, objectType, work, globalMetadata)

        // Act
        await sut.handleAddition()

        // Assert
        expect(work.diffs.package.get('Bot')).toEqual(new Set(['TestBot']))
        expect(work.diffs.package.get('BotVersion')).toEqual(
          new Set(['TestBot.v1'])
        )
        expect(copyFiles).not.toBeCalled()
      })
    })

    describe('when called with generateDelta true', () => {
      it('should add and copy the related parent bot', async () => {
        const sut = new BotHandler(line, objectType, work, globalMetadata)

        // Act
        await sut.handleAddition()

        // Assert
        expect(work.diffs.package.get('Bot')).toEqual(new Set(['TestBot']))
        expect(work.diffs.package.get('BotVersion')).toEqual(
          new Set(['TestBot.v1'])
        )
        expect(copyFiles).toBeCalledTimes(4)
        expect(copyFiles).toBeCalledWith(
          work.config,
          `force-app/main/default/bots/TestBot/v1.botVersion-meta.xml`
        )
        expect(copyFiles).toBeCalledWith(
          work.config,
          `force-app/main/default/bots/TestBot/v1.botVersion`
        )
        expect(copyFiles).toBeCalledWith(
          work.config,
          `force-app/main/default/bots/TestBot/TestBot.bot`
        )
        expect(copyFiles).toBeCalledWith(
          work.config,
          `force-app/main/default/bots/TestBot/TestBot.bot-meta.xml`
        )
      })
    })
  })
})
