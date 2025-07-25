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
  // 专业版有项目维度区分class，modal_class 与 modal_class_name存在一对多的情况，因此统一以model_class_name做分组
  // 以 modal_class_name 首次出现的顺序进行排序
  const modelClassSortList = getModelClassSortList(
    modelList.map(i => i.model_class_name ?? ''),
  );

  const modelClassGroup = groupBy(modelList, model => model.model_class_name);
  const showEndPointName = modelList.some(model => model.endpoint_name);

  // 搜索规则: 模型名称/接入点名称包含关键词(不区分大小写)
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
      // 修改key原因：详见https://semi.design/zh-CN/input/select - 分组模块
      // 1. 分组能力只能使用jsx
      // 2. 若Select的children需要动态更新，OptGroup上的key也需要进行更新，否则Select无法识别
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
