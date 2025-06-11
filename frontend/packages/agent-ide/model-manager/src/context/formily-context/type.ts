/* eslint-disable @coze-arch/no-batch-import-or-export */
import type * as FormilyReact from '@formily/react';
import type * as FomilyCore from '@formily/core';

export type FormilyReactType = typeof FormilyReact;
export type FormilyCoreType = typeof FomilyCore;

export type FormilyModule =
  | {
      status: 'unInit' | 'loading' | 'error';
      formilyCore: null;
      formilyReact: null;
    }
  | {
      status: 'ready';
      formilyCore: FormilyCoreType;
      formilyReact: FormilyReactType;
    };

export interface FormilyContextProps {
  formilyModule: FormilyModule;
  retryImportFormily: () => void;
}
