import { findMessageById } from '../message';
import { type MessageGroup, type Message } from '../../store/types';
import { flatMessageGroupIdList } from './flat-message-group-list';

export const getMessagesByGroup = (group: MessageGroup, messages: Message[]) =>
  flatMessageGroupIdList([group])
    .map(id => findMessageById(messages, id))
    .filter((msg): msg is Message => Boolean(msg));
