import { describe, it } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

import { LocaleProviderContainer } from '@/__tests__/locale-provider-containner';

import { Table } from '..';

const { TableMeta, TableAction } = Table;

describe('Table', () => {
  it('should has className coz-table-wrapper', () => {
    const { container } = render(<Table />);
    expect(container.getElementsByClassName('coz-table-wrapper')).toHaveLength(
      1,
    );
  });

  it('should has status empty', () => {
    const { container } = render(<Table tableProps={{ dataSource: [] }} />);
    expect(container.getElementsByClassName('coz-empty-content')).toHaveLength(
      1,
    );
  });

  it('should has status loading', () => {
    const { container } = render(<Table tableProps={{ loading: true }} />);
    expect(container.getElementsByClassName('coz-table-spin')).toHaveLength(1);
  });

  it('table data ready', () => {
    const { container } = render(
      <LocaleProviderContainer>
        <Table
          tableProps={{ dataSource: [{ name: '123' }] }}
          enableLoad
          loadMode="cursor"
          hasMore={true}
        />
      </LocaleProviderContainer>,
    );
    expect(container.getElementsByClassName('coz-table-list')).toHaveLength(1);
  });

  it('should has className coz-table-meta', () => {
    const { container } = render(
      <TableMeta
        icon_url="test table meta icon url"
        name="test table meta name"
        description="test table meta description"
      />,
    );
    expect(container.getElementsByClassName('coz-table-meta')).toHaveLength(1);
  });

  it('should has className table meta no avatar', () => {
    const { container } = render(
      <TableMeta
        icon_url=""
        name="table meta withtou avatar"
        description="test table meta description"
      />,
    );
    expect(container.getElementsByClassName('semi-avatar')).toHaveLength(0);
  });

  it('should has className table action', () => {
    const { container } = render(
      <LocaleProviderContainer>
        <TableAction
          deleteProps={{ disabled: false }}
          copyProps={{ disabled: false }}
          editProps={{ disabled: false }}
          actionList={[
            {
              customRender: <div className="test-custom-render"></div>,
            },
            {
              actionKey: 'enable',
              actionText: 'enable',
              disabled: false,
            },
          ]}
        />
      </LocaleProviderContainer>,
    );
    expect(container.getElementsByClassName('coz-table-action')).toHaveLength(
      1,
    );
  });

  describe('indexRowSelection', () => {
    it('should has className coz-table-list-index-row-selection', () => {
      const { container } = render(
        <LocaleProviderContainer>
          <Table
            indexRowSelection
            tableProps={{ dataSource: [{ name: '123', key: 123 }] }}
          />
        </LocaleProviderContainer>,
      );
      expect(
        container.getElementsByClassName('coz-table-list-index-row-selection'),
      ).toHaveLength(1);
    });

    it('should render checkbox cell with index and checkbox', () => {
      const { container } = render(
        <LocaleProviderContainer>
          <Table
            indexRowSelection
            tableProps={{ dataSource: [{ name: '123', key: 123 }] }}
          />
        </LocaleProviderContainer>,
      );
      expect(
        container.getElementsByClassName('coz-table-checkbox-cell'),
      ).toHaveLength(2);

      const checkboxCell = container.getElementsByClassName(
        'coz-table-checkbox-cell',
      );

      Array.from(checkboxCell).forEach(cell => {
        expect(cell.innerHTML).toMatchSnapshot();
      });
    });

    it('should handle click event', () => {
      const { container } = render(
        <LocaleProviderContainer>
          <Table
            indexRowSelection
            tableProps={{
              dataSource: [
                { name: '123', key: '123' },
                { name: '456', key: '456' },
              ],
              columns: [{ dataIndex: 'name', key: 'name' }],
            }}
          />
        </LocaleProviderContainer>,
      );

      const checkboxInput = container.querySelector(
        '.coz-table-checkbox-cell-checkbox input[type="checkbox"]',
      );

      if (!checkboxInput) {
        throw new Error('Checkbox input not found');
      }

      act(() => {
        fireEvent.click(checkboxInput);
      });

      // 检查 checkbox 是否变为选中状态
      const checkbox = container.querySelector(
        '.coz-table-checkbox-cell-checkbox .semi-checkbox',
      );
      expect(checkbox).toHaveClass('semi-checkbox-checked');

      // 检查列选择框是否变为中间状态
      const columnSelection = container.querySelector(
        '.semi-table-column-selection .semi-checkbox',
      );
      console.log('columnSelection', columnSelection);
      expect(columnSelection).toHaveClass('semi-checkbox-indeterminate');
    });
  });
});
