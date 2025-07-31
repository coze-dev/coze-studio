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

import React, { useRef, type ReactNode, useCallback } from 'react';

import { isUndefined } from 'lodash-es';
import CronGenerator from 'cron-string-generator';
import {
  type ValueExpression,
  ValueExpressionType,
} from '@coze-workflow/base/types';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { Cascader, type CascaderData } from '@coze-arch/coze-design';

const hoursSize = 24;
const padStart = 2;
const hoursLeaf: CascaderData[] = Array.from(new Array(hoursSize).keys()).map(
  i => ({
    label: i.toString().padStart(padStart, '0').concat(':00'),
    value: i,
    isLeaf: true,
  }),
);
const weekDaysNode: () => CascaderData[] = () => {
  const size = 7;
  return Array.from({ length: size }).map((item, index) => ({
    label: I18n.t('bot_task_preset_day_of_week', { day: index }),
    value: index,
    children: hoursLeaf,
  }));
};

const monthDaysNode: () => CascaderData[] = () => {
  const size = 31;
  return Array.from({ length: size }).map((item, index) => ({
    label: I18n.t('bot_task_preset_day_of_month', { day: index + 1 }),
    value: index + 1,
    children: hoursLeaf,
  }));
};

const intervalDaysNode: () => CascaderData[] = () => {
  const size = 5;
  const offset = 2;
  return Array.from({ length: size }).map((item, index) => ({
    label: I18n.t('bot_task_preset_day_of_month', { day: index + offset }),
    value: index + offset,
    children: hoursLeaf,
  }));
};

const triggeredEveryday = () => I18n.t('bot_task_preset_triggered_everyday');
const triggeredEveryweek = () => I18n.t('bot_task_preset_triggered_everyweek');
const triggeredMonthly = () => I18n.t('bot_task_preset_triggered_monthly');
const triggeredInterval = () => I18n.t('bot_task_preset_triggered_interval');

const treeData: () => CascaderData[] = () => [
  {
    label: triggeredEveryday(),
    value: 'daily',
    children: hoursLeaf,
  },
  {
    label: triggeredEveryweek(),
    value: 'weekly',
    children: weekDaysNode(),
  },
  {
    label: triggeredMonthly(),
    value: 'monthly',
    children: monthDaysNode(),
  },
  {
    label: triggeredInterval(),
    value: 'intervalDaily',
    children: intervalDaysNode(),
  },
];

type TaskSchedule = [string, number] | [string, number, number];

const createCron = (schedule: TaskSchedule) => {
  const head = schedule[0];
  const cronGenerator = new CronGenerator();

  if (head === 'daily') {
    const hour = schedule[1];
    return cronGenerator.every(1).days().atHour(hour).atMinute(0).toString();
  }
  const day = schedule[1];
  const hour = schedule[2];
  if (isUndefined(hour)) {
    throw new CustomError(
      ReportEventNames.parmasValidation,
      'invalid schedule',
    );
  }
  if (head === 'weekly') {
    return cronGenerator.atHour(hour).atMinute(0).onDaysOfWeek(day).toString();
  }
  if (head === 'monthly') {
    return cronGenerator.atHour(hour).atMinute(0).onDaysOfMonth(day).toString();
  }
  return cronGenerator.every(day).days().atHour(hour).atMinute(0).toString();
};
export const parseCron: (cron: string) => TaskSchedule = cronExpr => {
  // The current demand is only 5, minutes, hours, day of month, month, day of week
  // Bytescheduler only supports 6 bits, seconds, minutes, hours, day of month, month, day of week
  const cronUnits = cronExpr?.split?.(' ').slice?.(1);
  const hour = cronUnits?.at(1);
  const dayOfMonthIndex = 2;
  const dayOfMonth = cronUnits?.at(dayOfMonthIndex);
  const dayOfWeek = cronExpr?.at(-1);

  const numberHour = Number(hour);
  // wild-card
  const wildcard = '*';
  if (dayOfWeek !== wildcard) {
    return ['weekly', Number(dayOfWeek), numberHour];
  }
  if (dayOfMonth !== wildcard) {
    if (dayOfMonth?.startsWith(wildcard)) {
      return ['intervalDaily', Number(dayOfMonth.split('/').at(1)), numberHour];
    }
    return ['monthly', Number(dayOfMonth), numberHour];
  }
  return ['daily', numberHour];
};

// Convert key to corresponding copy
// export const getOptionNodeText = (val: TaskSchedule): string[] => {
//   let resultData = treeData();
//   const nodeList = val?.map(item => {
//     const findData = resultData.find(data => data.value === item);
//     if (findData) {
//       resultData = findData?.children || [];
//       return String(findData.label) ?? '';
//     } else {
//       return '';
//     }
//   });
//   return nodeList;
// };

const renderDisplay = (nodeList: string[]) => {
  const head = nodeList.at(0);
  const formatHours = (hours?: string) => {
    const formattedHours = hours?.startsWith?.('0') ? hours.slice?.(1) : hours;
    return formattedHours;
  };
  if (head === triggeredEveryday()) {
    const hours = nodeList.at(1);
    return I18n.t('bot_task_preset_everyday_task', {
      time: formatHours(hours),
    });
  }

  const numberRegx = /[0-9]+/;
  const dayNode = nodeList.at(1);
  const days = Number(dayNode?.match?.(numberRegx)?.[0]);
  const hoursIndex = 2;
  const hours = nodeList.at(hoursIndex);

  const formattedHours = formatHours(hours);
  if (head === triggeredEveryweek()) {
    return I18n.t('bot_task_preset_everyweek_task', {
      day: dayNode,
      time: formattedHours,
    });
  }
  if (head === triggeredMonthly()) {
    return I18n.t('bot_task_preset_monthly_task', {
      day: days,
      time: formattedHours,
    });
  }
  if (head === triggeredInterval()) {
    return I18n.t('bot_task_preset_interval_task', {
      day: days,
      time: formattedHours,
    });
  }
  return '';
};

interface FixCronjobSelectProps {
  value?: ValueExpression;
  onChange?: (e: ValueExpression) => void;
  readonly?: boolean;
  hasError?: boolean;
}

/** Select time and time zone components */
export const FixCronjobSelect: React.FC<FixCronjobSelectProps> = ({
  value: _value,
  onChange: _onChange,
  readonly,
  hasError,
}) => {
  const displayText = useRef<ReactNode>('');
  const value = _value?.content as string;

  const onChange = useCallback(
    (v: string) => {
      _onChange?.({
        type: ValueExpressionType.LITERAL,
        content: v,
      });
    },
    [_onChange],
  );

  return (
    <>
      <Cascader
        hasError={hasError}
        size="small"
        className="w-full"
        disabled={readonly}
        showClear={false}
        placeholder={I18n.t('task_preset_trigger_time')}
        value={value ? parseCron(value) : void 0}
        onChange={v => {
          if (Array.isArray(v) && v.length) {
            // The resulting cron expression is 5 bits, but 6 bits are required
            const cronExpr = `0 ${createCron(v as TaskSchedule)}`;
            onChange?.(cronExpr);
            return;
          }
          onChange?.('');
        }}
        treeData={treeData()}
        displayRender={nodes => {
          if (Array.isArray(nodes)) {
            displayText.current = renderDisplay(nodes);
            return displayText.current;
          }
        }}
      />
    </>
  );
};
