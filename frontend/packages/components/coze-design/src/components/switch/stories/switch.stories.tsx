import React, { useState } from 'react';

import { type StoryFn, type Meta } from '@storybook/react';

import { Switch, type SwitchProps } from '..';

const meta: Meta = {
  title: 'Components/Switch',
  tags: ['autodocs'],
  component: Switch,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

export const Default: StoryFn<SwitchProps> = function DefaultFactory(args) {
  return <Switch {...args} />;
};

Default.args = {};

export const Size: StoryFn<SwitchProps> = function SizeFactory(args) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {(['default', 'small', 'mini'] as SwitchProps['size'][]).map(size => (
          <Switch {...args} size={size} />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        {(['default', 'small', 'mini'] as SwitchProps['size'][]).map(size => (
          <Switch {...args} size={size} defaultChecked />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        {(['default', 'small', 'mini'] as SwitchProps['size'][]).map(size => (
          <Switch {...args} size={size} loading />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        {(['default', 'small', 'mini'] as SwitchProps['size'][]).map(size => (
          <Switch {...args} size={size} defaultChecked loading />
        ))}
      </div>
    </div>
  );
};

export const Checked: StoryFn<SwitchProps> = function CheckedFactory(args) {
  const [checked, setChecked] = useState(false);
  return (
    <div>
      <div>不受控</div>
      <div className="flex items-center gap-2">
        {[false, true].map(defaultChecked => (
          <Switch {...args} defaultChecked={defaultChecked} />
        ))}
      </div>
      <div className="mt-2">受控：{`${checked}`}</div>
      <div className="flex items-center gap-2">
        <Switch
          {...args}
          checked={checked}
          onChange={v => {
            setChecked(v);
          }}
        />
      </div>
    </div>
  );
};

export const Status: StoryFn<SwitchProps> = function StatusFactory(args) {
  return (
    <div>
      <div>disabled</div>
      <div className="flex items-center gap-2">
        <Switch {...args} checked={true} disabled={true} />
        <Switch {...args} checked={false} disabled={true} />
      </div>

      <div className="mt-2">loading</div>
      <div className="flex items-center gap-2">
        <Switch {...args} checked={true} loading={true} />
        <Switch {...args} checked={false} loading={true} />
      </div>

      <div className="mt-2">disabled + loading</div>
      <div className="flex items-center gap-2">
        <Switch {...args} checked={true} loading={true} disabled={true} />
        <Switch {...args} checked={false} loading={true} disabled={true} />
      </div>
    </div>
  );
};
