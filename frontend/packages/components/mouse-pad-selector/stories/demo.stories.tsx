import { useState, useRef } from 'react';

import { GuidingPopover } from '../src/with-guiding-popover';
import { MousePadSelector, InteractiveType } from '../src';

const DemoComponent = () => {
  const [value, setValue] = useState(InteractiveType.Mouse);
  const handleChange = (v1: InteractiveType) => {
    console.log('innerDomRef is ', innerDomRef?.current);
    setValue(v1);
  };
  const innerDomRef = useRef(null);

  return (
    <GuidingPopover>
      <MousePadSelector
        value={value}
        onChange={handleChange}
        ref={innerDomRef}
      />
    </GuidingPopover>
  );
};

export default {
  title: 'Example/MousePadSelector',
  component: DemoComponent,
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
