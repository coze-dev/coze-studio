/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';

import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { TopNav } from '../top-nav';

import { vi } from 'vitest';

// 模拟 icon 组件
vi.mock('@/components/icon', () => ({
  IconCozArrowLeft: () => <span data-testid="arrow-left-icon" />,
  IconCozLoading: () => <span data-testid="loading-icon" />,
}));

// 模拟 Button 组件
vi.mock('@/components/button', () => ({
  Button: ({ children, icon, className }) => (
    <button data-testid="button" className={className}>
      {icon}
      {children}
    </button>
  ),
}));

// 模拟 Tag 组件
vi.mock('@/components/tag', () => ({
  Tag: ({ children, prefixIcon, size, color }) => (
    <div data-testid="tag" data-size={size} data-color={color}>
      {prefixIcon}
      {children}
    </div>
  ),
}));

// 模拟 SideNavModal 组件
vi.mock('../nav-modal', () => ({
  SideNavModal: ({ children, trigger }) => (
    <div data-testid="side-nav-modal" data-trigger={trigger}>
      {children}
    </div>
  ),
}));

// 模拟 BotCard 组件
vi.mock('../bot-card', () => ({
  BotCard: ({ name, isCompact, footer }) => (
    <div
      data-testid="bot-card"
      data-name={name}
      data-is-compact={isCompact ? 'true' : 'false'}
    >
      {name}
      {footer ? <div data-testid="bot-card-footer">{footer}</div> : null}
    </div>
  ),
}));

describe('TopNav', () => {
  it('渲染紧凑模式的 TopNav', () => {
    render(<TopNav isCompact={true} />);

    // 检查 SideNavModal 是否正确渲染
    expect(screen.getByTestId('side-nav-modal')).toBeInTheDocument();
    expect(screen.getByTestId('side-nav-modal')).toHaveAttribute(
      'data-trigger',
      'click',
    );

    // 检查 BotCard 是否正确渲染
    const botCard = screen.getByTestId('bot-card');
    expect(botCard).toBeInTheDocument();
    expect(botCard).toHaveAttribute('data-is-compact', 'true');
    expect(botCard).toHaveAttribute('data-name', 'Bot Gallery');

    // 检查 Tag 是否正确渲染
    const tags = screen.getAllByTestId('tag');
    expect(tags.length).toBe(2);
    expect(tags[0]).toHaveAttribute('data-size', 'mini');
    expect(tags[1]).toHaveAttribute('data-size', 'mini');
    expect(tags[1]).toHaveAttribute('data-color', 'primary');
  });

  it('渲染非紧凑模式的 TopNav', () => {
    render(<TopNav isCompact={false} />);

    // 检查 BotCard 是否正确渲染
    const botCard = screen.getByTestId('bot-card');
    expect(botCard).toBeInTheDocument();
    expect(botCard).toHaveAttribute('data-is-compact', 'false');
  });

  it('渲染带有自定义内容的 TopNav', () => {
    const customContent = <div data-testid="custom-content">自定义内容</div>;
    render(<TopNav content={customContent} />);

    // 检查自定义内容是否正确渲染
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.getByText('自定义内容')).toBeInTheDocument();
  });

  it('渲染带有面包屑导航的 TopNav', () => {
    render(<TopNav backType="breadcrumb" />);

    // 检查面包屑导航是否正确渲染
    expect(
      screen.getByText('Crumb / Crumb / Crumb / Crumb'),
    ).toBeInTheDocument();
  });

  it('渲染带有高亮边框的 TopNav', () => {
    const { container } = render(<TopNav highLightBorderBottom={true} />);

    // 检查是否有高亮边框类名
    expect(container.firstChild).toHaveClass('border-b-stroke');
    expect(container.firstChild).toHaveClass('border-b');
  });
});
