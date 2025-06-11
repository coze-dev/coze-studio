export function filterKeys(obj: Record<string, any>, keys: string[]) {
  const newObj: Record<string, any> = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }

  return newObj;
}
