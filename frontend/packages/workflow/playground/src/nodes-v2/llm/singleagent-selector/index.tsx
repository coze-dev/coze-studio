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
import { Select, Empty, Tag } from '@coze-arch/coze-design';
import { I18n } from '@coze-arch/i18n';

import { useGlobalState } from '@/hooks';

import type { IModelValue } from '../../../typing';

interface SingleAgentSelectorProps {
  value: IModelValue | undefined;
  onChange: (value: IModelValue) => void;
  readonly?: boolean;
}

interface SingleAgentItem {
  id: string; // basic_info.id（大整数字符串）
  name: string;
  description?: string;
  icon?: string;
  published: boolean; // 是否已发布
  status: number; // 状态
}

export const SingleAgentSelector: React.FC<SingleAgentSelectorProps> = ({
  value,
  onChange,
  readonly,
}) => {
  const { spaceId } = useGlobalState();
  const [singleAgents, setSingleAgents] = useState<SingleAgentItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch SingleAgent list from intelligence API
  useEffect(() => {
    if (!spaceId) return;

    const fetchSingleAgents = async () => {
      setLoading(true);
      try {
        // 调用现有的 intelligence API
        const response = await fetch(
          '/api/intelligence_api/search/get_draft_intelligence_list',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Agw-Js-Conv': 'str',
            },
            body: JSON.stringify({
              space_id: String(spaceId),
              name: '',
              status: [1, 3, 4], // 可用状态：1-draft, 3-published, 4-审核中
              types: [1], // type=1 表示 SingleAgent
              search_scope: 0,
              order_by: 0,
              size: 100,
            }),
          }
        );

        const result = await response.json();

        if (result.code === 0 && result.data?.intelligences) {
          // 过滤并转换数据
          const agents = result.data.intelligences
            .filter((item: any) => item.type === 1) // 只保留 SingleAgent
            .map((item: any) => ({
              id: item.basic_info.id, // ⚠️ 保持为字符串！
              name: item.basic_info.name,
              description: item.basic_info.description,
              icon: item.basic_info.icon_url,
              published: item.publish_info?.has_published || false,
              status: item.basic_info.status,
            }));

          setSingleAgents(agents);
        }
      } catch (error) {
        console.error('[SingleAgentSelector] Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleAgents();
  }, [spaceId]);

  const selectedAgent = singleAgents.find(
    agent => agent.id === value?.singleagentId
  );

  return (
    <div className="w-full">
      <Select
        value={value?.singleagentId}
        onChange={singleagentId => {
          const agent = singleAgents.find(a => a.id === singleagentId);
          if (agent) {
            console.log('[SingleAgentSelector] Selected agent:', agent.name, 'id:', singleagentId);

            onChange({
              ...value,
              // 标记为使用外部智能体（架构复用）
              isHiagent: true,
              externalAgentPlatform: 'singleagent',

              // SingleAgent 专用字段
              singleagentId: agent.id, // ⚠️ 大整数字符串

              // 设置模型名称用于显示
              modelName: agent.name,

              // 清除其他平台的字段
              hiagentId: undefined,
              hiagentSpaceId: undefined,
              modelType: undefined,
              temperature: undefined,
            });
          }
        }}
        disabled={readonly || loading}
        placeholder={
          loading
            ? I18n.t('加载中...')
            : I18n.t('请选择内部智能体')
        }
        className="w-full"
      >
        {singleAgents.length === 0 && !loading ? (
          <Empty description={I18n.t('暂无可用的内部智能体')} />
        ) : (
          singleAgents.map(agent => (
            <Select.Option key={agent.id} value={agent.id}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  {agent.icon && (
                    <img
                      src={agent.icon}
                      alt={agent.name}
                      className="w-6 h-6 rounded"
                    />
                  )}
                  <span className="flex-1 truncate">{agent.name}</span>
                </div>
                {agent.published && (
                  <Tag color="blue" size="small">
                    已发布
                  </Tag>
                )}
              </div>
            </Select.Option>
          ))
        )}
      </Select>

      {selectedAgent && (
        <div className="mt-2 text-xs text-gray-500">
          <div>ID: {selectedAgent.id}</div>
          {selectedAgent.description && (
            <div className="mt-1">{selectedAgent.description}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SingleAgentSelector;
