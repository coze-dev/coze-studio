/* eslint-disable @typescript-eslint/no-extraneous-class */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from 'react';
import { lazy } from 'react';

import { type EditorInputProps } from './types';
export {
  DEFAULT_ZONE,
  displayType,
  type EditorInputProps,
  type EditorHandle,
  type Delta,
  type Editor,
  type IRenderContext,
  ToolbarItemEnum,
  ZoneDelta,
  IApplyMetadata,
  DeltaSet,
  DeltaSetOptions,
  EditorEventType,
} from './types';

export const Text: React.FC<any> = () => null;

export const ToolbarButton: React.FC<any> = () => null;

export class Plugin {}

export {
  md2html,
  checkAndGetMarkdown,
  delta2md,
  normalizeSchema,
} from './utils';

const LazyEditorFullInput: React.FC<EditorInputProps> = lazy(() =>
  import('./editor').then(module => ({
    default: module.EditorInput,
  })),
);

const LazyEditorFullInputInner: React.FC<EditorInputProps> = lazy(() =>
  import('./editor').then(module => ({
    default: module.EditorFullInputInner,
  })),
);

export { LazyEditorFullInput, LazyEditorFullInputInner };
