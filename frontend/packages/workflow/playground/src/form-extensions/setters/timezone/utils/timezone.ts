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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { groupBy, toPairs, find, orderBy } from 'lodash-es';
import dayjsUTC from 'dayjs/plugin/utc';
import dayjsTimezone from 'dayjs/plugin/timezone';
import quartersOfYear from 'dayjs/plugin/quarterOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayjs from 'dayjs';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { type CascaderData } from '@coze-arch/bot-semi/Cascader';

import { DEFAULT_TIME_ZONE, DEFAULT_TIME_ZONE_OFFSET } from '../const';

// dependent on utc plugin
dayjs.extend(isoWeek); // Attention: The registration order of plugins here cannot be changed at will, and repeated registration of plugins may have bugs.
dayjs.extend(quartersOfYear);
dayjs.extend(dayjsUTC);
dayjs.extend(dayjsTimezone);

export const dayjsForTimezone = dayjs;

export interface ITimezoneItem {
  value: string;
  label?: string;
  offset: string;
  utcOffset?: number;
}

// Get a list of time zones
export const generatedTimezones = () => {
  let timezoneOptions: CascaderData[] = [];
  let timezoneMap: ITimezoneItem[] = [];
  try {
    // The current international environment
    const locale = I18n.language ?? 'en-US';
    /**
     * List of all time zones
     * (Intl as any) The typescript version of the project does not contain the supportedValuesOf method, and an error will be reported when compiled
     */
    const options = (Intl as any)
      .supportedValuesOf('timeZone')
      .map((item: any) => {
        const formatDateParts = new Intl.DateTimeFormat(locale, {
          timeZone: item,
          timeZoneName: 'longGeneric',
        }).formatToParts(new Date());
        const { value: timeZoneName } = find(formatDateParts, [
          'type',
          'timeZoneName',
        ]) as Intl.DateTimeFormatPart;
        const targetTime = dayjs().tz(item);
        return {
          value: item,
          label: `${timeZoneName} - ${item}`,
          offset: `UTC${targetTime.format('Z')}`,
          utcOffset: targetTime.utcOffset(),
        };
      });
    timezoneOptions = orderBy(
      toPairs(groupBy(options, 'offset')),
      item => {
        const [offset] = item;
        return find(options, ['offset', offset])?.utcOffset;
      },
      ['asc'],
    ).map(item => {
      const [itemKey, itemValue] = item;
      return {
        value: itemKey,
        label: itemKey,
        children: orderBy(itemValue, ['label'], ['asc']),
      };
    });
    timezoneMap = options;
  } catch (error: any) {
    timezoneOptions = [
      {
        value: DEFAULT_TIME_ZONE_OFFSET,
        label: DEFAULT_TIME_ZONE_OFFSET,
        children: [{ value: DEFAULT_TIME_ZONE, label: DEFAULT_TIME_ZONE }],
      },
    ];
    timezoneMap = [
      { value: DEFAULT_TIME_ZONE, offset: DEFAULT_TIME_ZONE_OFFSET },
    ];
    // If the time zone information cannot be obtained, report the exception to slardar.
    logger.persist.error({
      message: 'Custom Error: Unable to obtain accurate time zone list',
      error,
    });
  }
  return { timezoneOptions, timezoneMap };
};
