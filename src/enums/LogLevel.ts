export const LogLevel = {
  Info: 'info',
  Debug: 'debug'
} as const
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type LogLevel = typeof LogLevel[keyof typeof LogLevel]
const logLevels = Object.values(LogLevel)
export const isLogLevel = (value: any): value is LogLevel => logLevels.includes(value)
