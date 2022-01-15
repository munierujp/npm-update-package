interface Options {
  pretty?: boolean
}

// TODO: Add test
export const toJSON = (value: unknown, options?: Options): string => {
  const pretty = options?.pretty ?? false
  if (pretty) {
    return JSON.stringify(value)
  } else {
    return JSON.stringify(value, null, 2)
  }
}
