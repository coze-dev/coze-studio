import ChatInput from '../../src/components/chat/ChatInput';

export default {
  component: ChatInput,
  title: 'ChatInput',
};

const Template = args => <ChatInput {...args} />;

export const 普通ChatInput = Template.bind({});

普通ChatInput.args = {};
