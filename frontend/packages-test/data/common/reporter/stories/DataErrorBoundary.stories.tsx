import { DataErrorBoundary, DataNamespace } from '../src';

export default {
  title: 'DataErrorBoundary',
  component: DataErrorBoundary,
  parameters: {
    namespace: DataNamespace.KNOWLEDGE,
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Base = {
  args: {
    name: 'tecvan',
  },
};
