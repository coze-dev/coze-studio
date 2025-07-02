import React, { useCallback, useEffect, useRef } from 'react';

import { type EditorAPI } from '@coze-editor/editor/preset-code';

import { CodeEditor } from '@/components/code-editor';

import { JsonEditorTheme } from '../../constants';

interface BaseBashEditorProps {
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
}

export const BaseBashEditor = (props: BaseBashEditorProps) => {
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

  // 值受控;
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
    <div className={className}>
      <CodeEditor
        defaultValue={value ?? ''}
        onChange={handleChange}
        options={{
          placeholder,
          lineWrapping: true,
          theme: isDarkTheme ? JsonEditorTheme.Dark : JsonEditorTheme.Light,
          languageId: 'shell',
          editable: !readonly,
          minHeight,
          maxHeight,
          editerHeight,
          padding,
          fontSize: 12,
          lineHeight: 20,
        }}
        didMount={api => (apiRef.current = api)}
      />
    </div>
  );
};
