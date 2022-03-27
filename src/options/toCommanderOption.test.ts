import { PackageManagerName } from '../package-manager'
import type { CLIOption } from './CLIOption'
import { OptionType } from './OptionType'
import { toCommanderOption } from './toCommanderOption'

describe('toCommanderOption', () => {
  describe('returns Commander Option', () => {
    interface TestCase {
      cliOption: CLIOption
      expected: {
        name: string
        flags: string
        description: string
        required: boolean
        optional: boolean
        variadic: boolean
        short?: string
        long: string
        defaultValue?: number | string
        argChoices?: string[]
      }
    }
    const cases: TestCase[] = [
      // required
      {
        cliOption: {
          name: 'github-token',
          description: 'GitHub token',
          type: OptionType.String,
          required: true
        },
        expected: {
          name: 'github-token',
          flags: '--github-token <value>',
          description: 'GitHub token',
          required: true,
          optional: false,
          variadic: false,
          long: '--github-token'
        }
      },
      // optional
      {
        cliOption: {
          name: 'fetch-sleep-time',
          description: 'Sleep time between fetching (ms)',
          type: OptionType.Number,
          required: false,
          default: 1000
        },
        expected: {
          name: 'fetch-sleep-time',
          flags: '--fetch-sleep-time [value]',
          description: 'Sleep time between fetching (ms)',
          required: false,
          optional: true,
          variadic: false,
          long: '--fetch-sleep-time',
          defaultValue: 1000
        }
      },
      // has choices
      {
        cliOption: {
          name: 'package-manager',
          description: 'Package manager of your project',
          type: OptionType.String,
          required: false,
          choices: [
            PackageManagerName.Npm,
            PackageManagerName.Yarn
          ],
          default: PackageManagerName.Npm
        },
        expected: {
          name: 'package-manager',
          flags: '--package-manager [value]',
          description: 'Package manager of your project',
          required: false,
          optional: true,
          variadic: false,
          long: '--package-manager',
          defaultValue: PackageManagerName.Npm,
          argChoices: [
            PackageManagerName.Npm,
            PackageManagerName.Yarn
          ]
        }
      },
      // multiple values
      {
        cliOption: {
          name: 'reviewers',
          description: 'User names to request reviews',
          type: OptionType.StringArray,
          required: false
        },
        expected: {
          name: 'reviewers',
          flags: '--reviewers [values...]',
          description: 'User names to request reviews',
          required: false,
          optional: true,
          variadic: true,
          long: '--reviewers'
        }
      }
    ]

    it.each(cases)('cliOption=$cliOption', ({ cliOption, expected }) => {
      const actual = toCommanderOption(cliOption)

      expect(actual.name()).toBe(expected.name)
      expect(actual.flags).toBe(expected.flags)
      expect(actual.description).toBe(expected.description)
      expect(actual.required).toBe(expected.required)
      expect(actual.optional).toBe(expected.optional)
      expect(actual.variadic).toBe(expected.variadic)
      expect(actual.short).toBe(expected.short)
      expect(actual.long).toBe(expected.long)
      expect(actual.defaultValue).toBe(expected.defaultValue)
      expect(actual.argChoices).toEqual(expected.argChoices)
    })
  })
})
