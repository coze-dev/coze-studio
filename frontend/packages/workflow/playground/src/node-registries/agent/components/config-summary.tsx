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

import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

const truncateUrl = (value: string | undefined) => {
  if (!value) {
    return I18n.t('未配置');
  }
  if (value.length <= 36) {
    return value;
  }
  return `${value.slice(0, 32)}...`;
};

export function ConfigSummary() {
  const node = useWorkflowNode();
  const inputs = node?.inputs ?? {};
  const agentUrl =
    typeof inputs.agent_url === 'string' ? inputs.agent_url : undefined;
  const agentKey =
    typeof inputs.agent_key === 'string' ? inputs.agent_key : undefined;

  return (
    <div className="flex flex-col gap-[4px] text-xs text-[#4B5563]">
      <span>
        {I18n.t('接口地址')}: {truncateUrl(agentUrl)}
      </span>
      <span>API Key: {agentKey ? I18n.t('已配置') : I18n.t('未配置')}</span>
    </div>
  );
}
