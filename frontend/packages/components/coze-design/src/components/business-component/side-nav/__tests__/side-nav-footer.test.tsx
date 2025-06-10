import React from 'react';

import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';
import { SideNavFooter } from '../side-nav-footer';

// 模拟所有依赖
/* eslint-disable @typescript-eslint/naming-convention */
vi.mock('@/components/icon', () => ({
  IconCozPlugFill: () => <div data-testid="plug-fill-icon" />,
  IconCozPlug: () => <div data-testid="plug-icon" />,
  IconCozChatHashtag: () => <div data-testid="chat-hashtag-icon" />,
  IconCozChatPeople: () => <div data-testid="chat-people-icon" />,
  IconCozCoinFill: () => <div data-testid="coin-fill-icon" />,
  IconCozCoin: () => <div data-testid="coin-icon" />,
  IconCozDiscordFill: () => <div data-testid="discord-fill-icon" />,
  IconCozDocument: () => <div data-testid="document-icon" />,
  IconCozEnvelope: () => <div data-testid="envelope-icon" />,
  IconCozTelegramFill: () => <div data-testid="telegram-fill-icon" />,
  IconCozXTwitterFill: () => <div data-testid="twitter-fill-icon" />,
  IconCozYoutubeFill: () => <div data-testid="youtube-fill-icon" />,
}));

vi.mock('@/components/button', () => ({
  Button: props => <button {...props} data-testid="button" />,
}));

vi.mock('@/components/tooltip', () => ({
  Tooltip: props => <div {...props} data-testid="tooltip" />,
}));

vi.mock('@/components/avatar', () => ({
  Avatar: props => <div {...props} data-testid="avatar" />,
}));

vi.mock('../components/title', () => ({
  Title: props => <div {...props} data-testid="title" />,
}));

vi.mock('../components/text', () => ({
  Text: props => <div {...props} data-testid="text" />,
}));

vi.mock('../components/navs', () => ({
  Navs: props => (
    <div
      data-testid="navs"
      data-selected={props.selected}
      onClick={() => props.onSelect && props.onSelect('test-key')}
    >
      {props.schema
        ? props.schema.map((item, index) => (
            <div
              key={index}
              data-type={item.type}
              data-testid={`nav-item-${index}`}
            >
              {item.props?.text}
              {item.props?.suffix ? (
                <span data-testid="nav-suffix">{item.props.suffix}</span>
              ) : null}
            </div>
          ))
        : null}
    </div>
  ),
  NavType: {
    ITEM: 'ITEM',
    TITLE: 'TITLE',
    DIVIDER: 'DIVIDER',
  },
}));

vi.mock('../components/nav', () => ({
  Nav: props => <div {...props} data-testid="nav" />,
}));

vi.mock('../components/divider', () => ({
  Divider: () => <div data-testid="divider" />,
}));
/* eslint-enable @typescript-eslint/naming-convention */

describe('SideNavFooter', () => {
  it('渲染基本结构', () => {
    render(<SideNavFooter />);

    // 检查基本组件是否渲染
    expect(screen.getAllByTestId('button')).toHaveLength(4);
    expect(screen.getByTestId('divider')).toBeInTheDocument();
    expect(screen.getByTestId('navs')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getAllByTestId('tooltip').length).toBeGreaterThan(0);
  });

  it('点击导航项触发 onSelect 回调', () => {
    const onSelectMock = vi.fn();
    render(<SideNavFooter onSelect={onSelectMock} />);

    // 点击导航项
    fireEvent.click(screen.getByTestId('navs'));

    // 检查回调是否被调用
    expect(onSelectMock).toHaveBeenCalledWith('test-key');
  });

  it('渲染带有选中状态的导航', () => {
    render(<SideNavFooter selected="test-selected" />);

    // 检查选中状态是否传递给 Navs 组件
    const navs = screen.getByTestId('navs');
    expect(navs).toHaveAttribute('data-selected', 'test-selected');
  });

  it('渲染用户头像和信息', () => {
    render(<SideNavFooter />);

    // 检查头像
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();

    // 检查用户信息区域的工具提示
    const tooltip = avatar.closest('[data-testid="tooltip"]');
    expect(tooltip).toBeInTheDocument();
  });
});
