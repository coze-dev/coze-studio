/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useEffect, useRef } from 'react';

import { type EditorAPI } from '../editor/preset';
import { Editor } from '../editor';
import { type PreviewerProps } from '../../interface';

export const Previewer = (props: PreviewerProps) => {
  const apiRef = useRef<EditorAPI | null>();

  useEffect(() => {
    if (!apiRef.current) {
      return;
    }

    if (props.content !== apiRef.current.getValue()) {
      apiRef.current.forceSetValue(props.content);
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
