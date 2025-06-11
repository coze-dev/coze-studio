import {
  getDataTypeOptions,
  DataTypeSelect,
} from '../src/components/data-type-select';

export default {
  title: 'DataTypeSelect',
  component: DataTypeSelect,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
};
export const Base = {
  args: {
    value: getDataTypeOptions()[0]?.value,
  },
};
