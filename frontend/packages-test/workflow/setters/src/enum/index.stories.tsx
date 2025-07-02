import type { StoryObj, Meta } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { Enum } from './enum';

const meta: Meta<typeof Enum> = {
  title: 'workflow setters/Enum',
  component: Enum,
  tags: ['autodocs'],
  args: {
    value: '1',
    options: [
      {
        value: '1',
        label: 'single',
      },
      {
        value: '2',
        label: 'batch',
      },
    ],
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
    const [, updateArgs] = useArgs();

    return (
      <Enum
        {...args}
        onChange={newValue => {
          updateArgs({ ...args, value: newValue });
        }}
      />
    );
  },
};

export default meta;

type Story = StoryObj<typeof Enum>;

export const Base: Story = {};

export const Readonly: Story = {
  args: {
    value: '1',
    options: [
      {
        value: '1',
        label: 'single',
      },
      {
        value: '2',
        label: 'batch',
      },
    ],
    readonly: true,
  },
  render: args => {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- linter-disable-autofix
    const [, updateArgs] = useArgs();
    const buttonArgs = JSON.parse(JSON.stringify(args));

    buttonArgs.options.mode = 'button';

    return (
      <>
        <div style={{ marginBottom: 10 }}>
          <Enum
            {...args}
            onChange={newValue => {
              updateArgs({ ...args, value: newValue });
            }}
          />
        </div>
        <div>
          <Enum
            {...buttonArgs}
            onChange={newValue => {
              updateArgs({ ...args, value: newValue });
            }}
          />
        </div>
      </>
    );
  },
};
