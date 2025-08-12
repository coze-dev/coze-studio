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

import { useMemo, type FC } from 'react';

import { cloneDeep, find, noop } from 'lodash-es';
import classNames from 'classnames';
import { type LiteralExpression } from '@coze-workflow/base';
import { ValueExpressionType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import {
  Cascader,
  Highlight,
  type CascaderData,
  type FilterRenderProps,
} from '@coze-arch/coze-design';

import { type DynamicComponentProps } from '../dynamic-form';
import { generatedTimezones } from './utils/timezone';
import { UNKNOWN_TIME_ZONE_OFFSET } from './const';

import styles from './index.module.less';

type TimezoneProps = DynamicComponentProps<string> & {
  className?: string;
  showClear?: boolean; // Can it be emptied?
  defaultValue?: string; // default value
};

export const Timezone: FC<TimezoneProps> = ({
  className,
  showClear = false,
  defaultValue,
  value: _value,
  onChange = noop,
  readonly,
}) => {
  const value = ((_value as unknown as LiteralExpression)?.content ??
    _value ??
    defaultValue) as string;

  // time zone list
  const { timezoneOptions: TIME_ZONE_OPTIONS, timezoneMap: TIME_ZOME_MAP } =
    useMemo(() => generatedTimezones(), []);

  // Time zone selector option generation logic
  const [timezoneOptions, timezoneMap] = useMemo(() => {
    const timezoneOptionsBase = cloneDeep(TIME_ZONE_OPTIONS);
    const timezoneMapBase = cloneDeep(TIME_ZOME_MAP);
    // When the user has selected a time zone, but the current environment does not support compatibility with the corresponding time zone, insert the unknown time zone option Compatible at the end of the option
    if (value && timezoneMapBase.every(e => e.value !== value)) {
      timezoneOptionsBase.push({
        value: UNKNOWN_TIME_ZONE_OFFSET,
        label: UNKNOWN_TIME_ZONE_OFFSET,
        children: [{ value, label: value }],
      });
      timezoneMapBase.push({
        value,
        offset: UNKNOWN_TIME_ZONE_OFFSET,
      });
    }
    return [timezoneOptionsBase, timezoneMapBase];
  }, []);

  const timezoneValue = useMemo(() => {
    const item = find(timezoneMap, ['value', value]);
    if (item) {
      return [item.offset, item.value];
    } else {
      return undefined;
    }
  }, [value, timezoneMap]);

  // Traverse query time zone offset
  const findTimezoneValue = (nodes: string[], key: string) => {
    if (Array.isArray(nodes) && nodes.length > 1) {
      const [offsetValue, timezoneLabel] = nodes;
      const item = find(timezoneOptions, ['value', offsetValue]);
      if (item && Array.isArray(item.children)) {
        const option = find(item.children, [key, timezoneLabel]);
        if (option && option.value) {
          return option.value as string;
        }
      }
    }
  };

  const filterSorter = (
    first: CascaderData,
    second: CascaderData,
    inputValue: string,
  ) => {
    if (
      Array.isArray(first) &&
      first.length > 1 &&
      Array.isArray(second) &&
      second.length > 1
    ) {
      const keyword: string = (inputValue || '').toLowerCase();
      const firstLabelLowerCase: string = (first[1].label || '').toLowerCase();
      const secondLabelLowerCase: string = (
        second[1].label || ''
      ).toLowerCase();
      const firstLabelArray = firstLabelLowerCase.split(' ');
      const secondLabelArray = secondLabelLowerCase.split(' ');
      if (firstLabelArray.findIndex(e => e === keyword) === 0) {
        return -1;
      }
      if (secondLabelArray.findIndex(e => e === keyword) === 0) {
        return 1;
      }
      if (firstLabelLowerCase.includes(keyword)) {
        return -1;
      }
      if (secondLabelLowerCase.includes(keyword)) {
        return 1;
      }
    }
    return 0;
  };

  // custom highlighting logic
  const filterRender = (filterRenderProps: FilterRenderProps) => {
    const { className: cls, inputValue, data, onClick } = filterRenderProps;
    // Put together the copy of the multi-level options
    const labelString = data.map(e => e.label).join(' / ');
    return (
      <li
        role="menuitem"
        className={classNames('semi-cascader-option-flatten', cls)}
        onClick={onClick}
      >
        <span className="semi-cascader-option-label">
          <span
            aria-hidden="true"
            className="semi-cascader-option-icon semi-cascader-option-icon-empty"
          ></span>
          <Highlight
            sourceString={labelString}
            searchWords={[inputValue]}
            highlightStyle={{
              color: 'var(--light-usage-primary-color-primary, #4d53e8)',
              backgroundColor: 'transparent',
            }}
          />
        </span>
      </li>
    );
  };

  return (
    <Cascader
      size="small"
      className={`${className} w-full`}
      dropdownClassName={styles.dropdown}
      showClear={showClear}
      filterTreeNode
      filterSorter={filterSorter}
      filterRender={filterRender}
      disabled={readonly}
      placeholder={I18n.t('task_preset_timezone')}
      treeData={timezoneOptions}
      value={timezoneValue}
      onChange={nodes => {
        const newTimezone = findTimezoneValue(nodes as string[], 'value');
        onChange({
          type: ValueExpressionType.LITERAL,
          content: newTimezone,
        });
        if (newTimezone) {
          sendTeaEvent(EVENT_NAMES.select_scheduled_tasks_timezone, {
            timezone: newTimezone,
          });
        }
      }}
      displayRender={nodes => findTimezoneValue(nodes as string[], 'label')}
    />
  );
};
