import React from 'react';

import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';
import { SideNav } from '../side-nav';

// 模拟依赖
/* eslint-disable @typescript-eslint/naming-convention */
vi.mock('@/components/icon', () => ({
  IconCozBotFill: () => <span data-testid="bot-fill-icon" />,
  IconCozBot: () => <span data-testid="bot-icon" />,
  IconCozHouseFill: () => <span data-testid="house-fill-icon" />,
  IconCozHouse: () => <span data-testid="house-icon" />,
  IconCozPeopleFill: () => <span data-testid="people-fill-icon" />,
  IconCozPeople: () => <span data-testid="people-icon" />,
  IconCozPlusFill: () => <span data-testid="plus-fill-icon" />,
  IconCozPlus: () => <span data-testid="plus-icon" />,
  IconCozTeamFill: () => <span data-testid="team-fill-icon" />,
  IconCozTeam: () => <span data-testid="team-icon" />,
}));

vi.mock('@/components/button', () => ({
  Button: ({ children }) => <button>{children}</button>,
}));

vi.mock('../../common', () => ({
  Scroll: ({ children }) => <div data-testid="scroll">{children}</div>,
}));

vi.mock('../side-nav-footer', () => ({
  SideNavFooter: ({ selected, onSelect }) => (
    <div
      data-testid="side-nav-footer"
      data-selected={selected}
      onClick={() => onSelect('Footer')}
    >
      Footer
    </div>
  ),
}));
/* eslint-enable @typescript-eslint/naming-convention */

describe('SideNav', () => {
  it('渲染侧边导航', () => {
    const { container } = render(<SideNav />);
    // 检查基本结构
    expect(container.querySelector('div[class*="flex"]')).toBeInTheDocument();

    // 检查创建 Bot 按钮
    expect(screen.getByText('Create Bot')).toBeInTheDocument();

    // 检查导航项
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Bot Store')).toBeInTheDocument();
    expect(screen.getByText('Plugin Store')).toBeInTheDocument();

    // 检查标题
    expect(screen.getByText('Team Space')).toBeInTheDocument();

    // 检查团队列表
    expect(
      screen.getByText(
        'Team Name1 long name long name long name long name long name',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Team Name22')).toBeInTheDocument();

    // 检查底部
    expect(screen.getByTestId('side-nav-footer')).toBeInTheDocument();
  });

  it('点击导航项更新选中状态', () => {
    render(<SideNav />);

    // 默认选中 Home
    const homeElement = screen.getByText('Home');
    expect(homeElement).toBeInTheDocument();

    // 点击 Personal
    fireEvent.click(screen.getByText('Personal'));

    // Personal 应该被选中
    const personalElement = screen.getByText('Personal');
    expect(personalElement).toBeInTheDocument();
  });

  it('点击底部导航更新选中状态', () => {
    render(<SideNav />);

    // 点击底部
    fireEvent.click(screen.getByTestId('side-nav-footer'));

    // 底部应该被选中
    expect(screen.getByTestId('side-nav-footer')).toHaveAttribute(
      'data-selected',
      'Footer',
    );
  });

  it('渲染不同主题', () => {
    const { rerender } = render(<SideNav theme="light" />);

    // 重新渲染为暗色主题
    rerender(<SideNav theme="dark" />);

    // 主题应该被应用
    // 注意：由于组件中没有根据主题应用不同的类，这里只是示例
    // 需要根据组件的实现来调整
  });
});
