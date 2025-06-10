import { type StoryFn as Story, type Meta } from '@storybook/react';

import { Button } from '@/components/button';

import { Popover, type PopoverProps } from '..';

const meta: Meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
};

export default meta;

export const Default: Story<PopoverProps> = function defaultFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>Popover 默认用法</h1>
        <div id="popup-parent" className="relative">
          <Popover
            className="rounded"
            content={
              <article>
                Hi ByteDancer, this is a popover.
                <br /> We have 2 lines.
              </article>
            }
            trigger="click"
            position="bottom"
            showArrow
            style={{
              backgroundColor: 'var(--coz-fg-hglt-green)',
              borderColor: 'var(--coz-fg-hglt-green)',
              color: 'var(--coz-fg-hglt-plus)',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            <Button color="primary">click me</Button>
          </Popover>
        </div>
      </div>
    </div>
  );
};
