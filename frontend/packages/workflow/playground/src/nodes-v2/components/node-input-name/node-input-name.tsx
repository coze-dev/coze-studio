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

import React, { useCallback, useEffect, useState } from 'react';

import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowVariableFacadeService } from '@coze-workflow/variable';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, Input, Typography } from '@coze-arch/coze-design';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import {
  getVariableName,
  getUniqueName,
} from '@/form-extensions/setters/node-input-name/utils';

import type { NodeInputNameProps } from './type';

// eslint-disable-next-line complexity
export const NodeInputName = ({
  value,
  onChange,
  onBlur,
  name,
  style,
  input,
  inputParameters,
  initValidate = false,
  isPureText = false,
  prefix = '',
  suffix = '',
  format,
  tooltip,
  isError,
  inputPrefix,
  disabled,
}: NodeInputNameProps) => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [userEdited, setUserEdited] = useState<boolean>(false);
  const [variableName, setVariableName] = useState<string | undefined>(value);
  const [text, setText] = useState<string | undefined>(value);
  const readonly = useReadonly();

  const node = useCurrentEntity();
  const variableService = useService(WorkflowVariableFacadeService);
  const { getNodeSetterId } = useNodeTestId();

  // The text state is controlled (the value of the linked text when deleting a node)
  useEffect(() => {
    if (value !== text) {
      setText(value);
    }
  }, [value]);

  const computedVariableName = getVariableName({
    input,
    prefix,
    suffix,
    format,
    node,
    variableService,
  });

  const onInputChange = useCallback((newInputValue: string): void => {
    setUserEdited(true);
    setText(newInputValue || '');
    setVariableName(undefined);
  }, []);

  const handleOnBlur = () => {
    onChange(text || '');
    onBlur?.();
  };

  useEffect(() => {
    if (initValidate) {
      // Initialize write value to trigger verification
      onChange(value);
      onBlur?.();
    }
    if (value) {
      setUserEdited(true);
    }
    setInitialized(true);
  }, [initValidate, onChange, value]);

  if (initialized && !readonly && !userEdited) {
    if (computedVariableName && computedVariableName !== variableName) {
      const computedUniqueName = getUniqueName({
        variableName: computedVariableName,
        inputParameters,
      });
      onChange(computedUniqueName);
      setVariableName(computedVariableName);
      setText(computedUniqueName);
    } else if (!computedVariableName && variableName) {
      setVariableName(undefined);
      setText(undefined);
    }
  }

  return (
    <div
      className="flex items-center"
      style={{
        ...style,
        pointerEvents: readonly ? 'none' : 'auto',
      }}
    >
      {isPureText ? (
        <>
          <Typography.Text className="h-8 leading-8">{value}</Typography.Text>
          {tooltip ? (
            <Tooltip content={tooltip}>
              <IconCozInfoCircle
                className="ml-1"
                style={{
                  fontSize: 12,
                }}
              />
            </Tooltip>
          ) : null}
        </>
      ) : (
        <>
          <Input
            size={'small'}
            data-testid={getNodeSetterId(name)}
            value={text}
            onChange={onInputChange}
            onBlur={handleOnBlur}
            validateStatus={isError ? 'error' : undefined}
            placeholder={I18n.t('workflow_detail_node_input_entername')}
            prefix={inputPrefix}
            disabled={disabled}
          />
          {tooltip ? (
            <Tooltip content={tooltip}>
              <IconCozInfoCircle
                className="ml-1"
                style={{
                  fontSize: 12,
                }}
              />
            </Tooltip>
          ) : null}
        </>
      )}
    </div>
  );
};
