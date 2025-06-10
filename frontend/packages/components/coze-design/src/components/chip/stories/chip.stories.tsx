import type { Meta, StoryObj } from '@storybook/react';

import type { IChipColor, IChipStyle } from '../chip-types';
import { Chip } from '../chip';

const meta = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'mini'],
      description: 'Size of the chip',
    },
    color: {
      control: 'select',
      options: [
        'brand',
        'primary',
        'green',
        'yellow',
        'red',
        'cyan',
        'blue',
        'purple',
        'magenta',
      ],
      description: 'Color variant of the chip',
    },
    chipStyle: {
      control: 'select',
      options: ['remove', 'select', 'readonly'],
      description: 'Style variant of the chip',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the chip is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the chip is in loading state',
    },
    children: {
      control: 'text',
      description: 'Content of the chip',
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    children: 'Basic Chip',
  },
};

export const Size: Story = {
  render: () => (
    <div className="flex gap-4">
      <Chip size="small">small</Chip>
      <Chip size="mini">mini</Chip>
    </div>
  ),
};

export const Color: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Chip color="brand">brand</Chip>
        <Chip color="primary">primary</Chip>
        <Chip color="green">green</Chip>
        <Chip color="yellow">yellow</Chip>
        <Chip color="red">red</Chip>
        <Chip color="cyan">cyan</Chip>
        <Chip color="blue">blue</Chip>
        <Chip color="purple">purple</Chip>
        <Chip color="magenta">magenta</Chip>
      </div>
    </div>
  ),
};

export const ChipStyle: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {['remove', 'select', 'readonly'].map(style => (
        <div key={style} className="flex flex-col gap-2">
          <div className="text-sm text-gray-500 mb-1">{style}</div>
          <div className="flex gap-4">
            <Chip chipStyle={style as IChipStyle} color="brand">
              brand
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="primary">
              primary
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="green">
              green
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="yellow">
              yellow
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="red">
              red
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="cyan">
              cyan
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="blue">
              blue
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="purple">
              purple
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="magenta">
              magenta
            </Chip>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {['remove', 'select', 'readonly'].map(style => (
        <div key={style} className="flex flex-col gap-2">
          <div className="text-sm text-gray-500 mb-1">{style}</div>
          <div className="flex gap-4">
            <Chip chipStyle={style as IChipStyle} color="brand" disabled>
              brand
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="primary" disabled>
              primary
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="green" disabled>
              green
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="yellow" disabled>
              yellow
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="red" disabled>
              red
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="cyan" disabled>
              cyan
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="blue" disabled>
              blue
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="purple" disabled>
              purple
            </Chip>
            <Chip chipStyle={style as IChipStyle} color="magenta" disabled>
              magenta
            </Chip>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {['remove', 'select', 'readonly'].map(style => (
        <div key={style} className="flex flex-col gap-2">
          <div className="text-sm text-gray-500 mb-1">{style}</div>
          <div className="flex gap-4">
            {[
              'brand',
              'primary',
              'green',
              'yellow',
              'red',
              'cyan',
              'blue',
              'purple',
              'magenta',
            ].map(color => (
              <Chip
                key={color}
                chipStyle={style as IChipStyle}
                color={color as IChipColor}
                loading
              >
                {color}
              </Chip>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};
