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

import { useCallback, useRef, useEffect, type ReactNode, useMemo } from 'react';

import { merge } from 'lodash-es';
import { Renderer, Placeholder, useEditor } from '@coze-editor/editor/react';
// promptPreset is a collection of built-in extensions for Prompt
import promptPreset, {
  type EditorAPI,
} from '@coze-editor/editor/preset-prompt';
import { ThemeExtension } from '@coze-common/editor-plugins/theme';
import { SyntaxHighlight } from '@coze-common/editor-plugins/syntax-highlight';
import { LanguageSupport } from '@coze-common/editor-plugins/language-support';

import { defaultTheme } from '@/theme/default';

export interface PromptEditorRenderProps {
  readonly?: boolean; // All insert editor related operations are disabled: action-bar
  placeholder?: ReactNode;
  className?: string;
  dataTestID?: string;
  defaultValue?: string;
  fontSize?: number;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  /**
   * Cursor focus lost
   */
  onBlur?: () => void;
  options?: Record<string, string | number>;
  isControled?: boolean; // Is it controlled
  getEditor?: (editor: EditorAPI) => void;
}

export const PromptEditorRender: React.FC<PromptEditorRenderProps> = props => {
  const {
    readonly,
    placeholder,
    defaultValue,
    className,
    dataTestID,
    value,
    onChange,
    onFocus,
    onBlur,
    options,
    isControled,
    getEditor,
  } = props;
  const apiRef = useRef<EditorAPI | null>(null);
  const editor = useEditor<EditorAPI>();

  useEffect(() => {
    if (!editor || !onBlur) {
      return;
    }

    editor.$on('blur', onBlur);

    return () => {
      editor.$off('blur', onBlur);
    };
  }, [editor, onBlur]);

  useEffect(() => {
    if (!editor || !onFocus) {
      return;
    }

    editor.$on('focus', onFocus);

    return () => {
      editor.$off('focus', onFocus);
    };
  }, [editor, onFocus]);

  // value controlled
  useEffect(() => {
    const curEditor = apiRef.current;

    if (!curEditor || !isControled || !editor) {
      return;
    }

    const preVal = curEditor.getValue();
    if (typeof value === 'string' && value !== preVal) {
      editor.$view.dispatch({
        changes: {
          from: 0,
          to: editor.$view.state.doc.length,
          insert: value ?? '',
        },
      });
    }
  }, [isControled, value, editor]);

  const handleChange = useCallback(
    (e: { value: string }) => {
      if (typeof onChange === 'function') {
        onChange(e.value);
      }
    },
    [onChange],
  );

  const contentAttributes = useMemo(
    () => ({
      class: className ?? '',
      'data-testid': dataTestID ?? '',
    }),
    [className, dataTestID],
  );

  return (
    <>
      <Renderer
        plugins={promptPreset}
        defaultValue={defaultValue}
        options={merge(
          {
            fontSize: 14,
            contentAttributes,
            editable: !readonly,
            readOnly: readonly,
          },
          options,
        )}
        onChange={handleChange}
        didMount={api => {
          apiRef.current = api;
          if (getEditor) {
            getEditor(api);
          }
        }}
      />
      <Placeholder>{placeholder}</Placeholder>
      <ThemeExtension themes={[defaultTheme]} />
      <LanguageSupport />
      <SyntaxHighlight.Markdown />
      <SyntaxHighlight.Jinja />
    </>
  );
};
