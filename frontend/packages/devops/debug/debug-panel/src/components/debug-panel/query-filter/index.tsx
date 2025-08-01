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

import { useState, type PropsWithChildren, useRef } from 'react';

import { debounce } from 'lodash-es';
import classnames from 'classnames';
import {
  type CSpanSingle,
  type CSpan,
} from '@coze-devops/common-modules/query-trace';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import {
  Button,
  Dropdown,
  InputGroup,
  Select,
  Tag,
  Tooltip,
  UIButton,
} from '@coze-arch/bot-semi';
import { IconCalendar, IconFilter, IconSearch } from '@coze-arch/bot-icons';
import { type SpanStatus } from '@coze-arch/bot-api/debugger_api';

import { getPastWeekDates, getTimeInCurrentTimeZone } from '../../../utils';
import {
  type TargetOverallSpanInfo,
  type QueryFilterItem,
  type QueryFilterItemId,
} from '../../../typings';
import { EXECUTE_STATUS_FILTERING_OPTIONS } from '../../../consts/static';
import { SPAN_STATUS_CONFIG_MAP } from '../../../consts/span';
import {
  FILTERING_OPTION_ALL,
  QUERY_FILTER_DEBOUNCE_TIME,
} from '../../../consts';

import s from './index.module.less';
export interface QueryFilterProps {
  targetDateId?: QueryFilterItemId;
  targetExecuteStatusId?: QueryFilterItemId;
  targetOverallSpanInfo?: TargetOverallSpanInfo;
  enhancedOverallSpans: CSpan[];
  showLoadMore: boolean;
  onSelectDate: (dateId: QueryFilterItemId) => void;
  onSelectExecuteStatus: (executeStatusId: QueryFilterItemId) => void;
  onFetchQuery: (inputSearch?: string, loadMore?: boolean) => Promise<CSpan[]>;
  onSelectQuery: (overallSpanInfo: TargetOverallSpanInfo) => void;
}

export interface FilterDropdownProps {
  dropdownMenuItem: QueryFilterItem[];
  activeId?: QueryFilterItemId;
  onSelectActiveId?: (id: QueryFilterItemId) => void;
}

const FilterDropdown = (props: PropsWithChildren<FilterDropdownProps>) => {
  const { children, activeId, dropdownMenuItem, onSelectActiveId } = props;
  return (
    <Dropdown
      clickToHide
      position="bottomLeft"
      showTick
      contentClassName={s['dropdown-content']}
      render={
        <Dropdown.Menu>
          {dropdownMenuItem.map(item => {
            const { id, name } = item;
            return (
              <Dropdown.Item
                key={id}
                onClick={() => onSelectActiveId?.(id)}
                active={activeId === id}
              >
                {name}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      }
    >
      {children}
    </Dropdown>
  );
};

// eslint-disable-next-line @coze-arch/max-line-per-function
export const QueryFilter = (props: QueryFilterProps) => {
  const {
    targetDateId,
    targetExecuteStatusId,
    targetOverallSpanInfo,
    enhancedOverallSpans,
    showLoadMore,
    onSelectDate,
    onSelectExecuteStatus,
    onFetchQuery,
    onSelectQuery,
  } = props;

  const [loading, setLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);

  const currentInputSearchRef = useRef<string | undefined>(undefined);

  const checkSelectAll = (targetId?: QueryFilterItemId) =>
    targetId === FILTERING_OPTION_ALL;

  const onFetchQueryWithLoading: (
    inputSearch?: string,
    loadMore?: boolean,
  ) => Promise<void> = async (inputSearch, loadMore) => {
    const setLoadingFn = loadMore ? setLoadMoreLoading : setLoading;
    try {
      setLoadingFn(true);
      await onFetchQuery(inputSearch, loadMore);
    } finally {
      setLoadingFn(false);
    }
  };

  const renderSelectedItem: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: Record<string, any>,
  ) => React.ReactNode = node => {
    const { value, input, span } = node;
    return value ? (
      <Tooltip content={input} className={s['custom-tooltip']}>
        <Tag
          className={classnames(
            s['query-filter-select-tag'],
            s[SPAN_STATUS_CONFIG_MAP[span.status as SpanStatus].className],
          )}
        >
          {input}
        </Tag>
      </Tooltip>
    ) : null;
  };

  const renderInnerBottomSlot = () => (
    <Button
      theme="borderless"
      type="primary"
      loading={loadMoreLoading}
      className="w-full"
      onClick={() =>
        onFetchQueryWithLoading(currentInputSearchRef.current, true)
      }
    >
      {I18n.t('query_list_loadmore')}
    </Button>
  );

  return (
    <InputGroup className={s['query-filter']}>
      <div className={s['query-filter-options']}>
        <FilterDropdown
          activeId={targetDateId}
          onSelectActiveId={onSelectDate}
          dropdownMenuItem={[FILTERING_OPTION_ALL, ...getPastWeekDates()].map(
            item => {
              const queryFilterItem: QueryFilterItem = {
                id: item,
                name:
                  item === FILTERING_OPTION_ALL
                    ? I18n.t('query_status_all')
                    : item,
              };
              return queryFilterItem;
            },
          )}
        >
          <UIButton
            theme="borderless"
            icon={<IconCalendar />}
            size="small"
            className={classnames(
              !checkSelectAll(targetDateId) &&
                s['query-filter-options-button_active'],
            )}
          />
        </FilterDropdown>
        <FilterDropdown
          activeId={targetExecuteStatusId}
          onSelectActiveId={onSelectExecuteStatus}
          dropdownMenuItem={EXECUTE_STATUS_FILTERING_OPTIONS.map(item => ({
            id: item.id,
            name: I18n.t(item.name as I18nKeysNoOptionsType),
          }))}
        >
          <UIButton
            theme="borderless"
            icon={<IconFilter />}
            size="small"
            className={classnames(
              !checkSelectAll(targetExecuteStatusId) &&
                s['query-filter-options-button_active'],
            )}
          />
        </FilterDropdown>
      </div>

      <Select
        value={targetOverallSpanInfo}
        prefix={<IconSearch className={s['query-filter-select-search-icon']} />}
        filter
        remote
        loading={loading}
        className={s['query-filter-select']}
        dropdownClassName={s['query-filter-select-dropdown']}
        onChangeWithObject
        onSearch={debounce((value: string) => {
          const input = value === '' ? undefined : value;
          currentInputSearchRef.current = input;
          onFetchQueryWithLoading(input);
        }, QUERY_FILTER_DEBOUNCE_TIME)}
        onDropdownVisibleChange={visible => {
          if (visible) {
            onFetchQueryWithLoading();
          }
        }}
        onChange={value => {
          onSelectQuery(value as TargetOverallSpanInfo);
        }}
        renderSelectedItem={renderSelectedItem}
        innerBottomSlot={showLoadMore ? renderInnerBottomSlot() : null}
      >
        {enhancedOverallSpans.map(item => {
          const { status, extra } = item as CSpanSingle;
          const { dateString } = getTimeInCurrentTimeZone(item.start_time);
          return (
            <Select.Option
              value={extra?.log_id}
              key={extra?.log_id}
              input={extra?.input}
              span={item}
            >
              <div className={s['query-filter-select-dropdown-option']}>
                <div className={s['query-filter-select-dropdown-option-icon']}>
                  {SPAN_STATUS_CONFIG_MAP[status].icon}
                </div>
                <Tooltip
                  content={extra?.input}
                  className={s['custom-tooltip']}
                  position="left"
                >
                  <div
                    className={s['query-filter-select-dropdown-option-text']}
                  >
                    {extra?.input}
                  </div>
                </Tooltip>
                <div className="ml-2 font-normal">
                  {/* <span
                    className={s['query-filter-select-dropdown-option-time']}
                  >
                    {timeOffsetString}
                  </span>{' '} */}
                  {dateString}
                </div>
              </div>
            </Select.Option>
          );
        })}
      </Select>
    </InputGroup>
  );
};
