import { type Meta, type StoryFn } from '@storybook/react';

import { Tooltip } from '@/components/tooltip';
import { IconCozFace, IconCozInfoCircle } from '@/components/icon';

import { Tag, type TagProps } from '..';

const meta: Meta = {
  title: 'Components/Tag',
  tags: ['autodocs'],
  component: Tag,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

export const Default: StoryFn<TagProps> = function LoadingFactory(args) {
  return (
    <div className="flex gap-x-2">
      <Tag {...args} size="small">
        small
      </Tag>
      <Tag {...args} size="mini">
        mini
      </Tag>
    </div>
  );
};

Default.args = {};

export const Colors: StoryFn<TagProps> = function ColorFactory(args) {
  return (
    <div className="flex flex-col gap-x-2">
      {(
        [
          {
            title: 'normal',
            opt: {},
          },
          { title: 'interaction', opt: { onClick: () => {} } },
          { title: 'disabled', opt: { disabled: true } },
          { title: 'loading', opt: { loading: true } },
          {
            title: 'icon',
            opt: { color: '', prefixIcon: <IconCozFace />, onClick: () => {} },
          },
        ] as { title: string; opt: TagProps }[]
      ).map(data => (
        <div className="flex gap-x-2 mb-2">
          <div className="w-[100px]">{data.title}</div>
          {(
            [
              'brand',
              'primary',
              'green',
              'yellow',
              'red',
              'cyan',
              'blue',
              'purple',
              'magenta',
            ] as TagProps['color'][]
          ).map(color => (
            <Tag {...args} {...data.opt} color={color}>
              {data.opt.color ?? color}
            </Tag>
          ))}
        </div>
      ))}
    </div>
  );
};

export const Prefix: StoryFn<TagProps> = function PrefixFactory(args) {
  return (
    <div className="flex flex-col gap-x-2">
      {(['small', 'mini'] as TagProps['size'][]).map(size => (
        <div className="flex gap-x-2 mb-2">
          <Tag {...args} size={size} prefixIcon="info"></Tag>
          <Tag {...args} size={size}>
            Only Text
          </Tag>
          <Tag {...args} size={size} prefixIcon="info">
            PrefixIcon & Text
          </Tag>
          <Tag {...args} size={size} prefixIcon={<IconCozFace />}>
            Custom Icon
          </Tag>
        </div>
      ))}
    </div>
  );
};

export const Interaction: StoryFn<TagProps> = function InteractionFactory(
  args,
) {
  return (
    <div className="flex flex-col gap-x-2">
      {(['small', 'mini'] as TagProps['size'][]).map(size => (
        <div className="flex gap-x-2 mb-2">
          <Tag
            {...args}
            size={size}
            onClick={() => {
              console.log('click');
            }}
          >
            onClick
          </Tag>
          <Tag
            {...args}
            size={size}
            onClose={() => {
              console.log('onClose');
            }}
            closable
          >
            onClose
          </Tag>
        </div>
      ))}
    </div>
  );
};

export const Status: StoryFn<TagProps> = function StatusFactory(args) {
  return (
    <div className="flex flex-col gap-x-2">
      {(['small', 'mini'] as TagProps['size'][]).map(size => (
        <div className="flex gap-x-2 mb-2">
          <Tag {...args} size={size} loading>
            Loading
          </Tag>

          <Tag {...args} size={size} disabled>
            Disabled
          </Tag>

          <Tag {...args} size={size} loading disabled>
            Loading + Disabled
          </Tag>
        </div>
      ))}
    </div>
  );
};

export const InfoIcon: StoryFn<TagProps> = function InfoSuffixFactory(args) {
  return (
    <div className="flex space-x-4">
      <Tag
        {...args}
        suffixIcon={
          <Tooltip content="Info">
            <IconCozInfoCircle />
          </Tooltip>
        }
      >
        已完成
      </Tag>

      <Tag {...args} suffixIcon="info">
        已完成
      </Tag>

      <Tag {...args} prefixIcon="check">
        已完成
      </Tag>
    </div>
  );
};
