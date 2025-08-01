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

import dayjs from 'dayjs';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';

export const disabledDate = (date?: Date) => {
  const today = dayjs().startOf('day'); // Start time of the day

  return dayjs(date).isBefore(today, 'day') || dayjs(date).isSame(today, 'day');
};

export enum ExpirationDate {
  ONE = '1',
  THIRTY = '30',
  CUSTOMIZE = 'customize',
}
enum ServerTimeValue {
  PERMANENT = -1,
  NOT_USE = -1,
}

export const getExpirationOptions = () => {
  const dataOptionsList = [
    {
      label: '1天',
      value: ExpirationDate.ONE,
    },
    {
      label: '30天',
      value: ExpirationDate.THIRTY,
    },
    {
      label: I18n.t('customize_key_1'),
      value: ExpirationDate.CUSTOMIZE,
    },
  ];
  const newOptions = dataOptionsList.map(item => {
    const { value } = item;
    if (value === ExpirationDate.CUSTOMIZE) {
      return item;
    }
    const currentDate = dayjs();
    const futureDate = currentDate.add(Number(value), 'day');
    const date = futureDate.format('YYYY-MM-DD');
    return {
      label: I18n.t('expired_time_days_1' as I18nKeysNoOptionsType, {
        num: Number(value),
        date,
      }),
      value,
    };
  });
  return newOptions;
};

export const getExpireAt = (d: Date) => {
  const h = 23;
  const m = 59;
  const s = 59;
  const intDate = dayjs(d)
    .add(h, 'hour')
    .add(m, 'minute')
    .add(s, 'second')
    .unix();
  return intDate;
};

export const getDetailTime = (d: number) => {
  if (d === ServerTimeValue.NOT_USE) {
    return '-';
  }
  const showDate = dayjs.unix(d).format('YYYY-MM-DD HH:mm:ss');
  return showDate;
};

export const getExpirationTime = (d: number) => {
  if (d === ServerTimeValue.PERMANENT) {
    return I18n.t('api_status_permanent_1');
  }
  const showDate = dayjs.unix(d).format('YYYY-MM-DD');
  return showDate;
};

export const getStatus = (d: number) => {
  if (d === ServerTimeValue.PERMANENT) {
    return true;
  }
  const current = dayjs().unix();
  return d >= current;
};
