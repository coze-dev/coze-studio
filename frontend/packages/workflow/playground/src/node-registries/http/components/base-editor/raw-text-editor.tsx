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

import { forwardRef, useCallback, useEffect, useRef } from 'react';

import { type EditorAPI } from '@coze-editor/editor/preset-universal';

import { TextEditor } from '@/components/code-editor';

interface RawTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  readonly?: boolean;
  dataTestID?: string;
  placeholder?: string | HTMLElement;
  minHeight?: string | number;
}

export const BaseRawTextEditor = forwardRef<HTMLDivElement, RawTextEditorProps>(
  (props, ref) => {
    const { value, onChange, placeholder, className, minHeight, readonly } =
      props;

    const apiRef = useRef<EditorAPI | null>(null);

    const handleChange = useCallback(
      (e: { value: string }) => {
        if (typeof onChange === 'function') {
          onChange(e.value);
        }
      },
      [onChange],
    );

    // Value controlled;
    useEffect(() => {
      const editor = apiRef.current;

      if (!editor) {
        return;
      }

      if (typeof value === 'string' && value !== editor.getValue()) {
        editor.setValue(value);
      }
    }, [value]);

    return (
      <div ref={ref} className={className}>
        <TextEditor
          defaultValue={value ?? ''}
          onChange={handleChange}
          options={{
            placeholder,
            lineWrapping: true,
            minHeight,
            fontSize: 12,
            editable: !readonly,
            lineHeight: 20,
          }}
          didMount={api => (apiRef.current = api)}
        />
      </div>
    );
  },
);
