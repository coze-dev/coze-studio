/* eslint-disable @typescript-eslint/no-magic-numbers */

import { type Meta, type StoryFn } from '@storybook/react';
import { InputGroup } from '@douyinfe/semi-ui';

import { IconCozLoading } from '@/components/icon';

import { Select, type SelectProps } from '..';

const meta: Meta = {
  title: 'Components/Select',
  tags: ['autodocs'],
  component: Select,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const optionList = [];

for (let i = 0; i < 10; i++) {
  // @ts-expect-error -- linter-disable-autofix
  optionList.push({
    value: `value-${i}`,
    label: `label-${i}`,
    disabled: i < 5,
  });
}

export const Default: StoryFn<SelectProps> = function DefaultFactory(args) {
  return (
    <Select
      {...args}
      placeholder="Please select"
      optionList={optionList}
      style={{ width: '200px' }}
      showClear
    />
  );
};

export const Size: StoryFn<SelectProps> = function SizeFactory(args) {
  return (
    <div className="flex flex-col gap-2">
      <Select
        showClear={true}
        {...args}
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        size="large"
      />
      <Select
        {...args}
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        size="default"
      />

      <Select
        showClear={true}
        {...args}
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        size="small"
      />
    </div>
  );
};

export const Group: StoryFn<SelectProps> = function GroupFactory(args) {
  return (
    <div>
      <div className="mb-1"> showTick: true</div>
      <Select placeholder="" style={{ width: 180 }} filter>
        <Select.OptGroup label="Asia">
          <Select.Option value="a-1">China</Select.Option>
          <Select.Option value="a-2">Korea</Select.Option>
        </Select.OptGroup>
        <Select.OptGroup label="Europe">
          <Select.Option value="b-1">Germany</Select.Option>
          <Select.Option value="b-2">France</Select.Option>
        </Select.OptGroup>
        <Select.OptGroup label="South America">
          <Select.Option value="c-1">Peru</Select.Option>
        </Select.OptGroup>
      </Select>

      <div className="mb-1 mt-2"> showTick: false</div>
      <Select placeholder="" style={{ width: 180 }} filter showTick={false}>
        <Select.OptGroup label="Asia">
          <Select.Option value="a-1">China</Select.Option>
          <Select.Option value="a-2">Korea</Select.Option>
        </Select.OptGroup>
        <Select.OptGroup label="Europe">
          <Select.Option value="b-1">Germany</Select.Option>
          <Select.Option value="b-2">France</Select.Option>
        </Select.OptGroup>
        <Select.OptGroup label="South America">
          <Select.Option value="c-1">Peru</Select.Option>
        </Select.OptGroup>
      </Select>
    </div>
  );
};

export const Tick: StoryFn<SelectProps> = function TickFactory(args) {
  return (
    <div>
      <div className="mb-1">showTick: true</div>
      <Select
        {...args}
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        showTick
      />

      <Select
        {...args}
        className="ml-2"
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        defaultValue="value-1"
        showTick
      />

      <Select
        {...args}
        className="ml-2"
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        defaultValue="value-6"
        showTick
      />

      <div className="mt-2 mb-1">showTick: false</div>

      <Select
        {...args}
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        showTick={false}
      />

      <Select
        {...args}
        className="ml-2"
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        defaultValue="value-1"
        showTick={false}
      />

      <Select
        {...args}
        className="ml-2"
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        defaultValue="value-6"
        showTick={false}
      />
    </div>
  );
};

export const Status: StoryFn<SelectProps> = function StatusFactory(args) {
  return (
    <div>
      <div className="mb-1">disabled</div>
      <Select
        {...args}
        placeholder="Please select"
        disabled
        optionList={optionList}
        style={{ width: '200px' }}
        defaultValue="value-1"
      />

      <div className="mt-2 mb-1">option disabled</div>
      <Select
        {...args}
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
      />

      <Select
        {...args}
        className="ml-2"
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        defaultValue="value-1"
      />

      <Select
        {...args}
        className="ml-2"
        placeholder="Please select"
        optionList={optionList}
        style={{ width: '200px' }}
        defaultValue="value-6"
      />

      <Select
        {...args}
        className="ml-2"
        placeholder="Please select"
        optionList={optionList}
        multiple
        style={{ width: '200px' }}
        defaultValue={['value-4', 'value-5']}
      />

      <div className="mt-2 mb-1">hasError</div>
      <Select
        {...args}
        placeholder="Please select"
        hasError
        optionList={optionList}
        defaultValue={'value-1'}
        style={{ width: '200px' }}
      />
    </div>
  );
};

export const MultiSelect: StoryFn<SelectProps> = function MultiSelectFactory(
  args,
) {
  return (
    <div>
      <div>
        <Select
          {...args}
          allowCreate
          filter
          placeholder="Please select"
          prefix={<IconCozLoading className="text-lg mr-[4px] ml-[4px]" />}
          optionList={optionList}
          defaultValue={['value-1', 'value-2']}
          multiple
          showRestTagsPopover
        />
      </div>
      <div className="mt-2">
        <Select
          {...args}
          placeholder="Please select"
          prefix={<IconCozLoading className="text-lg mr-[4px] ml-[4px]" />}
          optionList={optionList}
          defaultValue={[
            'value-1',
            'value-2',
            'value-3',
            'value-4',
            'value-5',
            'value-6',
            'value-7',
            'value-8',
            'value-9',
          ]}
          maxTagCount={2}
          multiple
          ellipsisTrigger
          showRestTagsPopover
          // expandRestTagsOnClick
        />
      </div>
    </div>
  );
};
export const CustomIcon: StoryFn<SelectProps> = function CustomIconFactory(
  args,
) {
  return (
    <div>
      <div>
        <div className="mb-1">prefix</div>
        <Select
          {...args}
          placeholder="Please select"
          prefix={<IconCozLoading className="text-lg mr-[4px] ml-[4px]" />}
          optionList={optionList}
          defaultValue={'value-1'}
          style={{ width: '180px' }}
        />
      </div>
      <div className="mt-2">
        <div className="mb-1">suffix</div>
        <Select
          {...args}
          placeholder="Please select"
          suffix={<IconCozLoading className="text-lg mr-[5px] ml-[5px]" />}
          optionList={optionList}
          defaultValue={'value-1'}
          style={{ width: '180px' }}
        />
      </div>

      <div className="mt-2">
        <div className="mb-1">prefix + suffix</div>
        <Select
          {...args}
          placeholder="Please select"
          prefix={<IconCozLoading className="text-lg mr-[4px] ml-[4px]" />}
          suffix={<IconCozLoading className="text-lg mr-[5px] ml-[5px]" />}
          optionList={optionList}
          defaultValue={'value-1'}
          style={{ width: '180px' }}
        />
      </div>
    </div>
  );
};

export const SelectGroup: StoryFn<SelectProps> = function GroupFactory(args) {
  return (
    <div>
      <InputGroup>
        <Select placeholder="" style={{ width: 180 }} filter>
          <Select.Option value="a-1">China</Select.Option>
        </Select>
        <Select placeholder="" style={{ width: 180 }} filter>
          <Select.Option value="c-1">Peru</Select.Option>
        </Select>
      </InputGroup>
    </div>
  );
};

export const ChipMode: StoryFn<SelectProps> = function ChipModeFactory(args) {
  const options = [
    'brand',
    'primary',
    'green',
    'yellow',
    'red',
    'cyan',
    'blue',
    'purple',
    'magenta',
  ].map(color => ({
    label: color,
    value: color,
    chipColor: color,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <span>chipRender: selectedItem 单选</span>

        <Select
          {...args}
          chipRender={'selectedItem'}
          dropdownStyle={{ width: 200 }}
          optionList={options}
          defaultValue={'brand'}
        />
      </div>
      <div className="flex gap-4 items-center">
        <span>chipRender: selectedItem 多选</span>

        <Select
          {...args}
          multiple
          chipRender={'selectedItem'}
          dropdownStyle={{ width: 200 }}
          optionList={options}
          defaultValue={['primary', 'green']}
        />
      </div>

      <div className="flex gap-4 items-center">
        <span>chipRender: trigger</span>
        <Select
          {...args}
          chipRender={'trigger'}
          optionList={options}
          dropdownStyle={{ width: 200 }}
          defaultValue={'brand'}
        />
      </div>
    </div>
  );
};

export const SelectClear: StoryFn<SelectProps> = function GroupFactory(args) {
  return (
    <div>
      <Select
        style={{ width: 180 }}
        optionList={[
          { label: '1', value: 1 },
          { label: '2', value: 2 },
        ]}
        showClear
      />
      <Select
        size="small"
        style={{ width: 180 }}
        optionList={[
          { label: '1', value: 1 },
          { label: '2', value: 2 },
        ]}
        showClear
      />
    </div>
  );
};
