// 去掉 ?
export type RemoveOptional<T> = {
  [K in keyof T]-?: T[K];
};

export type UnionUndefined<T> = {
  [K in keyof T]: T[K] | undefined;
};
