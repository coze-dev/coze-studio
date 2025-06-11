import { type Meta, type StoryFn as Story } from '@storybook/react';
import { IconCozIllus404 } from '@coze-arch/arco-illustration';

import { EmptyState } from '@/components/empty-state';

import { Table, type TableProps } from '..';
const meta: Meta = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
  argTypes: {
    indexRowSelection: {
      control: 'boolean',
      description: '是否使用index和checkbox的rowSelection',
      defaultValue: false,
    },
  },
};

export default meta;

export const Default: Story<TableProps> = function defaultFactory(args) {
  const columns = [
    {
      title: '大小',
      dataIndex: 'size',
    },
    {
      title: '所有者',
      dataIndex: 'owner',
    },
    {
      title: '更新日期',
      dataIndex: 'updateTime',
    },
  ];

  const data = [
    {
      key: '1',
      name: 'Semi Design 设计稿.fig',
      nameIconSrc: '',
      size: '2M',
      owner: '姜鹏志',
      status: 'success',
      updateTime: '2020-02-02 05:13',
      avatarBg: 'grey',
    },
    {
      key: '2',
      name: 'Semi Design 分享演示文稿',
      nameIconSrc: '',
      size: '2M',
      owner: '郝宣',
      status: 'pending',
      updateTime: '2020-01-17 05:31',
      avatarBg: 'red',
    },
    {
      key: '3',
      name: '设计文档',
      nameIconSrc: '',
      size: '34KB',
      status: 'wait',
      owner: 'Zoey Edwards',
      updateTime: '2020-01-26 11:01',
      avatarBg: 'light-blue',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>基本用法</h1>
        <Table
          showTableWhenEmpty
          tableProps={{
            columns,
            dataSource: data,
          }}
          empty={
            <EmptyState
              size="full_screen"
              icon={<IconCozIllus404 />}
              title="暂无数据"
              description="请先创建数据集"
            />
          }
          indexRowSelection={args.indexRowSelection}
        />
      </div>
    </div>
  );
};

Default.args = {
  indexRowSelection: true,
};
