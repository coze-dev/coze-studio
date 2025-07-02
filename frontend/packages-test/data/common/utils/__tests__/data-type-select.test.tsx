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
