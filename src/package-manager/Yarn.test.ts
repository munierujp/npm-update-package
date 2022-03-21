import type { Terminal } from '../terminal'
import { Yarn } from './Yarn'

describe('Yarn', () => {
  const terminalRunMock = jest.fn()
  const terminal = {
    run: terminalRunMock
  } as unknown as Terminal
  const yarn = new Yarn(terminal)

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getVersions', () => {
    describe('calls `yarn info <package-name> versions --json', () => {
      const packageName = '@npm-update-package/example'

      it('returns versions if stdout is valid', async () => {
        const expected = [
          '1.0.0',
          '2.0.0'
        ]
        terminalRunMock.mockResolvedValue({
          stdout: JSON.stringify({
            type: 'inspect',
            data: expected
          })
        })

        const actual = await yarn.getVersions(packageName)

        expect(actual).toEqual(expected)
        expect(terminalRunMock).toBeCalledWith('yarn', 'info', packageName, 'versions', '--json')
      })

      it('throws error if stdout is invalid', async () => {
        terminalRunMock.mockResolvedValue({ stdout: JSON.stringify({}) })

        await expect(async () => await yarn.getVersions(packageName)).rejects.toThrow(Error)

        expect(terminalRunMock).toBeCalledWith('yarn', 'info', packageName, 'versions', '--json')
      })
    })
  })

  describe('install', () => {
    it('calls `yarn install`', async () => {
      await yarn.install()

      expect(terminalRunMock).toBeCalledWith('yarn', 'install')
    })
  })
})
