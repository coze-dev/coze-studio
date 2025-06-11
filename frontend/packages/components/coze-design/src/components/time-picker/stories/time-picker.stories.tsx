import { type StoryFn, type Meta } from '@storybook/react';
import { type Type } from '@douyinfe/semi-ui/lib/es/timePicker/TimePicker';

import { TimePicker, type TimePickerProps } from '..';

const timePickerTypes: Type[] = ['time', 'timeRange'];

const meta: Meta = {
  title: 'Components/TimePicker',
  tags: ['autodocs'],
  component: TimePicker,
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {
    disabled: {
      type: 'boolean',
    },
    showIcon: {
      type: 'boolean',
    },
    showUnit: {
      type: 'boolean',
    },
    type: {
      options: timePickerTypes,
      control: {
        type: 'select',
      },
    },
    size: {
      options: ['small', 'default'],
      control: {
        type: 'select',
      },
    },
  },
};

export default meta;

export const Default: StoryFn<TimePickerProps> = function DefaultFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-8">
        <div>
          <div>time</div>
          <TimePicker {...args}></TimePicker>
        </div>
        <div>
          <div>time_period</div>
          <TimePicker type="timeRange" {...args}></TimePicker>
        </div>
      </div>
      <div className="flex gap-4">
        <div>
          <div>icon</div>
          <TimePicker {...args}></TimePicker>
        </div>
        <div>
          <div>no icon</div>
          <TimePicker showIcon={false} {...args}></TimePicker>
        </div>
      </div>
      <div>
        <div>disabled</div>
        <TimePicker {...args} disabled={true}></TimePicker>
      </div>
    </div>
  );
};
Default.args = {};

export const Size: StoryFn<TimePickerProps> = function SizeFactory(args) {
  return (
    <div className="flex gap-4">
      <div>
        <div>small</div>
        <TimePicker size="small" {...args} />
      </div>
      <div>
        <div>default</div>
        <TimePicker {...args} />
      </div>
      <div>
        <div>large</div>
        <TimePicker size="large" {...args} />
      </div>
    </div>
  );
};

export const Format: StoryFn<TimePickerProps> = function FormatFactory(args) {
  return (
    <div className="flex gap-4">
      <div>
        <div>hh:mm:ss</div>
        <TimePicker showUnit={false} format="HH:mm:ss" {...args}></TimePicker>
      </div>
      <div>
        <div>hh:mm</div>
        <TimePicker showUnit={false} format="HH:mm" {...args}></TimePicker>
      </div>
      <div>
        <div>hh:mm:ss unit on</div>
        <TimePicker format="HH:mm:ss" {...args}></TimePicker>
      </div>
      <div>
        <div>hh:mm unit on</div>
        <TimePicker format="HH:mm" {...args}></TimePicker>
      </div>
    </div>
  );
};
