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

import dayjsUTC from 'dayjs/plugin/utc';
import dayjsTimezone from 'dayjs/plugin/timezone';
import dayjsDuration from 'dayjs/plugin/duration';
import dayjs, { type ManipulateType, type ConfigType, type Dayjs } from 'dayjs';
import { I18n } from '@coze-arch/i18n';

dayjs.extend(dayjsUTC);
dayjs.extend(dayjsTimezone);
dayjs.extend(dayjsDuration);

const FORMAT_DATE_MAP = {
  Today: 'HH:mm',
  CurrentYear: 'MM-DD HH:mm',
  Default: 'YYYY-MM-DD HH:mm',
};

export const getFormatDateType = (time: number) => {
  const compareTime = dayjs.unix(time);
  const currentTime = dayjs();
  if (compareTime.isSame(currentTime, 'day')) {
    return FORMAT_DATE_MAP.Today;
  }
  if (compareTime.isSame(currentTime, 'year')) {
    return FORMAT_DATE_MAP.CurrentYear;
  }
  return FORMAT_DATE_MAP.Default;
};

export const formatDate = (v: number, template = 'YYYY/MM/DD HH:mm:ss') =>
  dayjs.unix(v).format(template);

export const CHINESE_TIMEZONE = 'Asia/Shanghai';

// According to the regional judgment, return to UTC time overseas, and return to Beijing time domestically.
export const getCurrentTZ = (param?: ConfigType): Dayjs => {
  if (IS_OVERSEA) {
    return dayjs(param).utc(true);
  }
  return dayjs(param).tz(CHINESE_TIMEZONE, true);
};

/**
 * Get timestamp after dayjs add
 */
export const getTimestampByAdd = (value: number, unit?: ManipulateType) =>
  dayjs().add(value, unit).unix();

/**
 * Get the current timestamp
 */
export const getCurrentTimestamp = () => dayjs().unix();

/**
 * Gets the time interval between the current time and UTC0 the next day, accurate to the minute
 * e.g. 12h 30m
 */
export const getRemainTime = () => {
  const now = dayjs.utc();
  const nextDay = now.add(1, 'day').startOf('day');
  const diff = nextDay.diff(now);
  const duration = dayjs.duration(diff);
  const hour = duration.hours();
  const minute = duration.minutes();
  return `${hour}h ${minute}m`;
};

/**
 * Fork from packages/community/pages/src/bot/utils/index.ts
 * Display the 11-digit timestamp in the following format
 * 1. Less than a minute, showing "Just now"
 * 2. Less than 1 hour, showing "{n} min ago", such as 3min ago
 * 3. Less than 1 day, display "{n} h ago", such as 3h ago
 * 4. Less than 1 month, display "{n} d ago", such as 3d ago
 * 5. More than 1 month, display "{MM}/{DD}/{yyyy}", for example 12/1/2024, Chinese is December 1, 2024
 *
 */
export const formatTimestamp = (timestampMs: number) => {
  /** Second timestamp */
  const timestampSecond = Math.floor(timestampMs / 1000);
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestampSecond;

  // Convert time differences to minutes, hours, and days
  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);

  // Less than a minute, showing "Just now"
  if (minutes < 1) {
    return I18n.t('community_time_just_now');
  }
  // Less than an hour, showing "{n} min ago"
  else if (hours < 1) {
    return I18n.t('community_time_min', { n: minutes });
  }
  // Less than a day, showing "{n} h ago"
  else if (days < 1) {
    return I18n.t('community_time_hour', { n: hours });
  }
  // Less than a month, showing "{n} d ago"
  else if (days < 30) {
    return I18n.t('community_time_day', { n: days });
  }
  // More than a month, showing "{MM}/{DD}/{yyyy}"
  else {
    const dayObj = dayjs(timestampSecond * 1000);
    return I18n.t('community_time_date', {
      yyyy: dayObj.get('y'),
      mm: dayObj.get('M') + 1,
      dd: dayObj.get('D'),
    });
  }
};
