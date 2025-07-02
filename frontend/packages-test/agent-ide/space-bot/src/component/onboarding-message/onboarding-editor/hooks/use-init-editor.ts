import { useEffect, useRef } from 'react';

import { initEditorByPrologue } from '../method/init-editor';
import { type OnboardingEditorContext } from '../index';

export const useInitEditor = ({
  props,
  editorRef,
}: OnboardingEditorContext) => {
  const { initValues } = props;
  const { prologue } = initValues || {};
  const hasInit = useRef(false);
  useEffect(() => {
    if (hasInit.current) {
      return;
    }
    if (!prologue) {
      return;
    }
    if (!editorRef.current) {
      return;
    }
    hasInit.current = true;
    if (props.plainText) {
      editorRef.current.setText(prologue);
    } else {
      initEditorByPrologue({
        prologue,
        editorRef,
      });
    }
    // 滚动到顶部
    editorRef.current?.scrollModule?.scrollTo({
      top: 0,
    });
  }, [prologue, editorRef.current]);
};
