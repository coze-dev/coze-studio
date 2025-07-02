import { GuidingPopover } from '../src/with-guiding-popover';

// import { transform } from 'lodash-es';

const DemoComponent1 = () => (
  <GuidingPopover>
    <div>123</div>
  </GuidingPopover>
);

export default {
  title: 'Example/GuidingPopover',
  component: DemoComponent1,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Base = {
  args: {},
};
