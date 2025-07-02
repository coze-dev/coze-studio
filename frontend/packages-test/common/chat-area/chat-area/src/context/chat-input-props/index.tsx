import { useContext } from 'react';

import { ChatInputPropsContext } from './context';

export const useChatInputProps = () => useContext(ChatInputPropsContext);
