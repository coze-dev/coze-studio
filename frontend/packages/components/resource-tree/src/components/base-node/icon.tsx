import { useState } from 'react';

import { CozAvatar } from '@coze/coze-design';

import { NodeType } from '../../typings';
import { ReactComponent as IconWorkflow } from '../../assets/icon-workflow.svg';
import { ReactComponent as IconPlugin } from '../../assets/icon-plugin.svg';
import { ReactComponent as IconKnowledge } from '../../assets/icon-knowledge.svg';
import { ReactComponent as IconDatabase } from '../../assets/icon-database.svg';
import { ReactComponent as IconChatflow } from '../../assets/icon-chatflow.svg';

export const Icon = ({ type, icon }: { type: NodeType; icon?: string }) => {
  const [error, setError] = useState(false);
  if (icon && !error) {
    return (
      <CozAvatar
        size="small"
        type="bot"
        src={icon}
        onError={() => setError(true)}
      />
    );
  }
  if (type === NodeType.CHAT_FLOW) {
    return <IconChatflow />;
  }
  if (type === NodeType.WORKFLOW) {
    return <IconWorkflow />;
  }
  if (type === NodeType.KNOWLEDGE) {
    return <IconKnowledge />;
  }
  if (type === NodeType.DATABASE) {
    return <IconDatabase />;
  }
  // 插件来自商店和资源库场景默认图标不同
  if (type === NodeType.PLUGIN) {
    return <IconPlugin />;
  }
  return null;
};
