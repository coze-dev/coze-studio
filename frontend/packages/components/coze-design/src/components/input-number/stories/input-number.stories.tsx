import { type StoryFn as Story, type Meta } from '@storybook/react';

import { EnhancedView, View, ViewGroup } from '@/components/view';

import { CozInputNumber } from '../input-number-new';
import { InputNumber, type InputNumberProps } from '..';

const meta: Meta = {
  title: 'Components/InputNumber',
  component: CozInputNumber,
  tags: [''],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
  argTypes: {
    disabled: {
      control: {
        type: 'boolean',
      },
    },
    error: {
      control: {
        type: 'boolean',
      },
    },
    hideButtons: {
      control: {
        type: 'boolean',
      },
    },
  },
};

export default meta;

const defaultValues = {
  defaultValue: 0,
};

export const NewStyle: Story<InputNumberProps> = args => (
  <EnhancedView prop="newStyle">
    <CozInputNumber {...args} />
  </EnhancedView>
);

NewStyle.args = {
  ...defaultValues,
};

export const Default: Story<InputNumberProps> = function defaultFactory(args) {
  return (
    <ViewGroup>
      <View prop="variant" value="default" justify="start">
        <InputNumber {...args} defaultValue={1} min={1} max={10} />
      </View>
      <View prop="variant" value="disabled" justify="start">
        <InputNumber {...args} disabled={true} />
      </View>
      <View prop="variant" value="error" justify="start">
        <InputNumber {...args} error={true} />
      </View>
      <View prop="variant" value="prefix/suffix" justify="start">
        <>
          <InputNumber {...args} prefix="prefix" />
          <InputNumber {...args} suffix="suffix" />
          <InputNumber {...args} prefix="prefix" suffix="suffix" />
        </>
      </View>
      <View prop="variant" value="hiddenButtons" justify="start">
        <>
          <InputNumber {...args} hideButtons={true} />
          <InputNumber {...args} hideButtons={true} prefix="prefix" />
          <InputNumber {...args} hideButtons={true} suffix="suffix" />
          <InputNumber
            {...args}
            hideButtons={true}
            prefix="prefix"
            suffix="suffix"
          />
        </>
      </View>
    </ViewGroup>
  );
};

Default.args = {
  ...defaultValues,
  className: 'w-200px',
};

export const Size: Story<InputNumberProps> = function sizeFactory(args) {
  return (
    <View prop="variant" value="size" justify="start">
      <div className="w-full flex flex-col gap-12px">
        <div>default</div>
        <CozInputNumber {...args} size="default" />
        <div>small</div>
        <CozInputNumber {...args} size="small" />
      </div>
    </View>
  );
};

Size.args = {
  ...defaultValues,
};

export const HideButtons: Story<InputNumberProps> = function hideButtonsFactory(
  args,
) {
  return (
    <View prop="variant" value="hideButtons" justify="start">
      <CozInputNumber
        {...args}
        hideButtons={true}
        placeholder={'placehooooooooooooooooooooooooder'}
      />
      <CozInputNumber
        {...args}
        size="small"
        hideButtons={true}
        placeholder={'placehooooooooooooooooooooooooder'}
      />
    </View>
  );
};

export const SlideControl = (args: InputNumberProps) => (
  <View prop="variant" value="hideButtons" justify="start">
    <CozInputNumber
      {...args}
      prefix="prefix"
      defaultValue={10}
      suffix="suffix"
      sliderControl={true}
      step={0.01}
    />
    <CozInputNumber
      {...args}
      prefix="prefix"
      suffix="suffix"
      step={0.01}
      sliderControl={true}
      hideButtons={false}
    />
    <CozInputNumber
      {...args}
      prefix="prefix"
      suffix="suffix"
      step={0.01}
      sliderControl={true}
      hideButtons={false}
      innerButtons={false}
    />
  </View>
);
