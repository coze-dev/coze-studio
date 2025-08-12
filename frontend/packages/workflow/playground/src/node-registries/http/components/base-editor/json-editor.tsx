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

import React, {
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
} from 'react';

import {
  type EditorAPI,
  transformerCreator,
} from '@coze-editor/editor/preset-code';
import { json } from '@coze-editor/editor/language-json';

import { CodeEditor } from '@/components/code-editor';

import { JsonEditorTheme } from '../../constants';

interface BaseJsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  className?: string;
  dataTestID?: string;
  placeholder?: string | HTMLElement;
  isDarkTheme?: boolean;
  readonly?: boolean;
  minHeight?: string | number;
  maxHeight?: string | number;
  editerHeight?: string | number;
  padding?: string | number;
  borderRadius?: string | number;
}

interface Match {
  match: string;
  range: [number, number];
}

function findAllMatches(inputString: string, regex: RegExp): Match[] {
  const globalRegex = new RegExp(
    regex,
    regex.flags.includes('g') ? regex.flags : `${regex.flags}g`,
  );
  let match;
  const matches: Match[] = [];

  while (true) {
    match = globalRegex.exec(inputString);
    if (!match) {
      break;
    }

    if (match.index === globalRegex.lastIndex) {
      globalRegex.lastIndex++;
    }
    matches.push({
      match: match[0],
      range: [match.index, match.index + match[0].length],
    });
  }

  return matches;
}

const transformer = transformerCreator(text => {
  const originalSource = text.toString();
  const matches = findAllMatches(originalSource, /\{\{([^\}]*)\}\}/g);

  if (matches.length > 0) {
    matches.forEach(({ range }) => {
      text.replaceRange(range[0], range[1], 'null');
    });
  }

  return text;
});

export const BaseJsonEditor = React.forwardRef(
  (props: BaseJsonEditorProps, ref) => {
    const {
      value,
      onChange,
      placeholder,
      className,
      isDarkTheme,
      readonly,
      minHeight = '100px',
      maxHeight,
      editerHeight,
      padding,
      borderRadius,
    } = props;

    const apiRef = useRef<EditorAPI | null>(null);

    const handleChange = useCallback(
      (e: { value: string }) => {
        if (typeof onChange === 'function') {
          onChange(e.value);
        }
      },
      [onChange],
    );

    useEffect(() => {
      apiRef.current?.updateASTDecorations();
    }, [isDarkTheme]);

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

    const formatJson = async () => {
      const view = apiRef.current?.$view;
      if (!view) {
        return;
      }
      view.dispatch(
        await json.languageService.format(view.state, {
          tabSize: 2,
        }),
      );
    };

    useImperativeHandle(ref, () => ({
      formatJson,
    }));

    return (
      <div className={className}>
        <CodeEditor
          defaultValue={value ?? ''}
          onChange={handleChange}
          options={{
            placeholder,
            lineWrapping: true,
            theme: isDarkTheme ? JsonEditorTheme.Dark : JsonEditorTheme.Light,
            languageId: 'json',
            editable: !readonly,
            transformer,
            minHeight,
            maxHeight,
            editerHeight,
            borderRadius,
            padding,
            fontSize: 12,
            lineHeight: 20,
          }}
          didMount={api => (apiRef.current = api)}
        />
      </div>
    );
  },
);
