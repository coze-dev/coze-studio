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

import { useWorkflowNode } from '@coze-workflow/base';
import { Tag } from '@coze-arch/bot-semi';

// 筛选类型对应的显示文本和颜色
const FILTER_TYPE_CONFIG = {
  all: { label: '全部卡片', color: 'blue' },
  text: { label: '文本卡片', color: 'green' },
  image: { label: '图片卡片', color: 'orange' },
  video: { label: '视频卡片', color: 'red' },
  link: { label: '链接卡片', color: 'purple' },
} as const;

export function FilterStatusDisplay() {
  const nodeData = useWorkflowNode();
  const filterType = nodeData?.inputs?.filterSelector || 'all';
  const config =
    FILTER_TYPE_CONFIG[filterType as keyof typeof FILTER_TYPE_CONFIG] ||
    FILTER_TYPE_CONFIG.all;

  return (
    <div style={{ marginBottom: '8px' }}>
      <span style={{ fontSize: '12px', color: '#666', marginRight: '8px' }}>
        筛选类型:
      </span>
      <Tag color={config.color} size="small">
        {config.label}
      </Tag>
    </div>
  );
}
