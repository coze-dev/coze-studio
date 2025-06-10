import React, { useState } from 'react';

import type { Meta, StoryFn } from '@storybook/react';

import { EnhancedView, View } from '@/components/view';
import {
  IconCozCheckMarkFill,
  IconCozLoading,
  IconCozArrowDown,
  IconCozChatPeople,
} from '@/components/icon';
import { Button, SplitButton } from '@/components/button';

import { type MenuProps, Menu, type MenuItem } from '..';

const meta: Meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      options: ['hover', 'click'],
      control: { type: 'select' },
    },
    position: {
      options: ['bottom', 'bottomLeft', 'bottomRight'],
      control: { type: 'select' },
    },
  },
};

export default meta;

const defaultProps = {
  trigger: 'click',
  position: 'bottomLeft',
  className: 'w-160px',
} satisfies MenuProps;

export const Default: StoryFn<MenuProps> = args => (
  <EnhancedView prop="default">
    <>
      <Menu
        {...args}
        position="bottomRight"
        render={
          <Menu.SubMenu mode="menu">
            <Menu.Item type="danger" itemKey="测试文字1">
              测试文字1
            </Menu.Item>
            <Menu.Item itemKey="disabled" disabled>
              disabled
            </Menu.Item>
            <Menu.Item itemKey="测试文字2">测试文字2</Menu.Item>
            <Menu.Item itemKey="测试文字3" type="danger" disabled={true}>
              测试文字3
            </Menu.Item>
          </Menu.SubMenu>
        }
      >
        <SplitButton color="highlight" icon={<IconCozChatPeople />}>
          点击菜单
        </SplitButton>
      </Menu>
    </>
  </EnhancedView>
);

Default.args = { ...defaultProps };

const data: MenuItem[] = [
  { node: 'title', name: '分组1' },
  {
    node: 'item',
    name: '分组内容',
    type: 'primary',
    onClick: () => console.log('click primary'),
  },
  { node: 'item', name: 'secondary', type: 'secondary' },
  { node: 'divider' },
  { node: 'title', name: '分组2' },
  { node: 'item', name: 'tertiary', type: 'tertiary' },
  { node: 'item', name: 'warning', type: 'warning', active: true },
  { node: 'item', name: 'danger', type: 'danger' },
];

export const Config: StoryFn<MenuProps> = args => (
  <Menu
    trigger={'click'}
    showTick
    position={'bottomLeft'}
    menu={data}
    className="w-160px"
  >
    <Button theme="outline" type="tertiary">
      Click Me
    </Button>
  </Menu>
);

Config.args = { ...defaultProps };

export const Single: StoryFn<MenuProps> = args => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  return (
    <View prop="variant" value="single" justify="start">
      <Menu
        className="w-160px"
        trigger={'click'}
        position={'bottomLeft'}
        render={
          <Menu.SubMenu
            mode="selection"
            selectedKeys={selectedKeys}
            onSelectionChange={(value, values) => {
              // @ts-expect-error -- linter-disable-autofix
              setSelectedKeys(values);
            }}
          >
            <Menu.Item
              itemKey="测试文字1"
              icon={<IconCozCheckMarkFill className="fill-brand-5 text-lg" />}
            >
              测试文字1
            </Menu.Item>
            <Menu.Item
              itemKey="测试文字2"
              icon={<IconCozCheckMarkFill className="fill-brand-5 text-lg" />}
            >
              测试文字2
            </Menu.Item>
            <Menu.Item
              itemKey="测试文字3"
              icon={<IconCozCheckMarkFill className="fill-brand-5 text-lg" />}
            >
              测试文字3
            </Menu.Item>
          </Menu.SubMenu>
        }
      >
        <Button
          iconPosition="right"
          icon={<IconCozArrowDown className="coz-fg-hglt-plus text-xxl" />}
        >
          单选菜单
        </Button>
      </Menu>
      <div className="text-lg mt-2 text-foreground-4">
        当前选中：{JSON.stringify(selectedKeys)}
      </div>
    </View>
  );
};

Single.args = { ...defaultProps };

export const Multiple: StoryFn<MenuProps> = args => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  return (
    <View prop="variant" value="multiple" justify="start">
      <Menu
        trigger={'click'}
        position={'bottomLeft'}
        className="w-[220px]"
        render={
          <Menu.SubMenu
            mode="selection"
            multiple={true}
            selectedKeys={selectedKeys}
            onSelectionChange={(value, values) => {
              // @ts-expect-error -- linter-disable-autofix
              setSelectedKeys(values);
            }}
          >
            <Menu.Title>分组1</Menu.Title>
            <Menu.Divider />
            <Menu.Item
              itemKey="测试文字1"
              icon={<IconCozCheckMarkFill className="fill-brand-5 text-lg" />}
            >
              测试文字1
            </Menu.Item>
            <Menu.Item
              itemKey="测试文字2"
              icon={<IconCozCheckMarkFill className="fill-brand-5 text-lg" />}
            >
              测试文字2
            </Menu.Item>
            <Menu.Item
              itemKey="测试文字3"
              icon={<IconCozCheckMarkFill className="fill-brand-5 text-lg" />}
            >
              测试文字3
            </Menu.Item>
            <Menu.Title>分组2</Menu.Title>
            <Menu.Divider />
            <Menu.Item
              itemKey="测试文字4"
              icon={<IconCozCheckMarkFill className="fill-brand-5 text-lg" />}
              suffix={<span className="text-foreground-3">suffix</span>}
            >
              测试文字4
            </Menu.Item>
            <Menu.Item
              onClick={value => {
                console.log('current:', value);
              }}
              itemKey="测试文字5"
              icon={<IconCozCheckMarkFill className="fill-brand-5 text-lg" />}
              suffix={<IconCozLoading className="fill-red-5 text-lg" />}
            >
              测试文字5
            </Menu.Item>
          </Menu.SubMenu>
        }
      >
        <Button
          iconPosition="right"
          icon={<IconCozArrowDown className="coz-fg-hglt-plus text-xxl" />}
        >
          多选菜单
        </Button>
      </Menu>
      <div className="text-lg mt-2 text-foreground-4">
        当前选中：{JSON.stringify(selectedKeys)}
      </div>
    </View>
  );
};

Multiple.args = { ...defaultProps };

export const Dropdown: StoryFn<MenuProps> = args => (
  <View prop="variant" value="menu" justify="flex-start">
    <Menu
      {...args}
      className="w-[220px]"
      render={
        <Menu.SubMenu
          mode="menu"
          onSelectionChange={value => {
            console.log(value);
          }}
        >
          <Menu.Title>分组1</Menu.Title>
          <Menu.Divider />
          <Menu.Item isMenu itemKey="测试文字1">
            测试文字1
          </Menu.Item>
          <Menu.Item isMenu itemKey="测试文字2">
            测试文字2
          </Menu.Item>
          <Menu.Item isMenu itemKey="测试文字3">
            测试文字3
          </Menu.Item>
          <Menu.Title>分组2</Menu.Title>
          <Menu.Divider />
          <Menu.Item
            isMenu
            itemKey="测试文字4"
            icon={<IconCozCheckMarkFill className="coz-fg-primary text-lg" />}
            suffix={<span className="coz-fg-primary">suffix</span>}
          >
            测试文字4
          </Menu.Item>
          <Menu.Item
            isMenu
            itemKey="测试文字5"
            icon={<IconCozCheckMarkFill className="coz-fg-plus text-lg" />}
            suffix={<IconCozLoading className="fill-red-5 text-lg" />}
          >
            测试文字5
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            isMenu
            itemKey="测试文字6"
            icon={<IconCozCheckMarkFill className="coz-fg-primary text-lg" />}
            suffix={<span className="coz-fg-primary">suffix</span>}
          >
            测试文字6
          </Menu.Item>
          <Menu.Item
            isMenu
            itemKey="测试文字7"
            icon={<IconCozCheckMarkFill className="coz-fg-plus text-lg" />}
            suffix={<IconCozLoading className="fill-red-5 text-lg" />}
          >
            测试文字7
          </Menu.Item>
        </Menu.SubMenu>
      }
    >
      <Button>下拉菜单</Button>
    </Menu>
  </View>
);

Dropdown.args = { ...defaultProps };

export const Nest: StoryFn<MenuProps> = args => (
  <EnhancedView prop="default">
    <>
      <Menu
        {...args}
        position="bottomRight"
        render={
          <Menu.SubMenu
            mode="menu"
            onSelectionChange={(value, values) => {
              console.log(value);
            }}
          >
            <Menu
              trigger="click"
              position={'rightTop'}
              render={
                <Menu.SubMenu
                  mode="menu"
                  onSelectionChange={(value, values) => {
                    console.log(value);
                  }}
                >
                  <Menu.Item itemKey="item-1">Menu Item 1</Menu.Item>
                  <Menu.Item itemKey="item-2">Menu Item 2</Menu.Item>
                  <Menu.Item itemKey="item-3">Menu Item 3</Menu.Item>
                </Menu.SubMenu>
              }
            >
              <Menu.Item itemKey="menu-1">Nest Menu 1</Menu.Item>
              <Menu.Item itemKey="menu-2">Nest Menu 2</Menu.Item>
              <Menu.Item itemKey="menu-3">Nest Menu 3</Menu.Item>
            </Menu>
          </Menu.SubMenu>
        }
      >
        <Button color="highlight" icon={<IconCozChatPeople />}>
          点击菜单
        </Button>
      </Menu>
    </>
  </EnhancedView>
);

Nest.args = { ...defaultProps, className: 'auto' };
