import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';
import { Nav } from '../components/nav';

describe('Nav', () => {
  it('渲染基本导航项', () => {
    render(<Nav text="测试导航项" />);
    expect(screen.getByText('测试导航项')).toBeInTheDocument();
  });

  it('渲染带图标的导航项', () => {
    const testIcon = <span data-testid="test-icon" />;
    render(<Nav text="带图标导航项" unselectedIcon={testIcon} />);
    expect(screen.getByText('带图标导航项')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('渲染选中状态的导航项', () => {
    const { container } = render(<Nav text="选中导航项" selected />);
    expect(container.firstChild).toHaveClass('bg-background-4');
  });

  it('渲染带后缀的导航项', () => {
    render(<Nav text="带后缀导航项" suffix="后缀" />);
    expect(screen.getByText('带后缀导航项')).toBeInTheDocument();
    expect(screen.getByText('后缀')).toBeInTheDocument();
  });

  it('渲染带自定义类名的导航项', () => {
    const { container } = render(
      <Nav text="自定义类名导航项" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('渲染带后缀节点的导航项', () => {
    const suffix = <span data-testid="suffix-icon" />;
    render(<Nav text="带后缀节点导航项" suffix={suffix} />);
    expect(screen.getByText('带后缀节点导航项')).toBeInTheDocument();
    expect(screen.getByTestId('suffix-icon')).toBeInTheDocument();
  });

  it('渲染选中状态下的图标', () => {
    const selectedIcon = <span data-testid="selected-icon" />;
    const unselectedIcon = <span data-testid="unselected-icon" />;

    render(
      <Nav
        text="选中状态图标"
        selected
        selectedIcon={selectedIcon}
        unselectedIcon={unselectedIcon}
      />,
    );

    expect(screen.getByTestId('selected-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('unselected-icon')).not.toBeInTheDocument();
  });

  it('渲染未选中状态下的图标', () => {
    const selectedIcon = <span data-testid="selected-icon" />;
    const unselectedIcon = <span data-testid="unselected-icon" />;

    render(
      <Nav
        text="未选中状态图标"
        selected={false}
        selectedIcon={selectedIcon}
        unselectedIcon={unselectedIcon}
      />,
    );

    expect(screen.queryByTestId('selected-icon')).not.toBeInTheDocument();
    expect(screen.getByTestId('unselected-icon')).toBeInTheDocument();
  });

  it('处理点击事件', () => {
    const handleClick = vi.fn();
    render(<Nav text="可点击导航项" onClick={handleClick} />);
    fireEvent.click(screen.getByText('可点击导航项'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('可以通过自定义类名实现禁用状态', () => {
    const { container } = render(
      <Nav
        text="禁用导航项"
        className="disabled pointer-events-none opacity-50"
        onClick={() => {}}
      />,
    );

    expect(container.firstChild).toHaveClass('disabled');
    expect(container.firstChild).toHaveClass('pointer-events-none');
    expect(container.firstChild).toHaveClass('opacity-50');
  });
});
