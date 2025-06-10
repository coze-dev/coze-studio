import { useState } from 'react';

import Box from 'ui-box';
import { type StoryFn, type Meta } from '@storybook/react';

import { EnhancedView, ViewGroup, View } from '@/components/view';
import {
  IconCozArrowDown,
  IconCozArrowUp,
  IconCozEdit,
  IconCozPeopleFill,
} from '@/components/icon';

import type {
  ButtonProps,
  ButtonColor,
  ButtonSize,
  AIButtonProps,
  SplitButtonProps,
} from '..';
import { Button, IconButton, AIButton, SplitButton, LoadingButton } from '..';

const colors: ButtonColor[] = [
  'hgltplus',
  'red',
  'yellow',
  'highlight',
  'primary',
  'secondary',
  'redhglt',
];

const sizes: ButtonSize[] = ['default', 'large', 'small', 'mini'];

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: [''],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: sizes,
    },
    color: {
      control: { type: 'select' },
      options: colors,
    },
    iconPosition: {
      options: ['left', 'right'],
      control: {
        type: 'radio',
      },
    },
    disabled: {
      control: {
        type: 'boolean',
      },
    },
    loading: {
      control: {
        type: 'boolean',
      },
    },
  },
  decorators: [
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Story => (
      <Box className="mb-2">
        <Story />
      </Box>
    ),
  ],
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
};

export default meta;

const defaultProps = {
  color: 'highlight',
  size: 'default',
} satisfies ButtonProps;

export const Default: StoryFn<ButtonProps> = args => (
  <EnhancedView prop="default">
    <Button {...args} icon={<IconCozPeopleFill className="text-lg" />}>
      COZButton
    </Button>
  </EnhancedView>
);

Default.args = {
  ...defaultProps,
  loading: false,
  disabled: false,
  iconPosition: 'left',
};

export const Buttons: StoryFn<ButtonProps> = args => (
  <View prop="type" value="button" justify="start">
    <IconButton icon={<IconCozPeopleFill className="text-xxl" />} {...args} />
    <Button {...args}>COZButton</Button>
    <LoadingButton {...args} loadingToast="加载中...">
      LoadingButton
    </LoadingButton>
    <AIButton {...args} color="aihglt">
      Button
    </AIButton>
    <SplitButton iconPosition="left" {...args} icon={<IconCozPeopleFill />}>
      SplitButton
    </SplitButton>
  </View>
);

Buttons.args = {
  color: 'highlight',
  loading: false,
  disabled: false,
  iconPosition: 'left',
};

export const Colors: StoryFn<ButtonProps> = args => (
  <ViewGroup>
    <View prop="variant" value="color" justify="start">
      <div className="flex space-x-2">
        <Button {...args} color="hgltplus">
          hgltplus
        </Button>
        <Button {...args} color="highlight">
          highlight
        </Button>
        <Button {...args} color="primary">
          primary
        </Button>
        <Button {...args} color="secondary">
          secondary
        </Button>
        <Button {...args} color="yellow">
          yellow
        </Button>
        <Button {...args} color="green">
          green
        </Button>
        <Button {...args} color="red">
          red
        </Button>
        <Button {...args} color="redhglt">
          redlhglt
        </Button>
      </div>
    </View>
  </ViewGroup>
);

Colors.args = {
  ...defaultProps,
};

export const Sizes: StoryFn<ButtonProps> = args => (
  <View prop="variant" value="size" justify="start">
    <div className="flex space-x-2">
      <Button {...args} size="large">
        large
      </Button>
      <Button {...args} size="default">
        default
      </Button>
      <Button {...args} size="small">
        small
      </Button>
      <Button {...args} size="mini">
        mini
      </Button>
    </div>
  </View>
);

Sizes.args = {
  ...defaultProps,
  color: 'highlight',
};

export const Loading: StoryFn<ButtonProps> = args => (
  <View prop="variant" value="loading" justify="start">
    <div className="flex space-x-2">
      <Button {...args} size="large">
        loading...
      </Button>
      <Button {...args} size="default">
        loading...
      </Button>
      <Button {...args} size="small">
        loading...
      </Button>
      <Button {...args} size="mini">
        loading...
      </Button>
    </div>
  </View>
);

Loading.args = {
  ...defaultProps,
  loading: true,
};

export const Disabled: StoryFn<ButtonProps> = args => (
  <ViewGroup>
    <View prop="variant" value="disabled" justify="start">
      <div className="flex space-x-2">
        <Button {...args} color="hgltplus">
          hgltplus
        </Button>
        <Button {...args} color="highlight">
          highlight
        </Button>
        <Button {...args} color="primary">
          primary
        </Button>
        <Button {...args} color="secondary">
          secondary
        </Button>
        <Button {...args} color="yellow">
          yellow
        </Button>
        <Button {...args} color="green">
          green
        </Button>
        <Button {...args} color="red">
          red
        </Button>
        <Button {...args} color="redhglt">
          redhglt
        </Button>
      </div>
    </View>
  </ViewGroup>
);

Disabled.args = {
  ...defaultProps,
  disabled: true,
};

export const IconButtons: StoryFn<ButtonProps> = args => (
  <ViewGroup>
    <View prop="variant" value="iconButton" justify="start">
      <div className="flex space-x-2">
        <IconButton
          {...args}
          size="large"
          icon={<IconCozPeopleFill className="text-18px" />}
        />
        <IconButton
          {...args}
          size="default"
          icon={<IconCozPeopleFill className="text-xxl" />}
        />
        <IconButton
          {...args}
          size="small"
          icon={<IconCozPeopleFill className="text-sm" />}
        />
        <IconButton
          {...args}
          size="mini"
          icon={<IconCozPeopleFill className="text-base" />}
        />
      </div>
    </View>
    <View prop="variant" value="iconButton" justify="start">
      <div className="flex space-x-2">
        <IconButton
          {...args}
          size="large"
          color="secondary"
          icon={<IconCozEdit className="text-18px" />}
        />
        <IconButton
          {...args}
          size="default"
          color="secondary"
          icon={<IconCozEdit className="text-xxl" />}
        />
        <IconButton
          {...args}
          size="small"
          color="secondary"
          icon={<IconCozEdit className="text-sm" />}
        />
        <IconButton
          {...args}
          size="mini"
          color="secondary"
          icon={<IconCozEdit className="text-base" />}
        />
      </div>
    </View>
  </ViewGroup>
);

IconButtons.args = {
  ...defaultProps,
  color: 'brand',
  iconPosition: 'left',
};

export const WithIcon: StoryFn<ButtonProps> = args => (
  <View prop="variant" value="icons" justify="start">
    <div className="flex space-x-2">
      <IconButton
        {...args}
        size="large"
        icon={<IconCozArrowUp className="text-18px" />}
      >
        expand
      </IconButton>
      <IconButton
        {...args}
        size="default"
        iconPosition="right"
        icon={<IconCozArrowDown className="text-xxl" />}
      >
        collapse
      </IconButton>
      <IconButton
        {...args}
        size="small"
        icon={<IconCozPeopleFill className="text-lg" />}
      >
        <div className="flex justify-center items-center">
          <span className="pr-5px">Button</span>
          <IconCozArrowDown />
        </div>
      </IconButton>
      <IconButton
        {...args}
        size="mini"
        icon={<IconCozPeopleFill className="text-base" />}
      >
        Button
      </IconButton>
    </div>
  </View>
);

WithIcon.args = {
  ...defaultProps,
  color: 'brand',
  iconPosition: 'left',
};

export const SplitBtn: StoryFn<SplitButtonProps> = args => (
  <View prop="variant" value="icons" justify="start">
    <div className="flex space-x-2">
      <SplitButton {...args}>SplitButton</SplitButton>
      <SplitButton {...args} icon={<IconCozPeopleFill />}>
        SplitButton
      </SplitButton>
    </div>
  </View>
);

SplitBtn.args = {
  ...defaultProps,
  color: 'brand',
  iconPosition: 'left',
};

export const WithAI: StoryFn<AIButtonProps> = args => (
  <ViewGroup>
    <View prop="variant" value="AIButton" justify="start">
      <div className="flex space-x-2">
        <AIButton {...args} color="aiplus">
          AIButton
        </AIButton>
        <AIButton {...args} color="aihglt">
          AIButton
        </AIButton>
        <AIButton {...args} color="aiprimary">
          AIButton
        </AIButton>
      </div>
    </View>
  </ViewGroup>
);

WithAI.args = {
  ...defaultProps,
  iconPosition: 'left',
};

export const OnlyAIIcon: StoryFn<AIButtonProps> = args => (
  <ViewGroup>
    <View prop="variant" value="onlyIcon" justify="start">
      <div className="flex space-x-2">
        <AIButton {...args} color="aiplus" hideIcon={true} />
        <AIButton {...args} color="aihglt" />
        <AIButton {...args} color="aiprimary" />
      </div>
    </View>
  </ViewGroup>
);

OnlyAIIcon.args = {
  ...defaultProps,
  onlyIcon: true,
  iconPosition: 'left',
};

export const HideAIIcon: StoryFn<AIButtonProps> = args => (
  <ViewGroup>
    <View prop="hideIcon" value="true" justify="start">
      <div className="flex space-x-2">
        <AIButton {...args} color="aiplus" hideIcon loading={true}>
          AIButton
        </AIButton>
        <AIButton {...args} color="aihglt" hideIcon>
          AIButton
        </AIButton>
        <AIButton {...args} color="aiprimary" hideIcon>
          AIButton
        </AIButton>
      </div>
    </View>
  </ViewGroup>
);

HideAIIcon.args = {
  ...defaultProps,
  iconPosition: 'left',
};

const StateTemplate = (args: ButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <View prop="variant" value="state" justify="start">
      <Button
        {...args}
        aria-label="Open"
        aria-pressed={isOpen}
        onClick={handlePress}
      >
        click change
      </Button>
      <div className="coz-fg-plus mt-1">state: {isOpen ? 'close' : 'open'}</div>
    </View>
  );
};

export const WithState = {
  render: StateTemplate,
  args: {
    ...defaultProps,
  },
};
