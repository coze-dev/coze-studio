/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useState } from 'react';

import { CozAvatar } from '@coze-arch/coze-design';

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
  // Plugin from store and repository scenes have different default icons
  if (type === NodeType.PLUGIN) {
    return <IconPlugin />;
  }
  return null;
};
