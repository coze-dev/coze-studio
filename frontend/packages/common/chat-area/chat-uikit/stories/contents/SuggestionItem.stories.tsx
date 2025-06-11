import SuggestionItem from '../../src/components/contents/suggestion-content/components/suggestion-item/index';

export default {
  component: SuggestionItem,
  title: 'SuggestionItem',
};

const Template = args => <SuggestionItem {...args} />;

export const 测试SuggestionItem = Template.bind({});
const content = '建议1';

测试SuggestionItem.args = {
  content,
};
