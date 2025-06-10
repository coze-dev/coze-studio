import { type StoryFn, type Meta } from '@storybook/react';

import { Tooltip } from '@/components/tooltip';

import { type DatePickerProps } from '../date-picker-type';
import { DatePicker, type DatePickerType } from '..';

const types: DatePickerType[] = [
  'date',
  'dateRange',
  'dateTime',
  'dateTimeRange',
  'month',
  'monthRange',
];

const meta: Meta = {
  title: 'Components/DatePicker',
  tags: ['autodocs'],
  component: DatePicker,
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {
    disabled: {
      type: 'boolean',
    },
    showPrefix: {
      type: 'boolean',
    },
    multiple: {
      type: 'boolean',
    },
    size: {
      options: ['default', 'small'],
      control: {
        type: 'select',
      },
    },
    type: {
      options: types,
      control: {
        type: 'select',
      },
    },
  },
};

export default meta;

export const Default: StoryFn<DatePickerProps> = function DefaultFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <h1>日期选择</h1>
          <DatePicker {...args} />
        </div>
        <div className="flex flex-col gap-2">
          <h1>日期范围选择</h1>
          <DatePicker type="dateRange" />
        </div>
      </div>
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <h1>年月选择</h1>
          <DatePicker defaultValue="2024-06-06" type="month" {...args} />
        </div>
        <div className="flex flex-col gap-2">
          <h1>年月范围选择</h1>
          <DatePicker type="monthRange" />
        </div>
      </div>
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <h1>日期选择 多选</h1>
          <DatePicker multiple={true} />
        </div>
      </div>
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <h1>默认值</h1>
          <DatePicker defaultValue="2024-03-07" />
        </div>
      </div>
      <div className="flex gap-8">
        <div className="flex flex-col gap-2">
          <h1>禁用</h1>
          <DatePicker disabled={true} />
        </div>
      </div>
    </div>
  );
};

Default.args = {
  showClear: true,
};

export const CustomRenderDate: StoryFn<DatePickerProps> =
  function CustomRenderDateFactory(args) {
    return (
      <DatePicker
        {...args}
        type="dateRange"
        disabledDate={date => {
          if (!date) {
            return false;
          } // Ensure date is not undefined
          const today = new Date();
          const oneWeekAhead = new Date(today);
          oneWeekAhead.setDate(today.getDate() + 7);
          return date > oneWeekAhead;
        }}
        renderDate={(dayNumber, fullDate) => {
          if (fullDate) {
            // fullDate is xxxx-xx-xx
            const date = new Date(fullDate);
            const today = new Date();
            const oneWeekAhead = new Date(today);
            oneWeekAhead.setDate(today.getDate() + 7);

            // If date is greater than one week ahead, return a tooltip
            if (date > oneWeekAhead) {
              return (
                <Tooltip content="超过一周">
                  <span>{dayNumber}</span>
                </Tooltip>
              );
            }
          }
          return <>{dayNumber}</>;
        }}
      />
    );
  };
