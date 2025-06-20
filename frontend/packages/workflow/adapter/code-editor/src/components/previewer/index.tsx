import React, { useEffect, useRef } from 'react';

import { type EditorAPI } from '@coze-editor/editor/preset-code';

import { Editor } from '../editor';
import { type PreviewerProps } from '../../interface';

export const Previewer = (props: PreviewerProps) => {
  const apiRef = useRef<EditorAPI | null>();

  useEffect(() => {
    if (!apiRef.current) {
      return;
    }

    if (props.content !== apiRef.current.getValue()) {
      apiRef.current.setValue(props.content);
    }
  }, [props.content]);

  return (
    <Editor
      uuid={`previewer_${new Date().getTime()}`}
      height={`${props.height}px`}
      defaultLanguage={props.language}
      defaultContent={props.content}
      readonly
      didMount={api => {
        apiRef.current = api;
      }}
    />
  );
};
