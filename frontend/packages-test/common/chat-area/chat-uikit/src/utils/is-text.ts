// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isText = (value: any): value is string =>
  value && typeof value === 'string';
