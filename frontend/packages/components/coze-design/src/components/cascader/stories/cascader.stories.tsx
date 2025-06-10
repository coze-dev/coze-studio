import { type Meta, type StoryFn } from '@storybook/react';

import { Cascader, type CascaderProps } from '..';

const meta: Meta = {
  title: 'Components/Cascader',
  tags: ['autodocs'],
  component: Cascader,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const treeData = [
  {
    label: 'All Types',
    value: 'all_types',
  },
  {
    label: 'Workflow',
    value: 'workflow',
  },
  {
    label: 'Imageflow',
    value: 'imageflow',
  },
  {
    label: 'Plugin',
    value: 'plugin',
  },
  {
    label: 'Knowledge',
    value: 'knowledge',
    children: [
      {
        label: 'All Types',
        value: 'knowledge_all_types',
      },
      {
        label: 'Text',
        value: 'text',
      },
      {
        label: 'Table',
        value: 'table',
      },
      {
        label: 'Image',
        value: 'image',
      },
    ],
  },
  {
    label: 'UI',
    value: 'ui',
  },
  {
    label: 'UIi',
    value: 'uii',
    disabled: true,
  },
  {
    label: 'UIx',
    value: 'uix',
    disabled: true,
  },
  {
    label: 'UIxx',
    value: 'uixx',
    disabled: true,
    children: [
      {
        label: 'All Types',
        value: 'knowledge_all_types',
      },
      {
        label: 'Text',
        value: 'text',
      },
      {
        label: 'Table',
        value: 'table',
      },
      {
        label: 'Image',
        value: 'image',
      },
    ],
  },
];

export const Default: StoryFn<CascaderProps> = function DefaultFactory(args) {
  return (
    <Cascader
      {...args}
      placeholder="Please select"
      treeData={treeData}
      style={{ width: '200px' }}
      defaultValue={'uix'}
    />
  );
};

export const Multi: StoryFn<CascaderProps> = function MultiFactory(args) {
  return (
    <div>
      <div className="mb-1">multiple</div>
      <div className="flex items-center gap-2">
        <Cascader
          {...args}
          onChange={console.log}
          defaultValue={[['uix'], ['uixx', 'table']]}
          placeholder="Please select"
          treeData={treeData}
          maxTagCount={2}
          multiple
          showRestTagsPopover
        />
      </div>
    </div>
  );
};

export const ChangeOnSelect: StoryFn<CascaderProps> =
  function ChangeOnSelectFactory(args) {
    return (
      <div>
        <div className="mb-1">changeOnSelect</div>
        <Cascader
          {...args}
          placeholder="Please select"
          treeData={treeData}
          style={{ width: '200px' }}
          changeOnSelect
        />
      </div>
    );
  };

export const Sizes: StoryFn<CascaderProps> = function SizesFactory(args) {
  return (
    <div>
      <div className="mb-1">Sizes</div>
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1">Small</div>
          <Cascader
            {...args}
            placeholder="Please select"
            treeData={treeData}
            style={{ width: '200px' }}
            size="small"
          />
        </div>
        <div>
          <div className="mb-1">Default</div>
          <Cascader
            {...args}
            placeholder="Please select"
            treeData={treeData}
            style={{ width: '200px' }}
            size="default"
          />
        </div>
      </div>
    </div>
  );
};
