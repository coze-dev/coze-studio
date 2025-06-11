export const typedKeys = <T extends Parameters<typeof Object.keys>[number]>(
  o: T,
): Array<keyof T> => Object.keys(o) as Array<keyof T>;
