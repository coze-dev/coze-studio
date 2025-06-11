/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';

import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import { BotCard } from '../bot-card';

import { vi } from 'vitest';

// 模拟 icon 组件

vi.mock('@/components/icon', () => ({
  IconCozEdit: () => <span data-testid="edit-icon" />,
}));

// 模拟 Avatar 组件

vi.mock('@/components/avatar', () => ({
  Avatar: ({ size, alt, src }) => (
    <div data-testid="avatar" data-size={size} data-alt={alt} data-src={src} />
  ),
}));

// 模拟 Button 组件

vi.mock('@/components/button', () => ({
  Button: ({ children, icon, className, size }) => (
    <button data-testid="button" data-size={size} className={className}>
      {icon}
      {children}
    </button>
  ),
}));

describe('BotCard', () => {
  it('渲染紧凑模式的 BotCard', () => {
    render(<BotCard isCompact={true} name="测试机器人" />);

    // 检查名称是否正确渲染
    expect(screen.getByText('测试机器人')).toBeInTheDocument();

    // 检查头像组件是否正确渲染
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-size', 'small');

    // 检查编辑按钮是否存在
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
  });

  it('渲染非紧凑模式的 BotCard', () => {
    render(<BotCard isCompact={false} name="测试机器人" />);

    // 检查名称是否正确渲染
    expect(screen.getByText('测试机器人')).toBeInTheDocument();

    // 检查头像组件是否正确渲染
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-size', 'lg');
  });

  it('渲染带有 footer 的 BotCard', () => {
    const footerContent = <div data-testid="footer-content">Footer 内容</div>;
    render(
      <BotCard isCompact={true} name="测试机器人" footer={footerContent} />,
    );

    // 检查 footer 是否正确渲染
    expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    expect(screen.getByText('Footer 内容')).toBeInTheDocument();
  });
});
