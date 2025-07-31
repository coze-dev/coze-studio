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

import { useCallback, useEffect, useRef, useState } from 'react';

import { uniqueId } from 'lodash-es';
import { type EditorAPI } from '@coze-editor/editor/preset-code';
import { json } from '@coze-editor/editor/language-json';

import { JSONEditor, EditorProvider } from './base';

interface JsonEditorProps {
  value?: string;
  height?: string;
  disabled?: boolean;
  extensions?: any[];
  jsonSchema?: any;
  onChange?: (v?: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  didMount?: (editor: any) => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  height,
  disabled,
  extensions,
  jsonSchema,
  onChange,
  onBlur,
  onFocus,
  didMount,
}) => {
  const [focus, setFocus] = useState(false);
  const [uri] = useState(() => `file:///${uniqueId()}.json`);
  const editorRef = useRef<EditorAPI | null>(null);
  const handleChange = val => {
    onChange?.(val || undefined);
  };

  const handleBlur = useCallback(() => {
    setFocus(false);
    onBlur?.();
  }, [onBlur]);

  const handleFocus = useCallback(() => {
    setFocus(true);
    onFocus?.();
  }, [onFocus]);

  useEffect(() => {
    const schemaURI = `file:///${uniqueId()}`;

    json.languageService.configureSchemas({
      uri: schemaURI,
      fileMatch: [uri],
      schema: jsonSchema || {},
    });

    editorRef.current?.validate();

    return () => {
      json.languageService.deleteSchemas(schemaURI);
    };
  }, [uri, jsonSchema]);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value || '');
    }
  }, [value]);

  return (
    <EditorProvider>
      <JSONEditor
        defaultValue={value ?? ''}
        options={{
          uri,
          languageId: 'json',
          fontSize: 12,
          height: height ? height : focus ? '264px' : '120px',
          readOnly: disabled,
          editable: !disabled,
        }}
        extensions={extensions}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={e => handleChange(e.value)}
        didMount={_ => {
          editorRef.current = _;
          didMount?.(_);
        }}
      />
    </EditorProvider>
  );
};
