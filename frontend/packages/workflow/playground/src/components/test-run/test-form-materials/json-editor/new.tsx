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

import { uniqueId } from 'lodash-es';
import cls from 'classnames';
import { type SchemaObject } from 'ajv';
import { type EditorAPI } from '@coze-editor/editor/preset-code';
import { json } from '@coze-editor/editor/language-json';
import { I18n } from '@coze-arch/i18n';
import { UIButton, withField } from '@coze-arch/bot-semi';
import { type editor as monacoEditorNameSpace } from '@coze-arch/bot-monaco-editor/types';
import { IconCozBroom, IconCozRefresh } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';
import { EditorView } from '@codemirror/view';

import type { ComponentAdapterCommonProps } from '../../types';
import { EditorProvider, JSONEditor } from './json-editor';
import { IconDark, IconLight } from './icons';

import styles from './index.module.less';

export type JSONEditorSchema = SchemaObject;

type JsonEditorProps = ComponentAdapterCommonProps<string> & {
  jsonSchema?: JSONEditorSchema;
  disabled?: boolean;
  className?: string;
  options?: monacoEditorNameSpace.IStandaloneEditorConstructionOptions;
  height?: number;
  defaultValue?: string;
  title?: string;
} & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

const extensions = [
  EditorView.theme({
    '&': {
      borderRadius: '8px',
    },
    '.cm-scroller': {
      transition: 'height .3s ease',
    },
    '.cm-content': {
      paddingTop: '16px',
      paddingBottom: '16px',
    },
  }),
];

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
  title,
  ...props
}) => {
  const [preferNewEditor] = useState(true);
  const [theme, setTheme] = useState('light');
  const [focus, setFocus] = useState(false);

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

  const handleBlur = useCallback(() => {
    setFocus(false);
    onBlur?.();
  }, [onBlur]);

  const handleFocus = useCallback(() => {
    setFocus(true);
    onFocus?.();
  }, [onFocus]);

  const newEditorRef = useRef<EditorAPI | null>(null);
  const uri = useMemo(() => `file:///${uniqueId()}.json`, []);

  function triggerFormat() {
    if (!newEditorRef.current) {
      return;
    }

    const currentValue = newEditorRef.current.getValue();

    try {
      const object = JSON.parse(currentValue);
      const formatted = JSON.stringify(object, null, 4);
      if (newEditorRef.current.getValue() !== formatted) {
        newEditorRef.current.setValue(formatted);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    // Automatically format once when externally updating values
    if (value !== valueRef.current) {
      triggerFormat();
    }
  }, [value]);

  useEffect(() => {
    const schemaURI = `file:///${uniqueId()}`;

    json.languageService.configureSchemas({
      uri: schemaURI,
      fileMatch: [uri],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schema: jsonSchema as any,
    });

    newEditorRef.current?.validate();

    return () => {
      json.languageService.deleteSchemas(schemaURI);
    };
  }, [uri, jsonSchema]);

  useEffect(() => {
    if (!newEditorRef.current) {
      return;
    }

    if (value !== newEditorRef.current.getValue()) {
      newEditorRef.current.setValue(value);
    }
  }, [value]);

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
      className={cls(
        styles['json-editor'],
        preferNewEditor ? styles['is-new-editor'] : '',
        theme === 'dark' ? styles['is-dark-theme'] : styles['is-light-theme'],
        className,
      )}
    >
      <div
        className={cls(
          'w-full h-[28px] px-[8px] rounded-t-[8px] flex items-center justify-between',
          styles.header,
        )}
      >
        <div className={styles.title}>{title || 'json'}</div>
        <div className={styles.icons}>
          {typeof defaultValue !== 'undefined' ? (
            <Tooltip content={I18n.t('Reset')}>
              <UIButton
                className="bg-transparent"
                disabled={disabled}
                onClick={() => {
                  onChange?.(defaultValue);
                }}
                onMouseDown={e => e.preventDefault()}
                icon={<IconCozRefresh />}
              />
            </Tooltip>
          ) : null}

          <UIButton
            className="bg-transparent"
            size="small"
            onClick={() => {
              setTheme(t => (t === 'light' ? 'dark' : 'light'));
            }}
            onMouseDown={e => e.preventDefault()}
            icon={theme === 'light' ? <IconLight /> : <IconDark />}
          />

          <Tooltip content={I18n.t('workflow_exception_ignore_format')}>
            <UIButton
              size={'small'}
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
              onMouseDown={e => e.preventDefault()}
              icon={<IconCozBroom />}
            />
          </Tooltip>
        </div>
      </div>
      <div
        className={cls('pl-[12px] transition-height duration-200 ease-in', {
          [styles.error]: validateStatus === 'error',
          [styles.disabled]: disabled,
        })}
      >
        <EditorProvider>
          <JSONEditor
            defaultValue={value ?? ''}
            options={{
              uri,
              languageId: 'json',
              theme: theme === 'dark' ? 'coze-dark' : 'coze-light',
              fontSize: 12,
              height: height ? height : focus ? '264px' : '120px',
              readOnly: disabled,
              editable: !disabled,
            }}
            extensions={extensions}
            onChange={e => handleChange(e.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            didMount={_ => (newEditorRef.current = _)}
          />
        </EditorProvider>
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
