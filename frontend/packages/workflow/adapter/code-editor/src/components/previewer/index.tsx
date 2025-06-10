import React from 'react';

import { Editor } from '../editor';
import { type PreviewerProps } from '../../interface';

export const Previewer = (props: PreviewerProps) => (
  <Editor
    uuid={`previewer_${new Date().getTime()}`}
    height={`${props.height}px`}
    defaultLanguage={props.language}
    defaultContent={props.content}
    readonly
  />
);
