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

import { I18n } from '@coze-arch/i18n';

import { FieldLayout, InputField, Section } from '@/form';

interface AgentConfigFieldProps {
  name: string;
  title?: string;
  tooltip?: string;
}

export function AgentConfigField({
  name,
  title = I18n.t('Agent 接口配置'),
  tooltip = I18n.t('配置智能体平台的接口地址与凭证'),
}: AgentConfigFieldProps) {
  const agentUrlPath = `${name}.agent_url`;
  const agentKeyPath = `${name}.agent_key`;

  return (
    <Section title={title} tooltip={tooltip}>
      <div className="flex flex-col gap-[12px]">
        <FieldLayout
          label={I18n.t('Agent URL')}
          required
          tooltip={I18n.t('请输入智能体平台的接口地址，需包含协议头')}
        >
          <InputField
            name={agentUrlPath}
            placeholder="https://api.example.com/v1/agent"
          />
        </FieldLayout>

        <FieldLayout
          label={I18n.t('Agent Key')}
          tooltip={I18n.t('部分平台需要配置API Key，可留空')}
        >
          <InputField
            name={agentKeyPath}
            type="password"
            placeholder={I18n.t('可选，填写平台访问密钥')}
          />
        </FieldLayout>
      </div>
    </Section>
  );
}
