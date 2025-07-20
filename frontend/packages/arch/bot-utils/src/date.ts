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

// 根据地区判断 海外返回UTC时间，国内返回北京时间
export const getCurrentTZ = (param?: ConfigType): Dayjs => {
  if (IS_OVERSEA) {
    return dayjs(param).utc(true);
  }
  return dayjs(param).tz(CHINESE_TIMEZONE, true);
};

/**
 * 获取dayjs add后的时间戳
 */
export const getTimestampByAdd = (value: number, unit?: ManipulateType) =>
  dayjs().add(value, unit).unix();

/**
 * 获取当前的时间戳
 */
export const getCurrentTimestamp = () => dayjs().unix();

/**
 * 获取当前时间到次日UTC0点的时间间隔，精确到分钟
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
 * fork 自 packages/community/pages/src/bot/utils/index.ts
 * 将11位的时间戳按以下格式显示
 * 1. 不足一分钟, 显示”Just now“
 * 2. 不足1小时, 显示”{n}min ago“，例如 3min ago
 * 3. 不足1天,显示”{n}h ago",例如 3h ago
 * 4. 不足1个月,显示"{n}d ago", 例如 3d ago
 * 5. 超过1个月,显示“{MM}/{DD}/{yyyy}”,例如12/1/2024，中文是2024 年 12 月 1 日
 *
 */
export const formatTimestamp = (timestampMs: number) => {
  /** 秒级时间戳 */
  const timestampSecond = Math.floor(timestampMs / 1000);
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestampSecond;

  // 将时间差转换成分钟、小时和天数
  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);

  // 不足一分钟，显示“Just now”
  if (minutes < 1) {
    return I18n.t('community_time_just_now');
  }
  // 不足一小时，显示“{n}min ago”
  else if (hours < 1) {
    return I18n.t('community_time_min', { n: minutes });
  }
  // 不足一天，显示“{n}h ago”
  else if (days < 1) {
    return I18n.t('community_time_hour', { n: hours });
  }
  // 不足一个月，显示“{n}d ago”
  else if (days < 30) {
    return I18n.t('community_time_day', { n: days });
  }
  // 超过一个月，显示“{MM}/{DD}/{yyyy}”
  else {
    const dayObj = dayjs(timestampSecond * 1000);
    return I18n.t('community_time_date', {
      yyyy: dayObj.get('y'),
      mm: dayObj.get('M') + 1,
      dd: dayObj.get('D'),
    });
  }
};
