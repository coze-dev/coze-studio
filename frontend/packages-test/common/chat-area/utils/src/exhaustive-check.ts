/**
 * 检查没有遗漏的项
 */
export const exhaustiveCheckForRecord = (_: Record<string, never>) => undefined;

export const exhaustiveCheckSimple = (_: never) => undefined;
