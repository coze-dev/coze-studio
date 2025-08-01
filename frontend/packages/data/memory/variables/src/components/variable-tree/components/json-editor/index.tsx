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

import {
  useCallback,
  useEffect,
  useState,
  Suspense,
  lazy,
  type FC,
  useMemo,
} from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozBroom } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip, Modal } from '@coze-arch/coze-design';

import { MAX_JSON_LENGTH } from '../../constants';
import { formatJson } from './utils/format-json';
import {
  convertSchemaService,
  type SchemaNode,
} from './service/convert-schema-service';

import lightStyles from './light.module.less';

const LazyBizIDEMonacoEditor = lazy(async () => {
  const { Editor } = await import('@coze-arch/bot-monaco-editor');
  return { default: Editor };
});

const BizIDEMonacoEditor = props => (
  <Suspense>
    <LazyBizIDEMonacoEditor {...props} />
  </Suspense>
);
interface JSONEditorProps {
  id: string;
  value: string;
  groupId: string;
  setValue: (value: string) => void;
  visible: boolean;
  readonly?: boolean;
  onCancel: () => void;
  onOk: (value: SchemaNode[]) => void;
}

const ValidateRules = {
  jsonValid: {
    message: I18n.t('variables_json_input_error'),
    validator: (value: string) => {
      try {
        const rs = JSON.parse(value);
        const isJson = typeof rs === 'object';
        return isJson;
        // eslint-disable-next-line @coze-arch/use-error-in-catch
      } catch (error) {
        return false;
      }
    },
  },
  jsonLength: {
    message: I18n.t('variables_json_input_limit'),
    validator: (value: string) => {
      if (value.length > MAX_JSON_LENGTH) {
        return false;
      }
      return true;
    },
  },
};

export const JSONEditor: FC<JSONEditorProps> = props => {
  const { id, value, setValue, visible, onCancel, onOk, readonly } = props;
  const [schema, setSchema] = useState<SchemaNode[] | undefined>();
  const [error, setError] = useState<string | undefined>();
  const change = useCallback(async () => {
    if (!schema) {
      return;
    }
    setError(undefined);
    return new Promise(resolve => {
      Modal.warning({
        title: I18n.t('workflow_json_node_update_tips_title'),
        content: I18n.t('workflow_json_node_update_tips_content'),
        okType: 'warning',
        okText: I18n.t('Confirm'),
        cancelText: I18n.t('Cancel'),
        onOk: () => {
          const outputValue = convert(value) || [];
          onOk(outputValue);
          resolve(true);
        },
        onCancel: () => resolve(false),
      });
    });
  }, [schema]);

  const convert = (jsonString: string): SchemaNode[] | undefined => {
    if (!jsonString) {
      return;
    }
    try {
      const json = JSON.parse(jsonString);
      const outputValue = convertSchemaService(json);
      if (
        !outputValue ||
        !Array.isArray(outputValue) ||
        outputValue.length === 0
      ) {
        return;
      }
      return outputValue;
    } catch (e) {
      return;
    }
  };

  const validate = (newValue: string) => {
    const rules = Object.values(ValidateRules);
    for (const rule of rules) {
      if (!rule.validator(newValue)) {
        setError(rule.message);
        return false;
      }
    }
    setError(undefined);
    return true;
  };

  const isValid = useMemo(() => validate(value), [value]);

  // Synchronizing values and schemas
  useEffect(() => {
    const _schema = convert(value);
    setSchema(_schema);
  }, [value]);

  return (
    <Modal
      visible={visible}
      title={
        readonly
          ? I18n.t('variables_json_input_readonly_title')
          : I18n.t('workflow_json_windows_title')
      }
      okText={I18n.t('Confirm')}
      cancelText={I18n.t('Cancel')}
      onOk={change}
      onCancel={onCancel}
      height={530}
      okButtonProps={{
        disabled: !isValid || readonly,
      }}
    >
      <div key={id} className="w-full relative">
        <div className="w-full h-[48px] coz-bg-primary rounded-t-lg coz-fg-primary font-medium text-sm flex items-center justify-between px-4">
          <div className="coz-fg-primary">JSON</div>
          <Tooltip content={I18n.t('workflow_exception_ignore_format')}>
            <IconButton
              className="bg-transparent"
              disabled={readonly}
              icon={<IconCozBroom />}
              onClick={() => {
                setValue(formatJson(value));
              }}
            />
          </Tooltip>
        </div>
        <div className="w-full h-[320px]">
          <BizIDEMonacoEditor
            key={id}
            value={value}
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
              readOnly: readonly,
            }}
            onChange={stringValue => {
              setValue(stringValue || '');
            }}
          />
        </div>
        {error ? (
          <div className="absolute top-full">
            <span className="coz-fg-hglt-red text-[12px] font-[400] leading-[16px] whitespace-nowrap">
              {error}
            </span>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};
