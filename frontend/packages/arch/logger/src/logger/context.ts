import { createContext, useContext } from 'react';

import { type Logger } from './core';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const LoggerContext = createContext<Logger | null>(null);

export function useLogger(options?: { allowNull?: boolean }) {
  const { allowNull = false } = options || {};
  const logger = useContext(LoggerContext);
  if (allowNull !== true && !logger) {
    throw new Error('expect logger in LoggerContext but not found');
  }

  return logger;
}
