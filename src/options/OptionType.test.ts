import {
  isOptionType,
  OptionType
} from './OptionType'

describe('isOptionType', () => {
  describe('returns whether value is OptionType', () => {
    type TestCase = [unknown, boolean]
    const cases: TestCase[] = [
      [OptionType.String, true],
      [OptionType.StringArray, true],
      ['unknown', false]
    ]

    it.each(cases)('value=%p', (value, expected) => {
      const actual = isOptionType(value)

      expect(actual).toBe(expected)
    })
  })
})
