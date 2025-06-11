/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @coze-arch/no-batch-import-or-export */
import { useState } from 'react';

import { type StoryFn as Story, type Meta } from '@storybook/react';

import { EnhancedView, View, ViewGroup } from '@/components/view';
import { Switch } from '@/components/switch';
import { InputNumber } from '@/components/input-number';
import * as icons from '@/components/icon';
import { Button, IconButton } from '@/components/button';
import { Banner } from '@/components/banner';

const {
  IconCozMinusFill,
  IconCozPlusFill,
  IconCozCheckMarkFill,
  IconCozPeopleFill,
} = icons;

const meta: Meta = {
  title: 'Resource/Icon',
  argTypes: {
    className: {
      options: ['text-xxl', 'text-lg', 'text-base'],
      defaultValue: 'text-lg',
      control: { type: 'select' },
    },
  },
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
};

export default meta;

export const Default: Story = args => (
  <EnhancedView prop="default">
    <div>
      <IconCozPeopleFill {...args} />
    </div>
  </EnhancedView>
);

export const Size: Story = args => (
  <ViewGroup>
    <View prop="variant" value="size" justify="start">
      <IconCozPeopleFill className="text-xxl" />
      <IconCozPeopleFill className="text-lg" />
      <IconCozPeopleFill className="text-base" />
    </View>
  </ViewGroup>
);

export const Color: Story = args => (
  <ViewGroup>
    <View prop="variant" value="color" justify="start">
      <IconCozPeopleFill className="text-xxl coz-fg-hglt" />
      <IconCozPeopleFill className="text-lg coz-fg-hglt-red" />
      <IconCozPeopleFill className="text-base coz-fg-hglt-green" />
    </View>
  </ViewGroup>
);

export const IconBtn: Story = args => (
  <ViewGroup>
    <View prop="variant" value="iconButton" justify="start">
      <IconButton
        icon={<IconCozPeopleFill className="text-xxl coz-fg-hglt" />}
      />
    </View>
  </ViewGroup>
);

const StateTemplate = args => {
  const [size, setSize] = useState(24);
  const [color, setColor] = useState('current');
  const [border, setBorder] = useState(false);

  return (
    <div className={`flex flex-col gap-8  overflow-hidden ${color} `}>
      <div className="flex flex-col gap-2 fixed top-24px right-24px bg-background-1 p-4 rounded-lg w-240px opacity-50 hover:opacity-100 coz-shadow">
        <div className="flex gap-[4px] items-center">
          <InputNumber value={size} onNumberChange={setSize} hideButtons />
          <Button
            onClick={() => {
              setSize(size - 2);
            }}
            icon={<IconCozMinusFill />}
            size="small"
          />
          <Button
            onClick={() => {
              setSize(size + 2);
            }}
            icon={<IconCozPlusFill />}
            size="small"
          />
        </div>

        <div className="flex justify-between mt-2">
          {[
            {
              color: 'current',
              className:
                'border-foreground-1 border border-solid coz-stroke-primary',
              textClassName: 'text-current',
            },
            {
              color: 'brand-6',
              className: 'bg-brand-6 border-brand-6 border',
              textClassName: 'text-brand-6',
            },
            {
              color: 'purple-5',
              className: 'bg-purple-5 border-purple-5 border',
              textClassName: 'text-purple-5',
            },
            {
              color: 'green-5',
              className: 'bg-green-5 border-green-5 border',
              textClassName: 'text-green-5',
            },
            {
              color: 'yellow-5',
              className: 'bg-yellow-5 border-yellow-5 border',
              textClassName: 'text-yellow-5',
            },
            {
              color: 'red-5',
              className: 'bg-red-5 border-red-5 border',
              textClassName: 'text-red-5',
            },
          ].map(item => (
            <div
              onClick={() => {
                setColor(item.textClassName);
              }}
              key={item.textClassName}
              className={`flex items-center justify-center w-[32px] h-[32px] rounded-small cursor-pointer ${item.className} text-foreground-4`}
            >
              {color === item.textClassName ? <IconCozCheckMarkFill /> : <></>}
            </div>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          显示边框：
          <Switch checked={border} onChange={setBorder} size="small" />
        </div>
      </div>

      <Banner
        fullMode={false}
        description={
          <div className="text-foreground-2 flex gap-[48px] w-full">
            <div>
              使用方式：
              <br />
              {"import { Iconxxx } from '@coze/coze-design/icons';"}
              <br />
              {'<Iconxxx className="text-xxl text-red" />'}
              <br />
              Tips: 尺寸继承 font-size ，颜色继承 color
              <br />
            </div>
            <div>
              如果 iconBox 有新增 icon，但从 @coze/coze-design/icons
              包里找不到。
              <br />
              需要手动更新 @coze-arch/arco-icon 版本。
              <br />
              文件路径：packages/components/coze-design/package.json
              <br />
              包：@coze-arch/arco-icon
              <br />
              PS: 手动改版本号的问题我们在想办法解决。
            </div>
          </div>
        }
      />

      <div className="flex gap-8 flex-wrap">
        {Object.keys(icons)
          .filter(k => k.startsWith('Icon'))
          .map(k => {
            const Icon = icons[k];
            return (
              <div className="flex flex-col items-center gap-2 w-160px pb-20px">
                <div
                  className={`${
                    border
                      ? 'coz-stroke-plus border border-solid'
                      : 'border-transparent'
                  } border`}
                  style={{
                    fontSize: `${size}px`,
                  }}
                >
                  <Icon />
                </div>
                <div className="text-base" key={k}>
                  {k}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export const IconBox = {
  render: StateTemplate,
  args: {},
};
