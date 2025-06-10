import { type StoryFn as Story, type Meta } from '@storybook/react';

import { EnhancedView, View, ViewGroup } from '@/components/view';

import {
  Typography,
  type TitleProps,
  type TextProps,
  type TitleSize,
} from '..';

const sizes: TitleSize[] = ['28px', '20px', '16px', '14px', '12px'];

const meta: Meta = {
  title: 'Components/Typography',
  component: Typography,
  tags: [''],
  argTypes: {
    heading: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6],
    },
    size: {
      control: { type: 'select' },
      options: sizes,
    },
  },
  parameters: {
    docs: {
      page: null,
    },
    controls: { expanded: true },
  },
};

export default meta;

const {
  Title: COZTitle,
  Text: COZText,
  Paragraph: COZParagraph,
  Numeral: COZNumeral,
} = Typography;

export const Default: Story<TitleProps> = args => (
  <EnhancedView>
    <View prop="variant" value="size">
      <COZTitle heading={1} {...args}>
        默认标题（H1）
      </COZTitle>
    </View>
  </EnhancedView>
);

Default.args = {
  heading: 1,
};

export const Type: Story<TitleProps> = args => (
  <View prop="variant" value="type" justify="start">
    <div className="flex flex-col gap-8">
      <COZTitle heading={3}>标题Title</COZTitle>
      <COZText size="normal">文字Text</COZText>
      <COZParagraph size="normal">段落Paragraph</COZParagraph>
      <COZNumeral className="coz-fg-primary" precision={2}>
        <p>数字Numeral：1.6111e1 K</p>
      </COZNumeral>
    </div>
  </View>
);

export const Title: Story<TitleProps> = function defaultFactory(args) {
  return (
    <ViewGroup>
      <View prop="title" value="inherit" justify="start">
        <div className="flex flex-col gap-2">
          <COZTitle heading={1}>默认标题（H1）</COZTitle>
          <COZTitle heading={2}>默认标题（H2）</COZTitle>
          <COZTitle heading={3}>默认标题（H3）</COZTitle>
          <COZTitle heading={4}>默认标题（H4）</COZTitle>
        </div>
      </View>
      <View prop="title" value="fontSize" justify="start">
        <div className="flex flex-col gap-2">
          <COZTitle fontSize="28px">COZTitle28（特大标题）</COZTitle>
          <COZTitle fontSize="20px">COZTitle20（大标题）</COZTitle>
          <COZTitle fontSize="16px">COZTitle16（标题）</COZTitle>
          <COZTitle fontSize="14px">COZTitle14（小标题）</COZTitle>
          <COZTitle fontSize="12px">COZTitle12（特小标题）</COZTitle>
        </div>
      </View>
      <View prop="title" value="className" justify="start">
        <div className="flex flex-col gap-2">
          <COZTitle className="coz-fg-primary !text-22px">
            COZTitle22（自定义22px字号）
          </COZTitle>
          <COZTitle fontSize="20px" className="coz-fg-hglt-green">
            COZTitle20（自定义颜色）
          </COZTitle>
          <COZTitle fontSize="16px" className="coz-fg-primary !leading-28px">
            COZTitle16（自定义行高）
          </COZTitle>
        </div>
      </View>
    </ViewGroup>
  );
};

export const Text: Story<TextProps> = args => (
  <ViewGroup>
    <View prop="variant" value="text" justify="start">
      <div className="flex flex-col gap-2">
        <COZText size="normal">默认文字normal</COZText>
        <COZText size="small">默认文字small</COZText>
        <COZText size="inherit" className="coz-fg-hglt-blue">
          默认文字inherit
        </COZText>
      </div>
    </View>
    <View prop="variant" value="fontSize" justify="start">
      <div className="flex flex-col gap-2">
        <COZText fontSize="16px">COZText16（大文字）</COZText>
        <COZText fontSize="14px">COZText14（标准文字）</COZText>
        <COZText fontSize="12px">COZText12（小文字）</COZText>
        <COZText fontSize="10px">COZText10（特小文字）</COZText>
      </div>
    </View>
  </ViewGroup>
);

export const Paragraph: Story<TextProps> = function defaultFactory(args) {
  return (
    <View prop="variant" value="paragraph" justify="start">
      <div className="flex flex-col gap-2">
        <COZTitle fontSize="20px">展开折叠</COZTitle>
        <COZParagraph
          ellipsis={{
            rows: 3,
            expandable: true,
            collapsible: true,
            collapseText: '折叠我吧',
            onExpand: (bool, e) => console.log(bool, e),
          }}
          className="coz-fg-primary"
          style={{ width: 300 }}
        >
          支持展开和折叠：Coze Design
          设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的
          Web 应用。
        </COZParagraph>
      </div>
    </View>
  );
};

export const Numeral: Story<TextProps> = function defaultFactory(args) {
  return (
    <View prop="variant" value="numeral" justify="start">
      <div className="flex flex-col gap-2">
        <div>
          <COZNumeral className="coz-fg-primary" precision={2}>
            <p>点赞量：1.6111e1 K</p>
          </COZNumeral>
        </div>
        <div>
          <COZNumeral
            rule="percentages"
            className="coz-fg-primary"
            precision={2}
          >
            <p>好评率: 0.915</p>
          </COZNumeral>
        </div>
        <div>
          <COZNumeral rule="percentages" className="coz-fg-primary">
            这场比赛我的胜率是0.6，输的概率是0.4
          </COZNumeral>
        </div>
      </div>
    </View>
  );
};

export const Ellipsis: Story<TextProps> = function defaultFactory(args) {
  return (
    <ViewGroup>
      <View prop="ellipsis" value="tooltip" justify="start">
        <div className="flex flex-col gap-2">
          <COZParagraph
            fontSize="14px"
            ellipsis={{
              rows: 3,
              showTooltip: {
                type: 'tooltip', // tooltip | popover
                opts: {
                  theme: 'dark',
                  content: '测试截断文字传入',
                },
              },
            }}
            style={{ width: 500 }}
          >
            Coze Design
            设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的
            Web 应用。 Coze Design
            设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的
            Web 应用。
          </COZParagraph>
        </div>
      </View>
      <View prop="ellipsis" value="popover" justify="start">
        <div className="flex flex-col gap-2">
          <COZParagraph
            fontSize="14px"
            ellipsis={{
              rows: 3,
              showTooltip: {
                type: 'popover', // tooltip | popover
                opts: {
                  content: '测试截断文字传入',
                },
              },
            }}
            style={{ width: 500 }}
          >
            Coze Design
            设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的
            Web 应用。 Coze Design
            设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的
            Web 应用。
          </COZParagraph>
        </div>
      </View>
      <View prop="ellipsis" value="only use ellipsis" justify="start">
        <div className="flex flex-col gap-2">
          <COZParagraph
            fontSize="14px"
            ellipsis={{
              rows: 2,
              showTooltip: false,
            }}
            style={{ width: 500 }}
          >
            Coze Design
            设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的
            Web 应用。 Coze Design
            设计系统包含设计语言以及一整套可复用的前端组件，帮助设计师与开发者更容易地打造高质量的、用户体验一致的、符合设计规范的
            Web 应用。
          </COZParagraph>
        </div>
      </View>
    </ViewGroup>
  );
};
