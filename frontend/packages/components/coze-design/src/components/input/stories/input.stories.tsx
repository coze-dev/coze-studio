import { type StoryFn as Story, type Meta } from '@storybook/react';
import { Form as SemiForm } from '@douyinfe/semi-ui';

import { IconCozLoading } from '@/components/icon';
import { FormInput } from '@/components/form';
import { Button } from '@/components/button';

import { Input, type InputProps } from '..';

const meta: Meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
  argTypes: {
    size: {
      options: ['default', 'large', 'small'],
      control: { type: 'select' },
    },
  },
};

export default meta;

export const Default: Story<InputProps> = function defaultFactory(args) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="mb-2">基本用法</h1>
        <Input {...args} defaultValue="Coze Design" />
      </div>
      <div>
        <h1 className="mb-2">Disabled</h1>
        <Input {...args} disabled={true} value="this is disabled" />
      </div>
      <div>
        <h1 className="mb-2">Loading</h1>
        <Input {...args} loading={true} />
      </div>
      <div>
        <h1 className="mb-2">Error</h1>
        <Input {...args} error={true} />
      </div>
      <div>
        <h1 className="mb-2">Prefix</h1>
        <div className="flex gap-4">
          <Input {...args} prefix="prefix" />
          <Input
            {...args}
            prefix={<IconCozLoading className="text-lg text-foreground-4" />}
          />
        </div>
      </div>
      <div>
        <h1 className="mb-2">Suffix</h1>
        <div className="flex gap-4">
          <Input {...args} suffix="suffix" />
          <Input
            {...args}
            suffix={<IconCozLoading className="text-lg text-foreground-4" />}
          />
          <Input
            {...args}
            suffix={
              <Button
                color="secondary"
                size="small"
                icon={<IconCozLoading className="text-lg text-foreground-4" />}
              ></Button>
            }
          />
        </div>
      </div>
      <div>
        <h1 className="mb-2">Max Length</h1>
        <div className="flex gap-4">
          <Input {...args} maxLength={10} />
        </div>
      </div>
      <div>
        <h1 className="mb-2">Size</h1>
        <div className="flex flex-col gap-4">
          <Input {...args} size="small" placeholder="Small size" />
          <Input {...args} placeholder="default size" />
        </div>
      </div>
    </div>
  );
};

export const Form: Story<InputProps> = function formFactory(args) {
  return (
    <div>
      <SemiForm showValidateIcon={false}>
        <FormInput
          label="Name"
          field="name"
          rules={[
            {
              message: '请输入名称',
              required: true,
            },
          ]}
        ></FormInput>
        <FormInput
          label="Name"
          size="small"
          field="name"
          rules={[
            {
              message: '请输入名称',
              required: true,
            },
          ]}
        ></FormInput>
      </SemiForm>
    </div>
  );
};

export const Size = () => (
  <div className="flex flex-col gap-4">
    <Input size="small" placeholder="Small size" />
    <Input size="default" placeholder="default size" />
    <Input size="large" placeholder="large size" />
  </div>
);

Default.args = {
  className: 'w-48',
  placeholder: 'Please enter',
  maxLength: 50,
};
