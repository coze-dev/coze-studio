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

import { type FC } from 'react';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import { type EditorAPI } from '@coze-editor/editor/preset-code';
import { json } from '@coze-editor/editor/language-json';
import { EditorView, tooltips } from '@codemirror/view';

import { CodeEditor, EditorProvider } from '@/components/code-editor';

import {
  configureJsonSchemas,
  getJsonSchemaUriByInputType,
  generateJsonFileUri,
} from './utils';
import { type LiteralValueInputProps } from './type';

configureJsonSchemas();

export const InputJson: FC<LiteralValueInputProps> = ({
  className,
  value,
  defaultValue,
  readonly,
  disabled,
  testId,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  style,
  inputType,
  config = {},
}) => {
  const apiRef = useRef<EditorAPI | null>(null);
  const { jsonSchema, onRequestInputExpand } = config;
  const localSchemaConfig = useMemo(() => {
    if (!jsonSchema) {
      return undefined;
    }
    const uri = getJsonSchemaUriByInputType(inputType);
    return {
      uri,
      fileMatch: [`${uri}_*.json`],
      schema: jsonSchema,
    };
  }, [jsonSchema]);

  const fileUri = useMemo(() => {
    const uri =
      localSchemaConfig?.uri || getJsonSchemaUriByInputType(inputType);
    return uri ? generateJsonFileUri(uri) : '';
  }, [localSchemaConfig, inputType]);

  useEffect(() => {
    if (localSchemaConfig) {
      json.languageService.configureSchemas(localSchemaConfig);
      apiRef.current?.validate();
      return () => {
        json.languageService.deleteSchemas(localSchemaConfig.uri);
      };
    }
  }, [localSchemaConfig]);

  const handleChange = (e: { value: string }) => {
    onChange?.(e.value);
  };

  // Value controlled;
  // useEffect(() => {
  // const editor = apiRef.current;
  // if (!editor) {
  //   return;
  // }
  // if (!value && editor.getValue()) {
  //   editor.setValue('');
  // } else if (typeof value === 'string' && value !== editor.getValue()) {
  //   editor.setValue(value);
  // }
  // }, [value]);

  useLayoutEffect(() => {
    onRequestInputExpand?.((apiRef.current?.$view?.contentHeight ?? 0) > 27);
  }, [value, onRequestInputExpand]);

  return (
    <div className={className} data-testid={testId} style={style}>
      <EditorProvider>
        <CodeEditor
          defaultValue={((value ?? defaultValue) as string) ?? ''}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={() => onBlur?.(apiRef.current?.getValue())}
          options={{
            uri: fileUri,
            placeholder,
            lineWrapping: true,
            theme: 'coze-light',
            languageId: 'json',
            editable: !disabled && !readonly,
            fontSize: 12,
            minHeight: 22,
            maxHeight: 22 * 8.5,
          }}
          extensions={[
            EditorView.theme({
              '.cm-gutters': {
                display: 'none',
              },
              '&, .cm-activeLine': {
                backgroundColor: 'transparent !important',
              },
              '.cm-line': {
                padding: '0 2px 0 6px !important',
              },
              '.cm-content.cm-lineWrapping': {
                paddingTop: '5px !important',
              },
              '.cm-placeholder': {
                color: 'var(--coz-fg-dim) !important',
                opacity: '1 !important',
              },
            }),
            tooltips({
              parent: document.body,
              tooltipSpace: () => ({
                left: 16,
                top: 16,
                right: window.innerWidth - 16,
                bottom: window.innerHeight - 16,
              }),
            }),
          ]}
          didMount={api => {
            apiRef.current = api;
            requestAnimationFrame(() => {
              onRequestInputExpand?.((api?.$view?.contentHeight ?? 0) > 27);
            });
          }}
        />
      </EditorProvider>
    </div>
  );
};
