import { exhaustiveCheckSimple } from '@coze-common/chat-area-utils';

import { type UIMode } from '../shortcut-bar/types';

export const getUIModeByBizScene: (props: {
  bizScene: 'debug' | 'store' | 'home' | 'agentApp';
  showBackground: boolean;
}) => UIMode = ({ bizScene, showBackground }) => {
  if (bizScene === 'agentApp') {
    return 'grey';
  }
  if (bizScene === 'home') {
    if (showBackground) {
      return 'blur';
    }
    return 'white';
  }

  if (bizScene === 'store' || bizScene === 'debug') {
    if (showBackground) {
      return 'blur';
    }
    return 'grey';
  }
  exhaustiveCheckSimple(bizScene);
  return 'white';
};
