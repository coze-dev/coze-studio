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
 
import { type ViewVariableType } from '@coze-workflow/base';

import { Outputs } from '@/nodes-v2/components/outputs';
import { withField, useField, useWatch } from '@/form';

export interface OutputsProps {
  id?: string;
  name: string;
  settingOnErrorPath?: string;
  topLevelReadonly?: boolean;
  disabledTypes?: ViewVariableType[];
  title?: string;
  tooltip?: React.ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
  customReadonly?: boolean;
  hiddenTypes?: ViewVariableType[];
  noCard?: boolean;
  jsonImport?: boolean;
  allowAppendRootData?: boolean;
  withDescription?: boolean;
  withRequired?: boolean;
  addItemTitle?: string;
  allowDeleteLast?: boolean;
  emptyPlaceholder?: string;
  defaultCollapse?: boolean;
  batchMode?: string;
  needAppendChildWhenNodeIsPreset?: boolean;
  /**
   * 是否可以配置默认值
   */
  withDefaultValue?: boolean;
  /**
   * 默认展开的参数名
   */
  defaultExpandParams?: string[];
  /**
   * 列宽比 如 6:4 代表名称占6份，类型占4份
   */
  columnsRatio?: string;
  maxLimit?: number;
}

export const OutputsField = withField<OutputsProps>(
  ({
    id = 'outputs',
    topLevelReadonly = false,
    settingOnErrorPath = 'settingOnError.settingOnErrorIsOpen',
    disabledTypes = [],
    hiddenTypes,
    title,
    tooltip,
    disabled,
    customReadonly = false,
    noCard,
    jsonImport,
    allowAppendRootData,
    withDescription = true,
    withRequired,
    batchMode,
    ...props
  }: OutputsProps) => {
    const { value, onChange, readonly, onBlur, errors } = useField();
    const settingOnErrorIsOpen = useWatch(settingOnErrorPath);

    return (
      <Outputs
        id={id}
        value={value}
        onChange={v => {
          onChange?.(v);
          // 保证 blur 时触发校验, 直接传 onBlur 不生效
          onBlur?.();
        }}
        title={title}
        titleTooltip={tooltip}
        topLevelReadonly={topLevelReadonly}
        disabledTypes={disabledTypes}
        hiddenTypes={hiddenTypes}
        readonly={readonly || customReadonly}
        disabled={disabled}
        needErrorBody={settingOnErrorIsOpen}
        noCard={noCard}
        batchMode={batchMode}
        jsonImport={jsonImport}
        allowAppendRootData={allowAppendRootData}
        withDescription={withDescription}
        withRequired={withRequired}
        errors={errors}
        {...props}
      />
    );
  },
);
