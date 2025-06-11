import CardContent from '../../src/components/contents/card-content';

export default {
  component: CardContent,
  title: 'CardContent',
};

const Template = args => <CardContent {...args} />;

export const 不支持Card的Content = Template.bind({});

不支持Card的Content.args = {};
