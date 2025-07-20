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
 
import { ceil } from 'lodash-es';

export const simpleformatNumber = (num: number | string) =>
  new Intl.NumberFormat('en-US').format(parseInt(String(num)));

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) {
    return '0 Byte';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const digit = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${digit} ${sizes[i]}`;
};
const THOUSAND = 1e3;
const MILLION = 1e6;
const BILLION = 1e9;
const TRILLION = 1e12;
//将数字转换成K、M等单位
export const formatNumber = (num: number) => {
  const absNum = Math.abs(num);
  if (absNum >= TRILLION) {
    return `${ceil(num / TRILLION, 1)}T`;
  }
  if (absNum >= BILLION) {
    return `${ceil(num / BILLION, 1)}B`;
  }
  if (absNum >= MILLION) {
    return `${ceil(num / MILLION, 1)}M`;
  }
  if (absNum >= THOUSAND) {
    return `${ceil(num / THOUSAND, 1)}K`;
  }
  return num;
};

// 将数字转换成百分数, 向上取整
export const formatPercent = (num?: number): string => {
  if (num === undefined || num === null) {
    return 'NaN%';
  }
  const percentage = num * 100;

  let formatted = percentage.toFixed(1);

  // 如果小数点后一位是0，则移除小数点和0
  if (formatted.endsWith('.0')) {
    formatted = formatted.slice(0, -2);
  }

  // 添加百分号并返回结果
  return `${formatted}%`;
};

// 格式化时间, 毫秒, 保留一位小数点
// 比如6.7s, 3.2min, 100ms, 1.3h
export const formatTime = (ms: number) => {
  const absMs = Math.abs(ms);

  if (absMs >= 3600000) {
    const hours = (ms / 3600000).toFixed(1);
    return hours.endsWith('.0') ? `${hours.slice(0, -2)}h` : `${hours}h`;
  }

  if (absMs >= 60000) {
    const minutes = (ms / 60000).toFixed(1);
    return minutes.endsWith('.0')
      ? `${minutes.slice(0, -2)}min`
      : `${minutes}min`;
  }

  if (absMs >= 10000) {
    const seconds = (ms / 1000).toFixed(1);
    return seconds.endsWith('.0') ? `${seconds.slice(0, -2)}s` : `${seconds}s`;
  }

  return `${ms.toFixed(0)}ms`;
};

export const getEllipsisCount = (num: number, max: number): string =>
  num > max ? `${max}+` : `${num}`;

/**
 * @deprecated 不知道这个函数是干啥的。。。
 */
export const exhaustiveCheck = (_v: never) => {
  // empty
};

export async function sleep(timer = 3000) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), timer);
  });
}
