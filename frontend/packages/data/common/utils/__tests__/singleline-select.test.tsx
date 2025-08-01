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
import { type SelectProps } from '@coze-arch/coze-design';

import { SinglelineSelect } from '../src/components/singleline-select';

const handleChangeMock = vi.fn();
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: (key: string) => key,
  },
}));

vi.mock('@coze-arch/coze-design', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Select: (props: SelectProps) => {
    const { optionList, onChange } = props;
    return (
      <>
        {optionList?.map(option => (
          <div key={option.value} onClick={() => onChange?.(option.value)}>
            {option.value}
          </div>
        ))}
      </>
    );
  },
}));

describe('singleline select test', () => {
  test('render', async () => {
    await render(
      <SinglelineSelect
        selectProps={{
          optionList: [{ value: 'test' }, { value: 'test-1' }],
        }}
        handleChange={handleChangeMock}
        value={'test'}
      />,
    );
    const text = await screen.queryByText('test');
    expect(text).not.toBeNull();
    await render(
      <SinglelineSelect
        selectProps={{
          optionList: [{ value: 'test' }, { value: 'test-1' }],
        }}
        handleChange={handleChangeMock}
        value={'test'}
        errorMsg={'test-error'}
      />,
    );
    const errorMsg = await screen.queryByText('test-error');
    expect(errorMsg).not.toBeNull();
  });
  test('change', async () => {
    await render(
      <SinglelineSelect
        selectProps={{
          optionList: [{ value: 'test' }, { value: 'test-1' }],
        }}
        handleChange={handleChangeMock}
        value={'test'}
        errorMsg={'test-error'}
      />,
    );
    const selector = await screen.queryByText('test');
    await fireEvent.click(selector!);
    expect(handleChangeMock).toBeCalledWith('test');
  });
});
