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

import React, { useEffect, useState } from 'react';
import { Select, Checkbox, Empty } from '@coze-arch/coze-design';
import { ynet_agent } from '@coze-studio/api-schema';
import { I18n } from '@coze-arch/i18n';

import { useGlobalState } from '@/hooks';

import type { IModelValue } from '../../../typing';

interface HiAgentSelectorProps {
  value: IModelValue | undefined;
  onChange: (value: IModelValue) => void;
  readonly?: boolean;
}

interface HiAgentItem {
  id: string;
  agent_id?: string;
  name: string;
  description?: string;
  platform?: string;
  icon?: string;
  status: number;
}

export const HiAgentSelector: React.FC<HiAgentSelectorProps> = ({
  value,
  onChange,
  readonly,
}) => {
  const { spaceId } = useGlobalState();
  const [hiAgents, setHiAgents] = useState<HiAgentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch HiAgent list (filter by platform='hiagent')
  useEffect(() => {
    if (!spaceId) return;

    const fetchHiAgents = async () => {
      setLoading(true);
      try {
        const response = await ynet_agent.GetHiAgentList({
          space_id: String(spaceId),
          page_size: 100,
        });

        if (response.code === 0 && response.agents) {
          // Filter only HiAgent platform agents
          const hiagentOnly = (response.agents as HiAgentItem[]).filter(agent => {
            // If no platform field, default to hiagent (backward compatibility)
            // Otherwise, only show agents with platform='hiagent'
            return !agent.platform || agent.platform === 'hiagent';
          });
          setHiAgents(hiagentOnly);
        }
      } catch (error) {
        console.error('Failed to fetch HiAgents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHiAgents();
  }, [spaceId]);

  const selectedAgent = hiAgents.find(
    agent => (agent.agent_id || agent.id) === value?.hiagentId,
  );

  return (
    <div className="w-full">
      <Select
        value={value?.hiagentId}
        onChange={hiagentId => {
          const agent = hiAgents.find(a => (a.agent_id || a.id) === hiagentId);
          if (agent) {
            const newValue = {
              ...value,
              isHiagent: true,
              externalAgentPlatform: 'hiagent',
              hiagentId: agent.agent_id || agent.id,
              hiagentSpaceId: spaceId,
              modelName: agent.name,
              // Clear standard model fields
              modelType: undefined,
              temperature: undefined,
            };
            onChange(newValue);
          }
        }}
        disabled={readonly || loading}
        placeholder={
          loading
            ? I18n.t('加载中...')
            : I18n.t('请选择 HiAgent')
        }
        className="w-full"
      >
        {hiAgents.length === 0 && !loading ? (
          <Empty description={I18n.t('暂无可用的 HiAgent')} />
        ) : (
          hiAgents.map(agent => (
            <Select.Option key={agent.agent_id || agent.id} value={agent.agent_id || agent.id}>
              <div className="flex items-center gap-2">
                {agent.icon && (
                  <img
                    src={agent.icon}
                    alt={agent.name}
                    className="w-4 h-4 rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{agent.name}</div>
                </div>
              </div>
            </Select.Option>
          ))
        )}
      </Select>

      {selectedAgent && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            {selectedAgent.icon && (
              <img
                src={selectedAgent.icon}
                alt={selectedAgent.name}
                className="w-8 h-8 rounded flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{selectedAgent.name}</div>
              {selectedAgent.description && (
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {selectedAgent.description}
                </div>
              )}
            </div>
          </div>

          <Checkbox
            checked={value?.hiagentConversationMapping ?? true}
            onChange={e => {
              onChange({
                ...value,
                hiagentConversationMapping: e.target.checked,
              });
            }}
            disabled={readonly}
          >
            <span className="text-sm">{I18n.t('启用会话管理')}</span>
          </Checkbox>
          <div className="text-xs text-gray-500 ml-6 mt-1 leading-relaxed">
            {I18n.t(
              '在同一个 ChatFlow 会话中,自动维护与 HiAgent 的多轮对话上下文',
            )}
          </div>
        </div>
      )}
    </div>
  );
};
