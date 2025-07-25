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
 
/*
 表格单元格宽度适配
 当 width 小于 WidthThresholds.Small 时应该返回 ColumnSize.Default。
 当 width 大于等于 WidthThresholds.Small 但小于 WidthThresholds.Medium 时应该返回 ColumnSize.Small。
 当 width 大于等于 WidthThresholds.Medium 但小于 WidthThresholds.Large 时应该返回 ColumnSize.Medium。
 当 width 大于等于 WidthThresholds.Large 时应该返回 ColumnSize.Large。
 当 minWidth 为 'auto' 时应该返回 'auto'。
 当 minWidth 是一个指定数字时，应该返回 minWidth 和 columnWidth 中较大的一个。*/

import { describe, it, expect } from 'vitest';

import {
  responsiveTableColumn,
  ColumnSize,
  WidthThresholds,
} from '../src/responsive-table-column';

describe('responsiveTableColumn', () => {
  it('returns auto for minWidth auto', () => {
    expect(responsiveTableColumn(1000, 'auto')).toBe('auto');
  });

  it('returns minWidth when minWidth is a number and greater than columnWidth', () => {
    expect(responsiveTableColumn(1000, 80)).toBe(80);
  });

  it('returns ColumnSize.Small for width less than WidthThresholds.Small', () => {
    expect(responsiveTableColumn(WidthThresholds.Small - 1, 50)).toBe(
      ColumnSize.Default,
    );
  });

  it('returns ColumnSize.Medium for width between WidthThresholds.Small and WidthThresholds.Medium', () => {
    expect(responsiveTableColumn(WidthThresholds.Medium - 1, 50)).toBe(
      ColumnSize.Small,
    );
  });

  it('returns ColumnSize.Large for width between WidthThresholds.Medium and WidthThresholds.Large', () => {
    expect(responsiveTableColumn(WidthThresholds.Large - 1, 50)).toBe(
      ColumnSize.Medium,
    );
  });

  it('returns ColumnSize.Large for width greater than or equal to WidthThresholds.Large', () => {
    expect(responsiveTableColumn(WidthThresholds.Large, 50)).toBe(
      ColumnSize.Large,
    );
  });
});
