import fs from 'node:fs'
import {
  afterEach,
  describe,
  expect,
  it,
  jest
} from '@jest/globals'
import { canReadWrite } from './canReadWrite'

jest.mock('node:fs', () => ({
  constants: {
    R_OK: 4,
    W_OK: 2
  },
  promises: {
    access: jest.fn<typeof fs.promises.access>()
  }
}))

describe('canReadWrite', () => {
  const accessMock = jest.mocked(fs.promises.access)

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('returns true if the file is able to access.', async () => {
    accessMock.mockResolvedValue()
    const path = 'package.json'

    const actual = await canReadWrite(path)

    expect(actual).toBe(true)
    expect(accessMock).toHaveBeenCalledWith(path, fs.constants.R_OK | fs.constants.W_OK)
  })

  it('returns false if the file is not able to access.', async () => {
    accessMock.mockRejectedValue(new Error('error'))
    const path = 'package.json'

    const actual = await canReadWrite(path)

    expect(actual).toBe(false)
    expect(accessMock).toHaveBeenCalledWith(path, fs.constants.R_OK | fs.constants.W_OK)
  })
})
