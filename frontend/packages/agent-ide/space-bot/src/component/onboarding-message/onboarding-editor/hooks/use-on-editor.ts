import { useEffect } from 'react';

import { type OnboardingEditorContext } from '../index';

export type UseOnEditorProps = OnboardingEditorContext & {
  onEditorFocus: (e: FocusEvent) => void;
  onEditorBlur: (e: FocusEvent) => void;
};

export const useOnEditor = ({
  editorRef,
  onEditorFocus,
  onEditorBlur,
}: UseOnEditorProps) => {
  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current
      ?.getRootContainer()
      ?.addEventListener('focus', onEditorFocus, {
        capture: true,
      });
    editorRef.current
      ?.getRootContainer()
      ?.addEventListener('blur', onEditorBlur, {
        capture: true,
      });
  }, [editorRef.current]);
};
