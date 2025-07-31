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
import { Typography } from '@coze-arch/coze-design';

import { defaultTerminalPlanOptions } from '@/node-registries/end/constants';

import { Field } from './field';
export const TerminatePlan = () => {
  const { data } = useWorkflowNode();

  const terminatePlan = defaultTerminalPlanOptions.find(
    item => item.value === data?.inputs?.terminatePlan,
  )?.label;
  if (!terminatePlan) {
    return null;
  }
  return (
    <Field label={I18n.t('wf_chatflow_131')}>
      <div className="flex">
        <Typography.Text className="leading-[20px]">
          {terminatePlan}
        </Typography.Text>
      </div>
    </Field>
  );
};
