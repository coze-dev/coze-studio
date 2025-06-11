import { type StoryFn as Story, type Meta } from '@storybook/react';

import { EnhancedView, View } from '@/components/view';

import { SegmentTab, type SegmentTabProps } from '..';

const meta: Meta = {
  title: 'Components/SegmentTab',
  component: SegmentTab,
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['default', 'small'],
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

export const Default: Story<SegmentTabProps> = args => (
  <EnhancedView>
    <SegmentTab
      defaultValue={'Tab1'}
      options={['Tab1', 'Tab2', 'Tab3']}
      {...args}
    />
  </EnhancedView>
);

Default.args = {
  size: 'default',
};

export const Size: Story<SegmentTabProps> = args => (
  <View prop="size" value="small" justify="start">
    <div className="block w-full">
      <SegmentTab
        size="small"
        defaultValue={'Tab1'}
        options={['Tab1', 'Tab2', 'Tab3']}
        {...args}
      />
    </div>
  </View>
);

Size.args = {
  size: 'small',
};
