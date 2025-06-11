import { useLayoutEffect } from 'react';

import { useInjector } from '@flow-lang-sdk/editor/react';
import { keymap, type EditorView } from '@codemirror/view';
export const useKeymap = (
  keyMap: string[],
  run: (view: EditorView) => boolean,
) => {
  const injector = useInjector();
  useLayoutEffect(
    () => injector.inject([keymap.of(keyMap.map(key => ({ key, run })))]),
    [injector, keyMap, run],
  );
};
