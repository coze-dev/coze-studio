import { type Meta, type StoryFn } from '@storybook/react';

import { Button } from '@/components/button';

import { Popconfirm, type PopconfirmProps } from '..';

const meta: Meta = {
  title: 'Components/Popconfirm',
  tags: ['autodocs'],
  component: Popconfirm,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

export const Default: StoryFn<PopconfirmProps> = function DefaultFactory(args) {
  return (
    <Popconfirm
      {...args}
      title="确定是否要保存此修改？"
      content="此修改将不可逆"
    >
      <Button>popconfirm</Button>
    </Popconfirm>
  );
};

export const ShowCancelButton: StoryFn<PopconfirmProps> =
  function DefaultFactory(args) {
    return (
      <Popconfirm
        {...args}
        title="确定是否要保存此修改？"
        content="此修改将不可逆"
        cancelText="取消"
      >
        <Button>cancelText: "取消"</Button>
      </Popconfirm>
    );
  };

export const OkButtonColor: StoryFn<PopconfirmProps> =
  function OkButtonColorFactory(args) {
    return (
      <div>
        {(['brand', 'yellow', 'red'] as PopconfirmProps['okButtonColor'][]).map(
          _type => (
            <Popconfirm
              {...args}
              title="确定是否要保存此修改？"
              content="此修改将不可逆"
              okButtonColor={_type}
              // showArrow
            >
              <Button color={_type} className="mr-2">
                okButtonColor: {_type}
              </Button>
            </Popconfirm>
          ),
        )}
      </div>
    );
  };

export const DefaultOpen: StoryFn<PopconfirmProps> =
  function DefaultOpenFactory(args) {
    return (
      <Popconfirm
        {...args}
        title="确定是否要保存此修改？"
        content="此修改将不可逆"
        defaultVisible
      >
        <Button>defaultVisible: true</Button>
      </Popconfirm>
    );
  };
export const CustomContent: StoryFn<PopconfirmProps> =
  function CustomContentFactory(args) {
    return (
      <div>
        <Popconfirm {...args} title="确定是否要保存此修改？" content={null}>
          <Button className="mr-2">content: null</Button>
        </Popconfirm>

        <Popconfirm
          {...args}
          title="确定是否要保存此修改？"
          content="此修改将不可逆"
        >
          <Button className="mr-2">content: string</Button>
        </Popconfirm>

        <Popconfirm
          {...args}
          title="确定是否要保存此修改？"
          content={
            <>
              <Popconfirm.SubTitle>subtitle</Popconfirm.SubTitle>
              <Popconfirm.Description>I`m description.</Popconfirm.Description>

              <Popconfirm.SubTitle>subtitle</Popconfirm.SubTitle>
              <Popconfirm.Description>I`m description.</Popconfirm.Description>
            </>
          }
        >
          <Button className="mr-2">content: ReactNode</Button>
        </Popconfirm>
      </div>
    );
  };

export const LongText: StoryFn<PopconfirmProps> = function LongTextFactory(
  args,
) {
  return (
    <div>
      <Popconfirm
        {...args}
        className="w-[220px]"
        title="I`m very very very very very very long title"
        content={
          <>
            <Popconfirm.SubTitle>
              I`m very very very very very very long subTitle
            </Popconfirm.SubTitle>
            <Popconfirm.Description>
              I`m very very very very very very very very very very very very
              long description.
            </Popconfirm.Description>
          </>
        }
      >
        <Button className="mr-2">Long</Button>
      </Popconfirm>
    </div>
  );
};

export const DelayClose: StoryFn<PopconfirmProps> = function DelayCloseFactory(
  args,
) {
  return (
    <div className="space-x-4">
      <Popconfirm
        {...args}
        title="确定是否要保存此修改？"
        content="此修改将不可逆"
        onConfirm={() =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve(true);
            }, 2000);
          })
        }
      >
        <Button>成功 (2s)</Button>
      </Popconfirm>

      <Popconfirm
        {...args}
        title="确定是否要保存此修改？"
        content="此修改将不可逆"
        onConfirm={() =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('Operation failed'));
            }, 200000);
          })
        }
      >
        <Button>失败 (2s)</Button>
      </Popconfirm>

      <Popconfirm
        {...args}
        title="确定是否要保存此修改？"
        content="此修改将不可逆"
        cancelText="取消"
        onCancel={() => {
          console.log('Cancelled');
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(true);
            }, 1000);
          });
        }}
      >
        <Button>取消 (1s)</Button>
      </Popconfirm>
    </div>
  );
};

DelayClose.parameters = {
  docs: {
    description: {
      story: '展示异步操作的加载状态，包括成功、失败和取消三种情况。',
    },
  },
};

Default.args = {};
