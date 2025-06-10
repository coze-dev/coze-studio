export type EnumToUnion<T extends Record<string, string>> = T[keyof T];
