export type SetStateInternal<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean | undefined,
  name?: string,
) => void;
