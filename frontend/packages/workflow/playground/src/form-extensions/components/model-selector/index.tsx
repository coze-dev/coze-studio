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

import React, { useState, type CSSProperties } from 'react';

import { groupBy, uniq } from 'lodash-es';
import classNames from 'classnames';
import { ModelOptionItem } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import { type Model } from '@coze-arch/bot-api/developer_api';

import styles from './index.module.less';

export interface ModelSelectProps {
  className?: string;
  style?: CSSProperties;
  value: number | undefined;
  onChange: (value: number) => void;
  models: Model[];
  readonly?: boolean;
}

export const ModelSelector: React.FC<ModelSelectProps> = ({
  className,
  style,
  value,
  onChange,
  models,
  readonly,
}) => {
  // The professional version has project dimensions to distinguish classes, modal_class and modal_class_name have one-to-many situations, so they are grouped by model_class_name
  // Sort by modal_class_name first appearance
  const modelClassSortList = uniq(models.map(i => i.model_class_name ?? ''));

  const modelClassGroup = groupBy(models, model => model.model_class_name);

  const [inputValue, setInputValue] = useState('');

  const someHasEndPointName = models.some(model => model?.endpoint_name);

  // Search rule: Model name/access point name contains keywords (case insensitive)
  const filterOption = (model: Model) => {
    const sugInput = inputValue.toUpperCase();
    return (
      model.name?.toUpperCase()?.includes(sugInput) ||
      model?.endpoint_name?.toUpperCase()?.includes(sugInput)
    );
  };

  const getModelOptionLabel = (model: Model) => (
    <ModelOptionItem
      key={model.model_type}
      tokenLimit={model.model_quota?.token_limit}
      avatar={model.model_icon}
      name={model.name}
      descriptionGroupList={model.model_desc}
      searchWords={[inputValue]}
      endPointName={model.endpoint_name}
      showEndPointName={someHasEndPointName}
    />
  );
  const optionsList = modelClassSortList
    .map(stringClassId => {
      const groupMemberList = modelClassGroup[stringClassId as string];
      return {
        label: groupMemberList?.at(0)?.model_class_name,
        children: groupMemberList
          ?.filter(model => filterOption(model))
          ?.map(model => ({
            label: getModelOptionLabel(model),
            value: model.model_type,
          })),
      };
    })
    .map(group => (
      // Reason for modifying key: See https://semi.design/zh-CN/input/select - Grouping Module for details
      // 1. The grouping ability can only be used with jsx.
      // 2. If the selected children need to be dynamically updated, the key on the OptGroup also needs to be updated, otherwise Select cannot be recognized
      <Select.OptGroup key={`${inputValue}-${group.label}`} label={group.label}>
        {group.children?.map(option => (
          <Select.Option value={option.value} key={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select.OptGroup>
    ));
  const renderSelectedItem = (optionNode: OptionProps) =>
    React.isValidElement(optionNode?.children) ? (
      <ModelOptionItem
        {...optionNode?.children?.props}
        showEndPointName={false}
      />
    ) : null;
  return (
    <Select
      clickToHide
      disabled={readonly}
      className={classNames('w-full', styles.select, className)}
      style={style}
      value={value}
      dropdownClassName={'w-[625px]'}
      emptyContent={I18n.t('workflow_detail_node_nodata')}
      onChange={changedValue => {
        onChange(changedValue as number);
      }}
      onSearch={v => setInputValue(v)}
      filter
      renderSelectedItem={renderSelectedItem}
    >
      {optionsList}
    </Select>
  );
};
