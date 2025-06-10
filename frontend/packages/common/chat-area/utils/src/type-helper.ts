// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 不知道为啥 unknown 不行，会导致类型转换失败
export type MakeValueUndefinable<T extends Record<string, any>> = {
  [k in keyof T]: T[k] | undefined;
};
