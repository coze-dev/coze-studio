import { logger } from '@coze-arch/rush-logger';

export const logAndThrowError = (logMessage: string, errorMessage?: string) => {
  logger.error(logMessage);
  const message = errorMessage || logMessage;
  throw new Error(message);
};

export function mergeObject(
  target: { [key: string]: any },
  ...sources: { [key: string]: any }[]
): { [key: string]: any } {
  const newObj = { ...target };
  if (!sources) {return newObj;}

  for (const source of sources) {
    for (const key of Object.keys(source)) {
      if (typeof source[key] !== 'undefined') {
        newObj[key] = source[key];
      }
    }
  }

  return newObj;
}

export function getPosixPath(filePath: string) {
  return filePath.replace(/\\/g, '/');
}
