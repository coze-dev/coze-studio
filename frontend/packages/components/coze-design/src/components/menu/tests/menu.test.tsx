import '@testing-library/jest-dom';
import { type ReactElement } from 'react';

import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent } from '@testing-library/react';

import { filterSelectedValue } from '../menu-item';
import { Button } from '../../button';
import { Menu } from '..';

describe('Menu', () => {
  it('should render a coz menu', async () => {
    render(
      <Menu
        trigger="click"
        render={
          <Menu.SubMenu mode="menu">
            <Menu.Item itemKey="测试文字1">测试文字1</Menu.Item>
          </Menu.SubMenu>
        }
      >
        <Button>COZMenu</Button>
      </Menu>,
    );
    const button = await screen.findByText('COZMenu');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    const element = await screen.findByText('测试文字1');
    expect(element).toBeInTheDocument();
  });

  it('should has coz-menu title', async () => {
    render(
      <Menu
        visible={true}
        render={
          <Menu.SubMenu mode="menu">
            <Menu.Title>标题1</Menu.Title>
            <Menu.Item itemKey="测试文字1">测试文字1</Menu.Item>
          </Menu.SubMenu>
        }
      >
        <Button>点击菜单</Button>
      </Menu>,
    );
    const element = await screen.findByText('标题1');
    expect(element).toBeInTheDocument();
  });

  it('should has menu divider', async () => {
    const onClick = vi.fn();
    const onSelectionChange = vi.fn();
    const setup = (jsx: ReactElement) => ({
      itemDom: userEvent.setup(),
      ...render(jsx),
    });
    const { itemDom } = setup(
      <Menu
        render={
          <Menu.SubMenu mode="menu" onSelectionChange={onSelectionChange}>
            <Menu.Title>标题1</Menu.Title>
            <Menu.Divider />
            <Menu.Item itemKey="testClick" disabled={false} onClick={onClick}>
              测试文字
            </Menu.Item>
          </Menu.SubMenu>
        }
      >
        <Button>点击菜单</Button>
      </Menu>,
    );
    const button = await screen.findByText('点击菜单');
    fireEvent.click(button);
    const element = await screen.findByText('标题1');
    expect(element.nextElementSibling).toHaveClass('coz-menu-divider');
    const target = await screen.findByRole('menuitem');
    expect(target.innerText).toBe('测试文字');
    await itemDom.click(target);
    expect(onSelectionChange).toBeCalledTimes(1);
    expect(onClick).toBeCalledTimes(1);
  });

  it('does not trigger onClick and onSelectionChange when disabled', async () => {
    const onClick = vi.fn();
    const onSelectionChange = vi.fn();
    const setup = (jsx: ReactElement) => ({
      itemDom: userEvent.setup(),
      ...render(jsx),
    });
    const { itemDom } = setup(
      <Menu
        visible={true}
        trigger="custom"
        render={
          <Menu.SubMenu mode="menu" onSelectionChange={onSelectionChange}>
            <Menu.Item itemKey="testClick" disabled={true} onClick={onClick}>
              测试文字1
            </Menu.Item>
          </Menu.SubMenu>
        }
      >
        <Button>点击菜单</Button>
      </Menu>,
    );
    const target = await screen.findByRole('menuitem');
    expect(target.innerText).toBe('测试文字1');
    await itemDom.click(target);
    expect(onSelectionChange).not.toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  describe('should use filterSelectedValue', () => {
    it('should return only the new value when isMultiple is false', () => {
      const result = filterSelectedValue(['item1', 'item2'], 'item3', false);
      expect(result).toEqual(['item3']);
    });

    it('should add the new value when isMultiple is true and the value is not already selected', () => {
      const result = filterSelectedValue(['item1', 'item2'], 'item3', true);
      expect(result).toContain('item3');
      expect(result).toHaveLength(3);
    });

    it('should remove the value when isMultiple is true and the value is already selected', () => {
      const result = filterSelectedValue(
        ['item1', 'item2', 'item3'],
        'item2',
        true,
      );
      expect(result).not.toContain('item2');
      expect(result).toHaveLength(2);
    });

    it('should not mutate the original array', () => {
      const originalArray = ['item1', 'item2'];
      filterSelectedValue(originalArray, 'item3', true); // 调用函数，但不需要使用返回值
      expect(originalArray).toEqual(['item1', 'item2']); // 检查原始数组是否没有被修改
    });
  });
});
