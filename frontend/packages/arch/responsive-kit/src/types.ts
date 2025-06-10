export type ResponsiveTokenMap<T extends string> = Partial<
  Record<T | 'basic', number>
>;
