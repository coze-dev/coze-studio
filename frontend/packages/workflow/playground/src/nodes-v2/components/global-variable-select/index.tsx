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

import React, {
  type CSSProperties,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';

import { get } from 'lodash-es';
import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  type RefExpression,
  WorkflowVariableService,
  useGlobalVariableServiceState,
  isGlobalVariableKey,
} from '@coze-workflow/variable';
import {
  type ViewVariableType,
  ValueExpressionType,
  VARIABLE_TYPE_ALIAS_MAP,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type Select as SemiSelect } from '@coze-arch/bot-semi';
import {
  IconCozCross,
  IconCozEmpty,
  IconCozWarningCircle,
} from '@coze-arch/coze-design/icons';
import { Select, Tag, Typography } from '@coze-arch/coze-design';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { useGlobalState } from '@/hooks';
import { type VariableMetaWithNode } from '@/form-extensions/typings';
import { useNodeAvailableVariablesWithNode } from '@/form-extensions/hooks';
import { BotProjectVariableSelect } from '@/components/test-run/bot-project-variable-select';
import { VARIABLE_TYPE_ICON_MAP } from '@/components/node-render/node-render-new/fields/constants';

import s from './index.module.less';

const { Text } = Typography;

interface Props {
  value?: RefExpression;
  onChange?: (value?: RefExpression) => void;
  disabled?: boolean;
  readonly?: boolean;
  style?: CSSProperties;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  disabledTypes?: ViewVariableType[];
  isError?: boolean;
  variablesFilter?: (
    variables: VariableMetaWithNode[],
  ) => VariableMetaWithNode[];
  useMatchType?: boolean;
  matchType?: ViewVariableType;
}

type ValueType = string[];

const encodeValue = (data?: ValueType) =>
  data ? JSON.stringify(data) : undefined;

const decodeValue = (data: string) =>
  data ? (JSON.parse(data) as ValueType) : undefined;

const getIconByType = (type?: ViewVariableType) =>
  type ? (
    VARIABLE_TYPE_ICON_MAP[type] || <IconCozWarningCircle />
  ) : (
    <IconCozWarningCircle />
  );

export const GlobalVariableSelect = (props: Props) => {
  const {
    value,
    onChange,
    onBlur,
    readonly: setterReadonly,
    placeholder = I18n.t('variable_assignment_node_select_placeholder'),
    disabledTypes,
    isError,
    variablesFilter = data => data,
    matchType,
    useMatchType,
  } = props;

  const selectRef = useRef<SemiSelect | null>(null);

  const globalReadonly = useReadonly();
  const readonly = globalReadonly || setterReadonly;

  const { projectId } = useGlobalState();
  const { type } = useGlobalVariableServiceState();

  const isProject = Boolean(projectId);
  const isSelectedBotOrProject = !isProject && Boolean(type);

  const useNewGlobalVariableCache = !isProject;

  const availableVariables = useNodeAvailableVariablesWithNode();

  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );

  const keyPath = get(value, 'content.keyPath') as string[] | undefined;

  // Monitor changes in linkage variables to re-trigger the effect
  useEffect(() => {
    const hasDisabledTypes =
      Array.isArray(disabledTypes) && disabledTypes.length > 0;

    if (!keyPath || !hasDisabledTypes) {
      return;
    }

    const listener = variableService.onListenVariableTypeChange(
      keyPath,
      v => {
        // If the variable type changes and is located in disabledTypes, it needs to be cleared
        if (v && (disabledTypes || []).includes(v.type)) {
          onChange?.({
            type: ValueExpressionType.REF,
          });
        }
      },
      {},
    );

    return () => {
      listener?.dispose();
    };
  }, [keyPath, variableService, onChange, disabledTypes]);

  const optionList = useMemo(
    () =>
      variablesFilter(
        availableVariables.filter(
          item => item.nodeId && isGlobalVariableKey(item.nodeId),
        ),
      ).map(item => ({
        value: encodeValue([item.nodeId as string, item.key]),
        disabled: useMatchType && matchType && matchType !== item.type,
        ...item,
      })),
    [availableVariables, variablesFilter, matchType, useMatchType],
  );

  const handleChange = useCallback(
    (v): void => {
      const data = v ? decodeValue(v) : undefined;

      if (data === undefined) {
        onChange?.(undefined);
      } else {
        onChange?.({
          type: ValueExpressionType.REF,
          content: { keyPath: data },
        });
      }
    },
    [onChange],
  );

  const emptyContent = useMemo(() => {
    const getEmptyMsg = () => {
      if (isProject) {
        return I18n.t('variable_select_empty_appide_tips');
      }

      if (isSelectedBotOrProject) {
        return I18n.t('variable_select_empty_library_tips_02');
      }

      return I18n.t('variable_select_empty_library_tips');
    };

    return (
      <div className={s['empty-block']}>
        <IconCozEmpty
          style={{ fontSize: '32px', color: 'rgba(52, 60, 87, 0.72)' }}
        />
        <span className={s.text}>{getEmptyMsg()}</span>
      </div>
    );
  }, [isProject, isSelectedBotOrProject]);

  const handleVariableSelect = useCallback(
    (v?: string) => {
      handleChange(v);
      selectRef.current?.close();
    },
    [handleChange],
  );

  return (
    <Select
      ref={selectRef}
      hasError={isError}
      dropdownStyle={{
        width: useNewGlobalVariableCache ? '326px' : '228px',
      }}
      showClear
      size={'small'}
      disabled={readonly}
      clearIcon={<IconCozCross style={{ fontSize: '12px' }} />}
      emptyContent={useNewGlobalVariableCache ? null : emptyContent}
      value={encodeValue(value?.content?.keyPath)}
      onChange={handleChange}
      onBlur={onBlur}
      style={{
        width: '100%',
      }}
      placeholder={placeholder}
      renderSelectedItem={item => {
        const selectedItem = optionList.find(op => op.value === item.value);

        return (
          <div className={'flex items-center'}>
            <span
              className={'flex items-center mr-4px'}
              style={{
                fontSize: '14px',
                color: selectedItem?.name
                  ? 'rgba(var(--coze-fg-1),var(--coze-fg-1-alpha))'
                  : 'rgba(var(--coze-yellow-5), 1)',
              }}
            >
              {getIconByType(selectedItem?.type)}
            </span>
            <span
              style={{
                color: selectedItem?.name
                  ? 'rgba(var(--coze-fg-3),var(--coze-fg-3-alpha))'
                  : 'rgba(var(--coze-yellow-5), 1)',
              }}
            >
              {selectedItem?.name || I18n.t('workflow_variable_undefined')}
            </span>
          </div>
        );
      }}
      outerBottomSlot={
        useNewGlobalVariableCache ? (
          <BotProjectVariableSelect
            onVariableSelect={handleVariableSelect}
            variableValue={encodeValue(value?.content?.keyPath)}
            variablesFormatter={arr =>
              variablesFilter(
                arr.map(item => ({
                  value: encodeValue([item.nodeId as string, item.key]),
                  disabled:
                    useMatchType && matchType && matchType !== item.type,
                  ...item,
                })),
              )
            }
          />
        ) : undefined
      }
    >
      {useNewGlobalVariableCache
        ? null
        : optionList.map(option => (
            <Select.Option
              // Disabled Change Option will not be re-rendered. Please set the key to be compatible first.
              key={`${option.value}-${option.disabled}`}
              value={option.value}
              className={s['global-var-option']}
              disabled={option.disabled}
            >
              <div
                className={
                  'flex w-full items-center justify-between pl-8px pr-8px'
                }
              >
                <Text
                  disabled={option.disabled}
                  ellipsis={{ showTooltip: true }}
                  style={{ flex: 1 }}
                >
                  {option.name}
                </Text>
                <Tag
                  disabled={option.disabled}
                  className={s.tag}
                  size={'small'}
                >
                  {VARIABLE_TYPE_ALIAS_MAP[option.type]}
                </Tag>
              </div>
            </Select.Option>
          ))}
    </Select>
  );
};
