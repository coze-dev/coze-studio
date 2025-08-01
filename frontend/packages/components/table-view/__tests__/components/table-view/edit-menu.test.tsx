/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { EditMenuItem } from '../../../src/components/types';
import {
  EditMenu,
  EditToolBar,
} from '../../../src/components/table-view/edit-menu';

// simulated dependency
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: (key: string, options?: any) => {
      if (key === 'table_view_002' && options?.n) {
        return `已选择 ${options.n} 项`;
      }
      return `translated_${key}`;
    },
  },
}));

vi.mock('@coze-arch/coze-design', () => ({
  Menu: {
    SubMenu: ({ children, mode }: any) => (
      <div data-testid="menu-submenu" data-mode={mode}>
        {children}
      </div>
    ),
    Item: ({ children, onClick, icon }: any) => (
      <div data-testid="menu-item" onClick={onClick}>
        {icon ? <span data-testid="menu-item-icon">{icon}</span> : null}
        <span data-testid="menu-item-text">{children}</span>
      </div>
    ),
  },
  Divider: ({ layout, margin }: any) => (
    <div data-testid="divider" data-layout={layout} data-margin={margin}></div>
  ),
  Button: ({ children, onClick, icon, color }: any) => (
    <button data-testid="button" data-color={color} onClick={onClick}>
      {icon ? <span data-testid="button-icon">{icon}</span> : null}
      {children}
    </button>
  ),
  ButtonGroup: ({ children, className }: any) => (
    <div data-testid="button-group" className={className}>
      {children}
    </div>
  ),
  Space: ({ children, spacing }: any) => (
    <div data-testid="space" data-spacing={spacing}>
      {children}
    </div>
  ),
}));

vi.mock('@douyinfe/semi-icons', () => ({
  IconClose: () => <div data-testid="icon-close"></div>,
}));

vi.mock('@coze-arch/coze-design/icons', () => ({
  IconCozEdit: () => <div data-testid="icon-edit"></div>,
  IconCozTrashCan: () => <div data-testid="icon-trash"></div>,
}));

// simulation style
vi.mock('../../../src/components/table-view/index.module.less', () => ({
  default: {
    'table-edit-menu': 'table-edit-menu-class',
    'table-edit-toolbar': 'table-edit-toolbar-class',
    'button-group': 'button-group-class',
    'selected-count': 'selected-count-class',
  },
}));

describe('EditMenu 组件', () => {
  const mockOnExit = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('当visible为false时不应渲染菜单', () => {
    render(
      <EditMenu
        configs={[EditMenuItem.EDIT, EditMenuItem.DELETE]}
        visible={false}
        style={{ top: '10px', left: '10px' }}
        selected={{
          record: { tableViewKey: '1', name: 'test' },
          indexs: ['1'],
        }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.queryByTestId('menu-submenu')).not.toBeInTheDocument();
  });

  test('当visible为true且configs不为空时应渲染菜单', () => {
    render(
      <EditMenu
        configs={[EditMenuItem.EDIT, EditMenuItem.DELETE]}
        visible={true}
        style={{ top: '10px', left: '10px' }}
        selected={{
          record: { tableViewKey: '1', name: 'test' },
          indexs: ['1'],
        }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByTestId('menu-submenu')).toBeInTheDocument();
    expect(screen.getAllByTestId('menu-item')).toHaveLength(2);
  });

  test('点击编辑菜单项应调用onEdit回调', () => {
    render(
      <EditMenu
        configs={[EditMenuItem.EDIT]}
        visible={true}
        style={{ top: '10px', left: '10px' }}
        selected={{
          record: { tableViewKey: '1', name: 'test' },
          indexs: ['1'],
        }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByTestId('menu-item'));
    expect(mockOnEdit).toHaveBeenCalledWith(
      { tableViewKey: '1', name: 'test' },
      '1',
    );
  });

  test('点击删除菜单项应调用onDelete回调', () => {
    render(
      <EditMenu
        configs={[EditMenuItem.DELETE]}
        visible={true}
        style={{ top: '10px', left: '10px' }}
        selected={{
          record: { tableViewKey: '1', name: 'test' },
          indexs: ['1'],
        }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByTestId('menu-item'));
    expect(mockOnDelete).toHaveBeenCalledWith(['1']);
  });

  test('组件挂载后应添加点击事件监听器', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <EditMenu
        configs={[EditMenuItem.EDIT]}
        visible={true}
        style={{ top: '10px', left: '10px' }}
        selected={{
          record: { tableViewKey: '1', name: 'test' },
          indexs: ['1'],
        }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
    );

    // trigger click event
    window.dispatchEvent(new Event('click'));
    expect(mockOnExit).toHaveBeenCalled();

    // uninstall components
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
    );
  });
});

describe('EditToolBar 组件', () => {
  const mockOnExit = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('当visible为false时不应渲染工具栏', () => {
    render(
      <EditToolBar
        configs={[EditMenuItem.EDIT, EditMenuItem.DELETE]}
        visible={false}
        style={{}}
        selected={{ indexs: ['1', '2'] }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.queryByTestId('button-group')).not.toBeInTheDocument();
  });

  test('当visible为true时应渲染工具栏', () => {
    render(
      <EditToolBar
        configs={[EditMenuItem.EDIT, EditMenuItem.DELETE]}
        visible={true}
        style={{}}
        selected={{ indexs: ['1', '2'] }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.getByTestId('button-group')).toBeInTheDocument();
    expect(screen.getByText('已选择 2 项')).toBeInTheDocument();
    expect(screen.getAllByTestId('button')).toHaveLength(3); // Edit, delete, and close buttons
  });

  test('点击编辑按钮应调用onEdit回调', () => {
    render(
      <EditToolBar
        configs={[EditMenuItem.EDIT]}
        visible={true}
        style={{}}
        selected={{
          record: { tableViewKey: '1', name: 'test' },
          indexs: ['1'],
        }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByText('translated_knowledge_tableview_01'));
    expect(mockOnEdit).toHaveBeenCalledWith(
      { tableViewKey: '1', name: 'test' },
      '1',
    );
  });

  test('点击删除按钮应调用onDelete回调', () => {
    render(
      <EditToolBar
        configs={[EditMenuItem.DELETE]}
        visible={true}
        style={{}}
        selected={{ indexs: ['1', '2'] }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByText('translated_knowledge_tableview_02'));
    expect(mockOnDelete).toHaveBeenCalledWith(['1', '2']);
  });

  test('点击关闭按钮应调用onExit回调', () => {
    render(
      <EditToolBar
        configs={[]}
        visible={true}
        style={{}}
        selected={{ indexs: ['1'] }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.click(screen.getByTestId('button'));
    expect(mockOnExit).toHaveBeenCalled();
  });

  test('当configs为空时不应渲染操作按钮', () => {
    render(
      <EditToolBar
        configs={[]}
        visible={true}
        style={{}}
        selected={{ indexs: ['1'] }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(screen.queryByTestId('space')).not.toBeInTheDocument();
  });

  test('当选择多个项目时应显示不同的marginLeft', () => {
    const { rerender } = render(
      <EditToolBar
        configs={[]}
        visible={true}
        style={{}}
        selected={{ indexs: ['1', '2'] }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    const toolbar = screen.getByTestId('button-group').parentElement;
    expect(toolbar).toHaveStyle('margin-left: -145px');

    // Re-render, select only one item
    rerender(
      <EditToolBar
        configs={[]}
        visible={true}
        style={{}}
        selected={{ indexs: ['1'] }}
        onExit={mockOnExit}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />,
    );

    expect(toolbar).toHaveStyle('margin-left: -203.5px');
  });
});
