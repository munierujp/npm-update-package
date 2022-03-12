import {
  array,
  string,
  type TypeOf
} from 'io-ts'

export const Versions = array(string)
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Versions = TypeOf<typeof Versions>
export const isVersions = Versions.is
