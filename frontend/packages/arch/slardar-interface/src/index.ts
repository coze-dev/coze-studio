export interface SlardarConfig {
  sessionId?: string;
  [key: string]: unknown;
}

export type SlardarEvents =
  | 'captureException'
  | 'sendEvent'
  | 'sendLog'
  | 'context.set';

export interface Slardar {
  (event: string, params?: Record<string, unknown>): void;
  (
    event: 'captureException',
    error?: Error,
    meta?: Record<string, string>,
    reactInfo?: { version: string; componentStack: string },
  ): void;
  (
    event: 'sendEvent',
    params: {
      name: string;
      metrics: Record<string, number>;
      categories: Record<string, string>;
    },
  ): void;
  (
    event: 'sendLog',
    params: {
      level: string;
      content: string;
      extra: Record<string, string | number>;
    },
  ): void;
  (event: 'context.set', key: string, value: string): void;
  config: (() => SlardarConfig) & ((options: Partial<SlardarConfig>) => void);
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

// 可用于约束传入的slardar实例类型
export type SlardarInstance = Slardar;

export type { Slardar as default };
