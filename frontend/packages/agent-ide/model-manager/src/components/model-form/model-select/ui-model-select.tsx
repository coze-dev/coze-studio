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

import { groupBy } from 'lodash-es';
import classNames from 'classnames';
import { ModelOptionItem } from '@coze-studio/components';
import { Select } from '@coze-arch/coze-design';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import { type ModelTag, type Model } from '@coze-arch/bot-api/developer_api';

import { getModelClassSortList } from '../../../utils/model/get-model-class-sort-list';

import styles from './index.module.less';

export interface UIModelSelectProps {
  className?: string;
  style?: CSSProperties;
  value: string | undefined;
  onChange?: (value: string) => void;
  modelList: Model[];
  disabled?: boolean;
}

export const UIModelSelect: React.FC<UIModelSelectProps> = ({
  className,
  style,
  value,
  onChange,
  modelList = [],
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  // The professional version has project dimensions to distinguish classes, modal_class and modal_class_name have one-to-many situations, so they are grouped by model_class_name
  // Sort by modal_class_name first appearance
  const modelClassSortList = getModelClassSortList(
    modelList.map(i => i.model_class_name ?? ''),
  );

  const modelClassGroup = groupBy(modelList, model => model.model_class_name);
  const showEndPointName = modelList.some(model => model.endpoint_name);

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
      endPointName={model?.endpoint_name}
      showEndPointName={showEndPointName}
      tags={model.model_tag_list
        ?.filter(
          (item): item is ModelTag & Required<Pick<ModelTag, 'tag_name'>> =>
            !!item.tag_name,
        )
        .map(item => ({
          label: item.tag_name,
          color: 'yellow',
        }))}
    />
  );

  const optionsList = modelClassSortList
    .map(stringClassId => {
      const groupMemberList = modelClassGroup[stringClassId];
      return {
        label: groupMemberList?.at(0)?.model_class_name,
        children: groupMemberList
          ?.filter(model => filterOption(model))
          ?.map(model => ({
            label: getModelOptionLabel(model),
            value: model.model_type?.toString(),
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

  if (modelList.length === 1) {
    const targetModel = modelList.at(0);
    return targetModel ? getModelOptionLabel(targetModel) : null;
  }

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
      disabled={disabled}
      className={classNames(styles.select, className)}
      style={style}
      value={value}
      dropdownClassName="max-w-[432px]"
      onChange={changedValue => {
        if (typeof changedValue === 'string') {
          onChange?.(changedValue);
        }
      }}
      onSearch={v => setInputValue(v)}
      filter
      renderSelectedItem={renderSelectedItem}
    >
      {optionsList}
    </Select>
  );
};
