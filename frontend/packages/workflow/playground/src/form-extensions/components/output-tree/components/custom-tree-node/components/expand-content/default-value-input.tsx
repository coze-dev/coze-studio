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

import React, { type FC, useMemo, useRef } from 'react';

import { ViewVariableType, CONVERSATION_NAME } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  Input as InputCore,
  CozInputNumber,
  Select,
} from '@coze-arch/coze-design';

import { getAccept } from '@/hooks/use-upload';
import { useGlobalState } from '@/hooks/use-global-state';
import { genFileTypeByViewVarType } from '@/components/test-run/utils/common';
import { JsonEditorAdapter } from '@/components/test-run/test-form-materials/json-editor';
import { FileAdapter } from '@/components/test-run/test-form-materials/file';

import { ConversationSelect as ConversationSelectCore } from '../conversation-select';
import { type TreeNodeCustomData, type DefaultValueType } from '../../type';
import {
  type DefaultValueInputComponent,
  type DefaultValueInputProps,
} from './types';
import { InputTime } from './input-time';

import styles from './index.module.less';

const Input: DefaultValueInputComponent = ({
  data,
  onChange,
  defaultValue,
  onBlur,
  ...props
}) => (
  <InputCore
    defaultValue={defaultValue as string}
    onChange={onChange}
    size="small"
    placeholder={I18n.t('wf_chatflow_99')}
    onBlur={e => {
      onBlur?.(e.target.value);
    }}
    {...props}
  />
);

const InputNumber: DefaultValueInputComponent = ({
  data,
  onChange,
  onBlur,
  defaultValue,
  ...props
}) => (
  <CozInputNumber
    defaultValue={defaultValue as number}
    onChange={onChange}
    size="small"
    placeholder={I18n.t('wf_chatflow_99')}
    onBlur={e => {
      onBlur?.(e.target.value);
    }}
    {...props}
  />
);

const InputInteger: DefaultValueInputComponent = ({
  data,
  onChange,
  onBlur,
  defaultValue,
  ...props
}) => (
  <CozInputNumber
    defaultValue={defaultValue as number}
    onChange={onChange}
    precision={0.1}
    size="small"
    placeholder={I18n.t('wf_chatflow_99')}
    onBlur={e => {
      // Get the rounded value
      setTimeout(() => {
        onBlur?.(e.target.value);
      }, 15);
    }}
    {...props}
  />
);

const BooleanSelect: DefaultValueInputComponent = ({
  data,
  onChange,
  defaultValue,
  onBlur,
  ...props
}) => {
  const valueRef = useRef(defaultValue as boolean | undefined | null);
  const handleChange = val => {
    if (val) {
      const parsed = JSON.parse(val || 'false') as boolean;
      onChange(parsed);
      valueRef.current = parsed;
    } else {
      onChange(null);
      valueRef.current = null;
    }
  };
  return (
    <Select
      placeholder={I18n.t('wf_chatflow_99')}
      size="small"
      optionList={[
        {
          label: 'true',
          value: 'true',
        },
        {
          label: 'false',
          value: 'false',
        },
      ]}
      showClear
      defaultValue={
        defaultValue !== undefined
          ? JSON.stringify(Boolean(defaultValue))
          : undefined
      }
      onChange={handleChange}
      onBlur={() => onBlur?.(valueRef.current)}
      {...props}
    />
  );
};

const JSONEditor: DefaultValueInputComponent = ({
  data,
  onChange,
  onBlur,
  defaultValue,
  ...props
}) => {
  const valueRef = useRef(defaultValue as string | undefined);
  return (
    <JsonEditorAdapter
      value={defaultValue as string}
      onChange={v => {
        valueRef.current = v;
        onChange(v || null);
      }}
      onBlur={() => {
        onBlur?.(valueRef.current);
      }}
      {...props}
    />
  );
};
const File: DefaultValueInputComponent = ({
  defaultValue,
  data: { type },
  onChange,
  onBlur,
  inputType,
  onInputTypeChange,
  ...props
}) => {
  const valueRef = useRef(defaultValue as DefaultValueType | null);
  const handleChange = (val?: string) => {
    onChange(val || null);
    valueRef.current = val || null;
    onBlur?.(valueRef.current);
  };
  const accept = getAccept(type);
  const multiple = ViewVariableType.isArrayType(type);
  return (
    <FileAdapter
      value={defaultValue as string}
      onChange={handleChange}
      accept={accept}
      multiple={multiple}
      fileType={genFileTypeByViewVarType(type)}
      containerClassName={styles['expand-content-file-adapter']}
      onBlur={() => {
        onBlur?.(valueRef.current);
      }}
      fileInputType={inputType}
      onInputTypeChange={onInputTypeChange}
      inputTypeSelectClassName={styles['file-type-select']}
      inputURLClassName={styles['url-input']}
      enableInputURL={true}
      {...props}
    />
  );
};

const ConversationSelect: DefaultValueInputComponent = ({
  defaultValue,
  onChange,
  disabled,
  className,
  onBlur,
}) => {
  const valueRef = useRef(defaultValue as string | undefined | null);
  const handleChange = val => {
    onChange(val || null);
    valueRef.current = val || null;
  };
  const { projectId } = useGlobalState();
  return (
    <ConversationSelectCore
      className={className}
      size="small"
      disabled={disabled || !projectId}
      defaultValue={defaultValue as string}
      enableTypes={['static']}
      onChange={handleChange}
      onBlur={() => {
        onBlur?.(valueRef.current);
      }}
    />
  );
};

const getInputComponent = (
  data: TreeNodeCustomData,
): DefaultValueInputComponent => {
  if (
    data.name === CONVERSATION_NAME &&
    data.type === ViewVariableType.String &&
    data.isPreset
  ) {
    return ConversationSelect;
  }
  switch (data.type) {
    case ViewVariableType.String:
      return Input;
    case ViewVariableType.Number:
      return InputNumber;
    case ViewVariableType.Integer:
      return InputInteger;
    case ViewVariableType.Boolean:
      return BooleanSelect;
    case ViewVariableType.Time:
      return InputTime;
    default:
      break;
  }
  if (ViewVariableType.isFileType(data.type)) {
    return File;
  } else {
    // Object/Array < String > Array < Object > and other types
    return JSONEditor;
  }
};
export const DefaultValueInput: FC<DefaultValueInputProps> = ({
  data,
  ...props
}) => {
  const InputComponent = useMemo(() => getInputComponent(data), [data.type]);
  return (
    <InputComponent defaultValue={data.defaultValue} data={data} {...props} />
  );
};
