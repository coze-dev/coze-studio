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

import { InputsParametersField } from '@/node-registries/common/fields';

interface DynamicInputsFieldProps {
  name: string;
}

export function DynamicInputsField({ name }: DynamicInputsFieldProps) {
  return (
    <InputsParametersField
      name={name}
      title={I18n.t('动态参数')}
      tooltip={I18n.t('可根据智能体需求动态传入额外参数，支持变量引用。这些参数将传递给 HiAgent 的 Inputs 对象')}
      inputPlaceholder={I18n.t('请输入参数值或引用变量')}
    />
  );
}
