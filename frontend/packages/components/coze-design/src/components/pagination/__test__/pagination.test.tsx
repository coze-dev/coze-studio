import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Pagination } from '..';

describe('Pagination', () => {
  // 基础渲染测试
  it('should render basic pagination correctly', () => {
    render(<Pagination total={100} />);
    const paginationElement = screen.getByRole('list');
    expect(paginationElement).toHaveClass('coz-pagination');
    expect(paginationElement).toBeInTheDocument();
  });

  // 页码变化测试
  it('should handle page change correctly', () => {
    const onChangeMock = vi.fn();
    render(
      <Pagination
        total={100}
        currentPage={1}
        pageSize={10}
        onChange={onChangeMock}
      />,
    );

    const page2Button = screen.getByLabelText('Page 2');
    fireEvent.click(page2Button);
    expect(onChangeMock).toHaveBeenCalledWith(2, 10);
  });

  // 尺寸测试
  it('should render with different sizes', () => {
    const { rerender } = render(<Pagination total={100} size="default" />);
    expect(screen.getByRole('list')).toHaveClass('coz-pagination-size-default');

    rerender(<Pagination total={100} size="small" />);
    expect(screen.getByRole('list')).toHaveClass('coz-pagination-size-small');
  });

  // 布局测试
  it('should render with different layouts', () => {
    const { rerender, container } = render(
      <Pagination total={100} layout="default" />,
    );
    expect(container.querySelector('.coz-pagination')).toHaveClass(
      'coz-pagination-layout-default',
    );

    rerender(<Pagination total={100} layout="simple" />);
    expect(container.querySelector('.coz-pagination')).toHaveClass(
      'coz-pagination-layout-simple',
    );
  });

  // 总数显示测试
  it('should show total text correctly', () => {
    render(<Pagination total={100} showTotal={true} />);
    const totalText = screen.getByText('总页数：10');
    expect(totalText).toBeInTheDocument();
  });

  // 显示总数测试
  it('should show total when showTotal is true', () => {
    render(<Pagination total={100} showTotal />);
    expect(screen.getByText('总页数：10')).toBeInTheDocument();
  });

  // 快速跳转测试
  it('should handle quick jump correctly', async () => {
    const onPageChange = vi.fn();
    render(
      <Pagination total={100} showQuickJumper={true} onChange={onPageChange} />,
    );

    const input = screen.getByRole('spinbutton');
    await userEvent.clear(input);
    await userEvent.type(input, '5');
    await userEvent.keyboard('{Enter}');

    await waitFor(
      () => {
        expect(onPageChange).toHaveBeenCalledWith(5, 10);
      },
      { timeout: 1000 },
    );
  });

  // 边界条件测试
  it('should handle edge cases', () => {
    // 测试总数为 0 的情况
    const { rerender } = render(<Pagination total={0} />);
    expect(screen.getByRole('list')).toBeInTheDocument();

    // 测试总数为负数的情况，应该表现正常
    rerender(<Pagination total={-1} />);
    expect(screen.getByRole('list')).toBeInTheDocument();

    // 测试非常大的总数
    rerender(<Pagination total={1000000} pageSize={10} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  // 禁用状态测试
  it('should handle disabled state', () => {
    render(<Pagination total={100} currentPage={1} disabled />);
    const prevButton = screen.getByLabelText('Previous');

    expect(prevButton).toHaveClass('semi-page-item-disabled');
    expect(screen.getByRole('list')).toHaveClass('semi-page');
  });

  // 上一页/下一页按钮测试
  it('should handle prev/next buttons correctly', () => {
    const onChangeMock = vi.fn();
    render(<Pagination total={100} currentPage={5} onChange={onChangeMock} />);

    const prevButton = screen.getByRole('button', { name: 'Previous' });
    const nextButton = screen.getByRole('button', { name: 'Next' });

    fireEvent.click(prevButton);
    expect(onChangeMock).toHaveBeenCalledWith(4, 10);

    fireEvent.click(nextButton);
    expect(onChangeMock).toHaveBeenCalledWith(6, 10);
  });
});
