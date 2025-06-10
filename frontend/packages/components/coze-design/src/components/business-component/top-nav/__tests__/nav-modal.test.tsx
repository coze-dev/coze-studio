/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';

import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { SideNavModal } from '../nav-modal';

import { vi } from 'vitest';

// 模拟 Tooltip 组件
vi.mock('@/components/tooltip', () => ({
  Tooltip: ({
    children,
    content,
    trigger,
    position,
    showArrow,
    spacing,
    className,
  }) => (
    <div
      data-testid="tooltip"
      data-trigger={trigger}
      data-position={position}
      data-show-arrow={showArrow ? 'true' : 'false'}
      data-spacing={spacing}
      className={className}
    >
      <div data-testid="tooltip-content">{content}</div>
      <div data-testid="tooltip-children">{children}</div>
    </div>
  ),
}));

// 简化的模拟，避免复杂的嵌套结构
vi.mock('@/components/icon', () => ({
  IconCozHouse: () => <span data-testid="house-icon" />,
  IconCozChatHashtag: () => <span data-testid="chat-hashtag-icon" />,
  IconCozPlug: () => <span data-testid="plug-icon" />,
  IconCozCoin: () => <span data-testid="coin-icon" />,
  IconCozTeam: () => <span data-testid="team-icon" />,
  IconCozDiscordFill: () => <span data-testid="discord-icon" />,
  IconCozTelegramFill: () => <span data-testid="telegram-icon" />,
}));

vi.mock('@/components/avatar', () => ({
  Avatar: () => <div data-testid="avatar" />,
}));

vi.mock('../side-nav/components/nav', () => ({
  Nav: () => <div data-testid="nav" />,
}));

vi.mock('../side-nav/components/divider', () => ({
  Divider: () => <div data-testid="divider" />,
}));

describe('SideNavModal', () => {
  it('渲染基本的 SideNavModal', () => {
    const children = <button>点击我</button>;
    render(<SideNavModal>{children}</SideNavModal>);

    // 检查 Tooltip 是否正确渲染
    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips.length).toBeGreaterThan(0);

    // 检查子元素是否正确渲染
    const tooltipChildren = screen.getAllByTestId('tooltip-children');
    expect(tooltipChildren.length).toBeGreaterThan(0);

    // 检查按钮文本是否正确渲染
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });

  it('渲染带有自定义属性的 SideNavModal', () => {
    const children = <button>点击我</button>;
    render(
      <SideNavModal className="custom-class" trigger="hover" position="top">
        {children}
      </SideNavModal>,
    );

    // 检查 Tooltip 是否正确渲染
    const tooltips = screen.getAllByTestId('tooltip');
    expect(tooltips.length).toBeGreaterThan(0);

    // 检查是否有带有自定义类名的 tooltip
    const customTooltip = tooltips.find(tooltip =>
      tooltip.className.includes('custom-class'),
    );
    expect(customTooltip).toBeDefined();
    expect(customTooltip?.className).toContain('custom-class');
  });
});
