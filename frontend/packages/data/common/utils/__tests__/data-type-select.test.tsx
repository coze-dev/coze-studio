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

import { expect, vi, describe, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  DataTypeSelect,
  getDataTypeText,
} from '../src/components/data-type-select';

const handleChange = vi.fn();
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: (key: string) => key,
  },
}));

vi.mock('../src/components/singleline-select', () => ({
  default: (props: { value: string; handleChange: (v: any) => void }) => (
    <button onClick={() => props.handleChange('test change')}>
      {props.value}
    </button>
  ),
}));

describe('data type select test', () => {
  test('render', async () => {
    await render(
      <DataTypeSelect
        value={'db_add_table_field_type_txt'}
        handleChange={handleChange}
        selectProps={{}}
      />,
    );
    const select = await screen.queryByText('db_add_table_field_type_txt');
    expect(select).not.toBeNull();
  });
  test('onChange', async () => {
    await render(
      <DataTypeSelect
        value={'db_add_table_field_type_txt'}
        handleChange={handleChange}
        selectProps={{}}
      />,
    );
    const select = await screen.queryByText('db_add_table_field_type_txt');
    await fireEvent.click(select!);
    expect(handleChange).toBeCalled();
  });

  test('getDataTypeText return null', () => {
    const text = getDataTypeText('' as any);
    expect(text).toBe('');
  });
});
