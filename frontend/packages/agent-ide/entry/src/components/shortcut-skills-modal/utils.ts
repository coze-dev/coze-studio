export function isNonNull<T>(value: T | null): value is T {
  return value !== null;
}
