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

import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Select, Search, Cascader, Space } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

import { highlightFilterStyle } from '@/constants/filter-style';

import { getScopeOptions, getStatusOptions } from '../consts';
import { type BaseLibraryPageProps } from '../types';

import s from '../index.module.less';

interface LibraryFiltersParams {
  res_type_filter?: number[];
  user_filter?: number;
  publish_status_filter?: number;
  name?: string;
}

interface LibraryFiltersProps {
  spaceId: string;
  isPersonalSpace: boolean;
  entityConfigs: BaseLibraryPageProps['entityConfigs'];
  params: LibraryFiltersParams;
  setParams: (updater: (prev: LibraryFiltersParams) => LibraryFiltersParams) => void;
}

export const LibraryFilters: React.FC<LibraryFiltersProps> = ({
  spaceId,
  isPersonalSpace,
  entityConfigs,
  params,
  setParams,
}) => {
  const typeFilterData = [
    { label: I18n.t('library_filter_tags_all_types'), value: -1 },
    ...entityConfigs.map(item => item.typeFilter).filter(filter => !!filter),
  ];
  const scopeOptions = getScopeOptions();
  const statusOptions = getStatusOptions();

  return (
    <div className="flex items-center justify-between">
      <Space>
        <Cascader
          data-testid="workspace.library.filter.type"
          className={s.cascader}
          style={
            params?.res_type_filter?.[0] !== -1
              ? highlightFilterStyle
              : {}
          }
          dropdownClassName="[&_.semi-cascader-option-lists]:h-fit"
          showClear={false}
          value={params.res_type_filter}
          treeData={typeFilterData}
          onChange={v => {
            const typeFilter = typeFilterData.find(
              item =>
                item.value === ((v as Array<number>)?.[0] as number),
            );
            sendTeaEvent(EVENT_NAMES.workspace_action_front, {
              space_id: spaceId,
              space_type: isPersonalSpace ? 'personal' : 'teamspace',
              tab_name: 'library',
              action: 'filter',
              filter_type: 'types',
              filter_name: typeFilter?.filterName ?? typeFilter?.label,
            });

            setParams(prev => ({
              ...prev,
              res_type_filter: v as Array<number>,
            }));
          }}
        />
        {!isPersonalSpace ? (
          <Select
            data-testid="workspace.library.filter.user"
            className={classNames(s.select)}
            style={
              params?.user_filter !== 0 ? highlightFilterStyle : {}
            }
            showClear={false}
            value={params.user_filter}
            optionList={scopeOptions}
            onChange={v => {
              sendTeaEvent(EVENT_NAMES.workspace_action_front, {
                space_id: spaceId,
                space_type: isPersonalSpace ? 'personal' : 'teamspace',
                tab_name: 'library',
                action: 'filter',
                filter_type: 'creators',
                filter_name: scopeOptions.find(
                  item =>
                    item.value ===
                    ((v as Array<number>)?.[0] as number),
                )?.label,
              });
              setParams(prev => ({
                ...prev,
                user_filter: v as number,
              }));
            }}
          />
        ) : null}
        <Select
          data-testid="workspace.library.filter.status"
          className={s.select}
          style={
            params?.publish_status_filter !== 0
              ? highlightFilterStyle
              : {}
          }
          showClear={false}
          value={params.publish_status_filter}
          optionList={statusOptions}
          onChange={v => {
            sendTeaEvent(EVENT_NAMES.workspace_action_front, {
              space_id: spaceId,
              space_type: isPersonalSpace ? 'personal' : 'teamspace',
              tab_name: 'library',
              action: 'filter',
              filter_type: 'status',
              filter_name: statusOptions.find(
                item =>
                  item.value ===
                  ((v as Array<number>)?.[0] as number),
              )?.label,
            });
            setParams(prev => ({
              ...prev,
              publish_status_filter: v as number,
            }));
          }}
        />
      </Space>
      <Search
        data-testid="workspace.library.search"
        className={s.search}
        style={params?.name ? highlightFilterStyle : {}}
        showClear
        value={params.name}
        placeholder={I18n.t('workspace_library_search')}
        onChange={v => {
          setParams(prev => ({
            ...prev,
            name: v,
          }));
        }}
      />
    </div>
  );
};