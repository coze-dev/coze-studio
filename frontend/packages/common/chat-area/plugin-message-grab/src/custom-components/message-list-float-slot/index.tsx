import { type MessageListFloatSlot } from '@coze-common/chat-area';

import { GrabMenu } from './grab-menu';
import { FloatMenu } from './float-menu';

export const MessageListFloat: MessageListFloatSlot = props => (
  <>
    <GrabMenu {...props} />
    <FloatMenu {...props} />
  </>
);
