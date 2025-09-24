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

import { FieldLayout, InputNumberField, Section } from '@/form';

interface AdvancedSettingsFieldProps {
  timeoutPath: string;
  retryPath: string;
}

export function AdvancedSettingsField({
  timeoutPath,
  retryPath,
}: AdvancedSettingsFieldProps) {
  return (
    <Section
      title={I18n.t('高级设置')}
      tooltip={I18n.t('可配置调用超时时间、重试次数等高级选项')}
    >
      <div className="flex flex-col gap-[12px]">
        <FieldLayout
          label={I18n.t('超时时间 (ms)')}
          tooltip={I18n.t('调用第三方智能体接口的超时时间，单位毫秒')}
        >
          <InputNumberField
            name={timeoutPath}
            min={1_000}
            max={120_000}
            step={1_000}
            placeholder={I18n.t('默认 30000')}
          />
        </FieldLayout>

        <FieldLayout
          label={I18n.t('重试次数')}
          tooltip={I18n.t('接口调用失败后允许自动重试的次数')}
        >
          <InputNumberField
            name={retryPath}
            min={0}
            max={10}
            step={1}
            placeholder={I18n.t('默认 3 次')}
          />
        </FieldLayout>
      </div>
    </Section>
  );
}
