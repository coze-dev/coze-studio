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

import JSONBig from 'json-bigint';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import { type ob_query_trace } from '@coze-arch/bot-api/ob_query_api';

import { type QueryFilterItemId, type UTCTimeInfo } from '../typings';
import {
  DATE_FILTERING_DAYS_NUMBER,
  FILTERING_OPTION_ALL,
  TIME_MINUTE,
} from '../consts';

dayjs.extend(utc);

const jsonBig = JSONBig({ storeAsString: true });

/**
 * Convert timestamp to current format current time zone
 * @param timestamp string | number
 * @returns UTCTimeInfo
 */
export const getTimeInCurrentTimeZone = (
  timestamp: string | number,
): UTCTimeInfo => {
  const utcDate = dayjs.utc(timestamp);
  const localDate = utcDate.local();
  const offset = localDate.utcOffset();
  const offsetString = `UTC${offset >= 0 ? '+' : '-'}${Math.abs(
    offset / TIME_MINUTE,
  )}`;
  const dateString = localDate.format('MM-DD HH:mm');
  return {
    timeOffsetString: offsetString,
    dateString,
  };
};

export const getPastWeekDates = (): string[] => {
  const today = dayjs();
  const dateList: string[] = [];
  for (let i = 0; i < DATE_FILTERING_DAYS_NUMBER; i++) {
    const pastDay = today.subtract(i, 'day');
    dateList.push(pastDay.format('YYYY-MM-DD'));
  }
  return dateList;
};

/**
 * Extract its current corresponding start/end timestamp from the format time
 * @param formattedDate QueryFilterItemId
 * @returns DailyTime
 */
export const getDailyTimestampByDate = (
  formattedDate?: QueryFilterItemId,
): Pick<ob_query_trace.ListDebugQueriesRequest, 'startAtMS' | 'endAtMS'> => {
  if (formattedDate === FILTERING_OPTION_ALL) {
    const today = dayjs();
    return {
      startAtMS: today
        .subtract(DATE_FILTERING_DAYS_NUMBER - 1, 'day')
        .startOf('day')
        .valueOf()
        .toString(),
      endAtMS: today.endOf('day').valueOf().toString(),
    };
  } else {
    const date = dayjs(formattedDate);
    return {
      startAtMS: date.startOf('day').valueOf().toString(),
      endAtMS: date.endOf('day').valueOf().toString(),
    };
  }
};

export const textWithFallback = (text?: string | number) =>
  text && text !== '' ? text : '-';

export const formatTime = (timestamp?: number | string) =>
  dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');

export const isJsonString = (str: string) => {
  try {
    const jsonData = JSON.parse(str);
    if (Object.prototype.toString.call(jsonData) !== '[object Object]') {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
};

export const isDebugShowJsonString = (str: string) => {
  try {
    const jsonData = JSON.parse(str);
    if (
      Object.prototype.toString.call(jsonData) !== '[object Object]' &&
      Object.prototype.toString.call(jsonData) !== '[object Array]'
    ) {
      return false;
    }
  } catch (error) {
    return false;
  }
  return true;
};

export const jsonParseWithBigNumber = (jsonString: string) =>
  JSON.parse(JSON.stringify(jsonBig.parse(jsonString)));

export const jsonParse = (
  jsonString: string,
): Record<string, unknown> | string | unknown[] => {
  if (isDebugShowJsonString(jsonString)) {
    return jsonParseWithBigNumber(jsonString);
  } else {
    return jsonString;
  }
};
