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

import React from 'react';
import { useParams } from 'react-router-dom';
import AgentIDELayout from '@coze-agent-ide/layout-adapter';
import { StoreChatPage } from './store-chat-page';

export const ConditionalAgentLayout: React.FC = () => {
  const { space_id } = useParams<{ space_id: string }>();

  // 如果是商店空间，使用简化的聊天页面
  if (space_id === '888888') {
    return <StoreChatPage />;
  }

  // 其他空间使用正常的AgentIDELayout
  return <AgentIDELayout />;
};