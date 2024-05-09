import {
  describe,
  expect,
  it
} from '@jest/globals'
import { createRequirePackageJSON } from '../../../util/createRequirePackageJSON.js'
import { createFooter } from './createFooter.js'

const requirePackageJSON = createRequirePackageJSON(import.meta.url)
const pkg = requirePackageJSON('../../../../package.json')

describe('createFooter', () => {
  it('returns footer', () => {
    const actual = createFooter()

    expect(actual).toBe(`This PR has been generated by [${pkg.name}](${pkg.homepage}) v${pkg.version}`)
  })
})
