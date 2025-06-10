import { expect, vi, describe, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { type SelectProps } from '@coze/coze-design';

import { SinglelineSelect } from '../src/components/singleline-select';

const handleChangeMock = vi.fn();
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: (key: string) => key,
  },
}));

vi.mock('@coze/coze-design', () => ({
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
