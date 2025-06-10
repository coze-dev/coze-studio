import { type Meta } from '@storybook/react';

import { Form, FormInput, FormSelect } from '@/index';

const meta: Meta = {
  title: 'Components/Form',
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
};

export default meta;

export const Default = function defaultFactory(args) {
  return (
    <div className="flex flex-col gap-16">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Form<any> layout="horizontal" initValues={{}} onValueChange={() => {}}>
        <FormInput
          noLabel
          // prefix={<IconSearch />}
          field="search_name"
          placeholder="搜索名称"
          className="!w-[360px]"
          // showClear
        />
        {/* todo UserSelect */}
        <FormSelect
          noLabel
          field="creator_ids"
          className="w-[144px]"
          multiple
          placeholder={'所有创建人'}
          // showClear
        />
        <FormSelect
          noLabel
          field="evaluator_type"
          className="w-[144px]"
          multiple
          placeholder={'所有类型'}
          optionList={[]}
          // showClear
        />
      </Form>
    </div>
  );
};

Default.args = {};
