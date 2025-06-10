/* eslint-disable @coze-arch/no-batch-import-or-export */
import { type StoryFn as Story, type Meta } from '@storybook/react';

import { EnhancedView, View } from '@/components/view';
import * as illustrations from '@/components/illustration';
import { IconCozIllusAddDark } from '@/components/illustration';
import { EmptyState } from '@/components/empty-state';

const {
  IconCozIllusDone,
  IconCozIllusDoneDark,
  IconCozIllusAdd,
  IconCozIllus404,
} = illustrations;

const meta: Meta = {
  title: 'Resource/Illustration',
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['default', 'small', 'large'],
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
  <EnhancedView>
    <View prop="variant" value="illustrations">
      <IconCozIllusDone width="120" height="120" {...args} />
      <IconCozIllusDoneDark width="120" height="120" {...args} />
    </View>
  </EnhancedView>
);

export const Size: Story = args => (
  <View prop="variant" value="size">
    <div className="flex flex-col gap-8 ">
      <div className="flex gap-8 flex-wrap">
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="mr-20px">
            <IconCozIllusDone width="120" height="120" />
          </div>
          <div>120 * 120</div>
        </div>
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="mr-20px">
            <IconCozIllus404 width="96" height="96" />
          </div>
          <div>96 * 96</div>
        </div>
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="mr-20px">
            <IconCozIllusAdd width="64" height="64" />
          </div>
          <div>64 * 64</div>
        </div>
      </div>
    </div>
  </View>
);

export const Empty: Story = args => (
  <View prop="variant" value="empty">
    <EmptyState
      {...args}
      size="full_screen"
      icon={<IconCozIllusAdd />}
      darkModeIcon={<IconCozIllusAddDark />}
      title="An error occurred"
      description="Please try again later"
    />
  </View>
);

export const IconBox: Story = args => (
  <div className="flex flex-col gap-8  overflow-hidden">
    <div className="flex gap-8 flex-wrap">
      {Object.keys(illustrations)
        .filter(k => k.startsWith('Icon'))
        .map(k => {
          const Illustration = illustrations[k];

          return (
            <div className="flex flex-col items-center gap-2 mt-4">
              <div className="mr-20px">
                <Illustration width="120" height="120" />
              </div>
              <div className="text-lg" key={k}>
                {k}
              </div>
              <div></div>
            </div>
          );
        })}
    </div>
  </div>
);
