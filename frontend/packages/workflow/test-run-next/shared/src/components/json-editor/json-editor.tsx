import { useCallback, useEffect, useRef, useState } from 'react';

import { uniqueId } from 'lodash-es';
import { type EditorAPI } from '@flow-lang-sdk/editor/preset-code';
import { json } from '@flow-lang-sdk/editor/language-json';

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
