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

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from 'react';

import { TextArea, withField } from '@coze-arch/coze-design';

import {
  type EditorInputProps,
  type EditorHandle,
  type Editor,
  type Delta,
} from './types';

export const EditorFullInputInner = forwardRef<EditorHandle, EditorInputProps>(
  (props: EditorInputProps, ref) => {
    const {
      value: propsValue,
      onChange: propsOnChange,
      getEditor,
      ...restProps
    } = props;
    const [value, setValue] = useState(propsValue);

    // Create a mutable reference to store the latest value
    const valueRef = useRef(value);

    // When value is updated, synchronously update valueRef
    useEffect(() => {
      valueRef.current = value;
    }, [value]);

    const editorRef = useRef<Editor>({
      setHTML: (htmlContent: string) => {
        setValue(htmlContent);
      },
      setText: (text: string) => {
        setValue(text);
      },
      setContent: (content: { deltas: Delta[] }) => {
        setValue(content.deltas[0].insert);
      },
      getContent: () => ({
        deltas: [{ insert: valueRef.current ?? '' }],
      }),
      getText: () => valueRef.current || '',
      getRootContainer: () => null,
      getContentState: () => ({
        getZoneState: (zone: any) => null,
      }),
      selection: {
        getSelection: () => ({
          start: 0,
          end: 0,
          zoneId: '0',
        }),
      },
      registerCommand: () => null,
      scrollModule: {
        scrollTo: () => null,
      },
      on: () => null,
    });

    useImperativeHandle(ref, () => ({
      setDeltaContent(delta) {
        editorRef.current && delta && editorRef.current.setContent(delta);
      },
      getEditor() {
        return editorRef.current;
      },
      getMarkdown() {
        return editorRef.current?.getText() || '';
      },
    }));

    useEffect(() => {
      getEditor?.(editorRef.current);
    }, [getEditor]);

    return (
      <TextArea
        {...restProps}
        value={value}
        onChange={v => {
          setValue(v);
          propsOnChange?.(v);
        }}
      />
    );
  },
);

export const EditorInput: typeof EditorFullInputInner = withField(
  EditorFullInputInner,
  {
    valueKey: 'value',
    onKeyChangeFnName: 'onChange',
  },
);
