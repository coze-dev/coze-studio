export type NestedObject = Record<string, never>;

export function flattenObject(obj: NestedObject): NestedObject {
  const flatten = Object.keys(obj).reduce((acc: NestedObject, key: string) => {
    const target = obj[key];
    if (
      typeof target === 'object' &&
      target !== null &&
      !Array.isArray(target)
    ) {
      Object.assign(acc, flattenObject(target));
    } else {
      Object.assign(acc, { [key]: target });
    }
    return acc;
  }, {});

  return flatten;
}
