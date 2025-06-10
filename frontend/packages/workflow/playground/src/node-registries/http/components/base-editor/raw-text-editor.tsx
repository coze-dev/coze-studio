import { forwardRef, useCallback, useEffect, useRef } from 'react';

import { type EditorAPI } from '@flow-lang-sdk/editor/preset-universal';

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
