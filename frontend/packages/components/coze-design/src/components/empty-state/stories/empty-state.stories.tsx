import { type StoryFn as Story, type Meta } from '@storybook/react';

import { Toast } from '@/components/toast';
import {
  IconCozIllusAdd,
  IconCozIllusAddDark,
  IconCozIllus404,
  IconCozIllus404Dark,
} from '@/components/illustration';
import { IconCozWarningCircle } from '@/components/icon';

import { EmptyState, type EmptyStateProps } from '..';

const meta: Meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
};

export default meta;

export const Size: Story<EmptyStateProps> = function defaultFactory(args) {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-2">
        <h2>default: 32 * 32</h2>
        <EmptyState
          {...args}
          size="default"
          icon={<IconCozWarningCircle className="coz-fg-dim text-32px" />}
          darkModeIcon={
            <IconCozWarningCircle className="coz-fg-dim text-32px" />
          }
          title="An error occurred"
          description="Please try again later"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h2>large: 48 * 48</h2>
        <EmptyState
          {...args}
          size="large"
          icon={<IconCozWarningCircle className="coz-fg-dim text-48px" />}
          darkModeIcon={
            <IconCozWarningCircle className="coz-fg-dim text-48px" />
          }
          title="An error occurred"
          description="Please try again later"
        />
      </div>
      <div className="flex flex-col  gap-2">
        <h2>custom: 64 * 64</h2>
        <EmptyState
          {...args}
          size="default"
          icon={<IconCozIllus404 width="96" height="96" />}
          darkModeIcon={<IconCozIllus404Dark width="96" height="96" />}
          title="An error occurred"
          description="Please try again later"
        />
      </div>
    </div>
  );
};

Size.args = {};

export const fullScreen: Story<EmptyStateProps> = function defaultFactory(
  args,
) {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-2">
        <h2>全屏尺寸</h2>
        <EmptyState
          {...args}
          size="full_screen"
          icon={<IconCozIllusAdd />}
          darkModeIcon={<IconCozIllusAddDark />}
          title="An error occurred"
          description="Please try again later"
        />
      </div>
    </div>
  );
};

fullScreen.args = {};

export const withButton: Story<EmptyStateProps> = function defaultFactory(
  args,
) {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-2">
        <h1>Button</h1>
        <EmptyState
          {...args}
          title="An error occurred"
          buttonText="Retry"
          icon={<IconCozWarningCircle />}
          description="Please try again later"
          onButtonClick={() => {
            Toast.info({
              content: 'retry',
            });
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h1>Extra</h1>
        <EmptyState
          {...args}
          buttonText="Retry"
          extra={<div className="py-8px coz-fg-primary text-lg">Extra</div>}
          icon={<IconCozWarningCircle />}
          title="An error occurred"
          description="Please try again later"
          onButtonClick={() => {
            Toast.info({
              content: 'retry with extra',
            });
          }}
        />
      </div>
    </div>
  );
};

withButton.args = {};
