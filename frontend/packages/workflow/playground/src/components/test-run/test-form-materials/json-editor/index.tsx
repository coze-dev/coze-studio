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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import cls from 'classnames';
import { type SchemaObject } from 'ajv';
import { I18n } from '@coze-arch/i18n';
import { UIButton, withField } from '@coze-arch/bot-semi';
import {
  type editor as monacoEditorNameSpace,
  type OnMount,
} from '@coze-arch/bot-monaco-editor/types';
import { Editor as MonacoEditor } from '@coze-arch/bot-monaco-editor';
import { IconCozBroom, IconCozRefresh } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import type { ComponentAdapterCommonProps } from '../../types';
import { clearJsonSchema, setJsonSchema } from './utils';

import lightStyles from './light.module.less';
import styles from './index.module.less';

export type JSONEditorSchema = SchemaObject;

type JsonEditorProps = ComponentAdapterCommonProps<string> & {
  jsonSchema?: JSONEditorSchema;
  disabled?: boolean;
  className?: string;
  options?: monacoEditorNameSpace.IStandaloneEditorConstructionOptions;
  height?: number;
  defaultValue?: string;
} & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const JsonEditorAdapter: React.FC<JsonEditorProps> = ({
  validateStatus,
  onBlur,
  onFocus,
  jsonSchema,
  options = {},
  disabled,
  value,
  onChange,
  className,
  height,
  defaultValue,
  ...props
}) => {
  const [focus, setFocus] = useState(false);

  const editorRef = useRef<monacoEditorNameSpace.IStandaloneCodeEditor>();

  const valueRef = useRef<string | undefined>(value);

  const handleChange = val => {
    // No onchange is required when non-focus, avoid format triggering onchange
    if (!focus) {
      return;
    }
    if (!val) {
      valueRef.current = undefined;
      onChange?.(undefined);
    } else {
      valueRef.current = val;
      onChange?.(val);
    }
  };

  const triggerFormat = () => {
    editorRef.current?.trigger('editor', 'editor.action.formatDocument', {});
  };

  useEffect(() => {
    // Automatically format once when externally updating values
    if (value !== valueRef.current) {
      triggerFormat();
    }
  }, [value]);

  const listenerRef = useRef<
    {
      dispose: () => void;
    }[]
  >([]);

  const disposeListener = useCallback(() => {
    listenerRef.current.forEach(listener => listener.dispose());
    listenerRef.current = [];
  }, [listenerRef]);

  const handleBlur = useCallback(() => {
    setFocus(false);
    onBlur?.();
  }, [onBlur]);

  const handleFocus = useCallback(() => {
    setFocus(true);
    onFocus?.();
  }, [onFocus]);

  const handleDidMount = useCallback<OnMount>(
    (editor, monaco) => {
      editorRef.current = editor;

      const uri = editor.getModel()?.uri.toString();

      disposeListener();
      const blurListener = editor.onDidBlurEditorWidget(handleBlur);
      const focusListener = editor.onDidFocusEditorWidget(handleFocus);
      listenerRef.current = [blurListener, focusListener];

      if (jsonSchema && uri) {
        setJsonSchema(monaco, jsonSchema, uri);
        editor.onDidDispose(() => clearJsonSchema(monaco, uri));
      }

      // Initialization formatting once
      triggerFormat();
    },
    [handleBlur, handleFocus],
  );
  useEffect(
    () => () => {
      disposeListener();
    },
    [disposeListener],
  );

  const isJsonVerified = useMemo(() => {
    try {
      const rs = JSON.parse(value);
      return typeof rs === 'object';
      // eslint-disable-next-line @coze-arch/use-error-in-catch
    } catch (error) {
      return false;
    }
  }, [value]);

  return (
    <div
      data-testid={props['data-testid']}
      className={cls(styles['json-editor'], className)}
    >
      <div className="w-full h-[36px] px-[8px] rounded-t-[8px] coz-bg-primary flex items-center justify-between">
        <div>json</div>
        <div>
          {typeof defaultValue !== 'undefined' ? (
            <Tooltip content={I18n.t('Reset')}>
              <UIButton
                className="bg-transparent"
                disabled={disabled}
                onClick={() => {
                  onChange?.(defaultValue);
                }}
                icon={<IconCozRefresh />}
              />
            </Tooltip>
          ) : null}

          <Tooltip content={I18n.t('workflow_exception_ignore_format')}>
            <UIButton
              className="bg-transparent"
              disabled={disabled || !isJsonVerified}
              onClick={() => {
                try {
                  const formatJSON = JSON.parse(value as string);
                  const formatedValue = JSON.stringify(formatJSON, null, 4);
                  valueRef.current = formatedValue;
                  onChange?.(formatedValue);
                } catch (e) {
                  console.error(e);
                }
              }}
              icon={<IconCozBroom />}
            />
          </Tooltip>
        </div>
      </div>
      <div
        className={cls(
          'p-[12px] h-[120px] transition-height duration-200 ease-in',
          {
            [styles.error]: validateStatus === 'error',
            [styles.focus]: focus && !height,
            [styles.disabled]: disabled,
          },
        )}
        style={height ? { height: `${height}px` } : {}}
      >
        <MonacoEditor
          value={value || ''}
          onChange={handleChange}
          /** The same theme as ide must be used here, otherwise it may be contaminated */
          theme="icube-dark"
          defaultLanguage="json"
          /** Override icube-dark theme with css style */
          className={lightStyles.light}
          options={{
            fontSize: 13,
            minimap: {
              enabled: false,
            },
            contextmenu: false,
            scrollbar: {
              verticalScrollbarSize: 10,
              alwaysConsumeMouseWheel: false,
            },
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            folding: false,
            lineDecorationsWidth: 2,
            renderLineHighlight: 'none',
            glyphMargin: false,
            scrollBeyondLastLine: false,
            overviewRulerBorder: false,
            wordWrap: 'on',
            fixedOverflowWidgets: true,
            readOnly: disabled,
            ...options,
          }}
          onMount={handleDidMount}
          {...props}
        />
      </div>
    </div>
  );
};

// Use the Semi Form context to use in the test set form
const JsonEditorSemi = withField(JsonEditorAdapter, {
  valueKey: 'value',
  onKeyChangeFnName: 'onChange',
});

export { JsonEditorSemi };
