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

import {
  formatBytes,
  formatNumber,
  getEllipsisCount,
  simpleformatNumber,
  sleep,
  formatPercent,
  formatTime,
} from '../src/number';

describe('Number', () => {
  it('#simpleformatNumber', () => {
    expect(simpleformatNumber('100')).toEqual('100');
    expect(simpleformatNumber('100.1')).toEqual('100');
    expect(simpleformatNumber(100.1)).toEqual('100');
    expect(simpleformatNumber(1100)).toEqual('1,100');
    expect(simpleformatNumber('1100')).toEqual('1,100');
  });

  it('formatBytes', () => {
    const k = 1024;
    const decimals = 2;
    const genRandomNum = (bytes: number) =>
      Array(bytes)
        .fill(0)
        .reduce(
          (prev, _, idx) =>
            prev +
            Math.floor(((Math.random() + 1) * (k - 1) * Math.pow(k, idx)) / 2),
          0,
        );
    const calDigit = (num: number, unit: number) =>
      parseFloat((num / Math.pow(k, unit)).toFixed(decimals));

    expect(formatBytes(0)).equal('0 Byte');
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    sizes.forEach((size, idx) => {
      const num = genRandomNum(idx + 1);
      const digit = calDigit(num, idx);
      expect(formatBytes(num)).equal(`${digit} ${size}`);
    });
  });

  it('formatNumber', () => {
    const base = 1000;
    const units = ['', 'K', 'M', 'B', 'T'];
    const genRandomNum = (order: number) =>
      Array(order)
        .fill(0)
        .reduce(
          (prev, _, idx) =>
            prev +
            Math.floor(
              ((Math.random() + 1) * (base - 1) * Math.pow(base, idx)) / 2,
            ),
          0,
        );
    const calDigit = (num: number, unit: number) =>
      ceil(Math.abs(num) / Math.pow(base, unit), 1);
    units.forEach((unit, idx) => {
      const num = genRandomNum(idx + 1);
      const digit = calDigit(num, idx);
      expect(formatNumber(num).toString()).equal(`${digit}${unit}`);
    });
  });

  it('getEllipsisCount', () => {
    const max = 1000;
    const num1 = max - 1;
    const num2 = max;
    const num3 = max + 1;
    expect(getEllipsisCount(num1, max)).equal(`${num1}`);
    expect(getEllipsisCount(num2, max)).equal(`${num2}`);
    expect(getEllipsisCount(num3, max)).equal(`${max}+`);
  });

  it('sleep', async () => {
    const mockFn = vi.fn();
    const interval = 3000;
    vi.useFakeTimers();
    const promisedSleep = sleep(interval).then(() => {
      mockFn();
    });
    vi.advanceTimersByTime(interval);
    await promisedSleep;
    expect(mockFn).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('formatPercent', () => {
    expect(formatPercent(0.1)).equal('10%');
    expect(formatPercent(0.123456)).equal('12.3%');
    expect(formatPercent(0.12556)).equal('12.6%');
    expect(formatPercent(1)).equal('100%');
    expect(formatPercent()).equal('NaN%');
  });

  it('formatTime', () => {
    expect(formatTime(1000)).equal('1000ms');
    expect(formatTime(12000)).equal('12s');
    expect(formatTime(12330)).equal('12.3s');
    expect(formatTime(1000.12332)).equal('1000ms');
  });
});
