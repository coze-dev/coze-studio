import type { Meta, StoryFn } from '@storybook/react';

import { EnhancedView, View } from '@/components/view';
import { Tag } from '@/components/tag';
import { Input } from '@/components/input';
import { Button } from '@/components/button';

import { Tooltip } from '..';
import type { TooltipProps } from '..';

const meta: Meta = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  component: Tooltip,
  argTypes: {
    position: {
      options: [
        'top',
        'topLeft',
        'topRight',
        'left',
        'leftTop',
        'leftBottom',
        'right',
        'rightTop',
        'rightBottom',
        'bottom',
        'bottomLeft',
        'bottomRight',
        'leftTopOver',
        'rightTopOver',
        'leftBottomOver',
        'rightBottomOver',
      ],
      control: { type: 'select' },
    },
    theme: {
      options: ['light', 'dark'],
      control: { type: 'radio' },
    },
    visible: {
      options: [true, false],
      control: { type: 'radio' },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

const tops = [
  ['topLeft', 'TL'],
  ['top', 'Top'],
  ['topRight', 'TR'],
];
const lefts = [
  ['leftTop', 'LT'],
  ['left', 'Left'],
  ['leftBottom', 'LB'],
];
const rights = [
  ['rightTop', 'RT'],
  ['right', 'Right'],
  ['rightBottom', 'RB'],
];
const bottoms = [
  ['bottomLeft', 'BL'],
  ['bottom', 'Bottom'],
  ['bottomRight', 'BR'],
];

const getPopupContainer = () =>
  document.querySelector('#tooltip-container') as HTMLElement;

export default meta;

export const Default: StoryFn<TooltipProps> = args => (
  <EnhancedView>
    <Tooltip content="This is a tooltip." {...args}>
      <Tag color="primary">COZTooltip</Tag>
    </Tooltip>
  </EnhancedView>
);

Default.args = {
  position: 'bottom',
};

export const Theme: StoryFn<TooltipProps> = args => (
  <EnhancedView>
    <Tooltip content="This is a tooltip." {...args}>
      <Button color="highlight">COZTooltip</Button>
    </Tooltip>
  </EnhancedView>
);

Theme.args = {
  position: 'bottom',
  theme: 'light',
};

export const Position: StoryFn<TooltipProps> = args => (
  <View prop="variant" value="position">
    <div>
      <div className="w-full whitespace-nowrap flex justify-center items-center">
        {tops.map((pos, index) => (
          <Tooltip
            content={
              <article>
                <span>This is {pos[0]}</span>
              </article>
            }
            arrowPointAtCenter={false}
            position={pos[0] as TooltipProps['position']}
            key={`pos-${index}`}
          >
            <Button className="m-8px p-16px w-xl">{pos[1]}</Button>
          </Tooltip>
        ))}
      </div>
      <div className="w-xl float-left">
        {lefts.map((pos, index) => (
          <Tooltip
            content={
              <article>
                <span>This is {pos[0]}</span>
              </article>
            }
            arrowPointAtCenter={false}
            position={pos[0] as TooltipProps['position']}
            key={index}
          >
            <Button className="m-8px p-16px w-xl">{pos[1]}</Button>
          </Tooltip>
        ))}
      </div>
      <div className="ml-[300px] w-xl">
        {rights.map((pos, index) => (
          <Tooltip
            content={
              <article>
                <span>This is {pos[0]}</span>
              </article>
            }
            arrowPointAtCenter={false}
            position={pos[0] as TooltipProps['position']}
            key={index}
          >
            <Button className="m-8px p-16px w-xl">{pos[1]}</Button>
          </Tooltip>
        ))}
      </div>
      <div className="w-full clear-both whitespace-nowrap flex justify-center items-center">
        {bottoms.map((pos, index) => (
          <Tooltip
            content={
              <article>
                <span>This is {pos[0]}</span>
              </article>
            }
            arrowPointAtCenter={false}
            position={pos[0] as TooltipProps['position']}
            key={index}
          >
            <Button className="m-8px p-16px w-xl">{pos[1]}</Button>
          </Tooltip>
        ))}
      </div>
    </div>
  </View>
);

Position.args = {
  position: 'top',
};

export const Trigger: StoryFn<TooltipProps> = args => (
  <View prop="variant" value="trigger" justify="start">
    <div id="tooltip-container" className="w-320 h-320 relative">
      <div>
        <Tooltip content="hi Tooltip" getPopupContainer={getPopupContainer}>
          <Button theme="solid" className="mb-24px">
            悬停显示
          </Button>
        </Tooltip>
      </div>
      <div>
        <Tooltip
          content="hi Tooltip"
          trigger="click"
          getPopupContainer={getPopupContainer}
        >
          <Button className="mb-24px">点击显示</Button>
        </Tooltip>
      </div>
      <div>
        <Tooltip
          content="hi Tooltip"
          trigger="contextMenu"
          getPopupContainer={getPopupContainer}
        >
          <Button className="mb-24px">右键显示</Button>
        </Tooltip>
      </div>
      <div>
        <Tooltip
          content="hi Tooltip"
          trigger="focus"
          getPopupContainer={getPopupContainer}
        >
          <Input
            className="w-96px border m-0 text-base"
            placeholder="聚焦显示"
          />
        </Tooltip>
      </div>
    </div>
  </View>
);

Trigger.args = {};
