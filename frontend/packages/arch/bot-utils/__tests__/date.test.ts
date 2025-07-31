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
import { I18n } from '@coze-arch/i18n';

import {
  getCurrentTZ,
  getFormatDateType,
  formatDate,
  getRemainTime,
  getTimestampByAdd,
  formatTimestamp,
} from '../src/date';

vi.mock('@coze-arch/i18n');
vi.spyOn(I18n, 't');

describe('Date', () => {
  it('#getFormatDateType', () => {
    const now = dayjs();
    expect(getFormatDateType(now.unix())).toEqual('HH:mm');
    expect(
      getFormatDateType(
        dayjs(now)
          .date(now.date() === 1 ? 2 : 1)
          .unix(),
      ),
    ).toEqual('MM-DD HH:mm');
    expect(getFormatDateType(dayjs(now).add(1, 'year').unix())).toEqual(
      'YYYY-MM-DD HH:mm',
    );
  });

  it('#dayjsForRegion Oversea should return UTC format', () => {
    vi.stubGlobal('IS_OVERSEA', true);
    expect(getCurrentTZ().isUTC()).toBe(true);
    expect(getCurrentTZ().utcOffset()).toBe(0);
  });
  it('#dayjsForRegion China should return UTC+8 format', () => {
    vi.stubGlobal('IS_OVERSEA', false);
    expect(getCurrentTZ().isUTC()).toBe(false);
    expect(getCurrentTZ().utcOffset()).toBe(60 * 8);
  });
  it('#formatDate', () => {
    // Uses a fixed timestamp, but verifies the format rather than a specific timezone value
    const timestamp = 1718782764;
    const date = formatDate(timestamp);
    // Verify that the format is correct: YYYY/MM/DD HH: mm: ss
    expect(date).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/);

    // Verify consistency of timestamp conversions: Formatting and parsing should result in the same date portion of the dayjs object
    const formattedDayjs = dayjs(date, 'YYYY/MM/DD HH:mm:ss');
    const originalDayjs = dayjs.unix(timestamp);
    expect(formattedDayjs.unix()).toBe(originalDayjs.unix());
  });
  it('#getRemainTime', () => {
    vi.useFakeTimers();
    const date = new Date('2024-08-19T15:30:00+08:00');
    vi.setSystemTime(date);
    expect(getRemainTime()).toBe('16h 30m');
    vi.useRealTimers();
  });
  it('#dayjsAdd', () => {
    vi.useFakeTimers();
    const date = new Date('2024-08-19T15:30:00+08:00');
    vi.setSystemTime(date);
    const unix = getTimestampByAdd(1, 'd');

    expect(unix).toBe(dayjs('2024-08-20T15:30:00+08:00').unix());
    vi.useRealTimers();
  });
});

describe('format timestamp', () => {
  beforeEach(() => {
    const MOCK_NOW = dayjs('2024-09-24 20:00:00');
    vi.setSystemTime(MOCK_NOW.toDate());
  });

  it('just now', () => {
    formatTimestamp(dayjs('2024-09-24 19:59:01').valueOf());
    expect(I18n.t).toHaveBeenCalledWith('community_time_just_now');
  });

  it('n min', () => {
    formatTimestamp(dayjs('2024-09-24 19:58:01').valueOf());
    expect(I18n.t).toHaveBeenCalledWith('community_time_min', { n: 1 });
  });

  it('n hours', () => {
    formatTimestamp(dayjs('2024-09-24 17:58:01').valueOf());
    expect(I18n.t).toHaveBeenCalledWith('community_time_hour', { n: 2 });
  });

  it('n days', () => {
    formatTimestamp(dayjs('2024-09-21 17:58:01').valueOf());
    expect(I18n.t).toHaveBeenCalledWith('community_time_day', { n: 3 });
  });

  it('full date', () => {
    formatTimestamp(dayjs('2024-07-21 17:58:01').valueOf());
    expect(I18n.t).toHaveBeenCalledWith('community_time_date', {
      yyyy: 2024,
      mm: 7,
      dd: 21,
    });
  });
});
