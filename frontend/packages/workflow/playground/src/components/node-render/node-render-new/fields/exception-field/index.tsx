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

import {
  SettingOnErrorProcessType,
  useIsSettingOnErrorV2,
} from '@coze-workflow/nodes';
import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Field } from '../field';
import { ExceptionPort } from './exception-port';

export function ExceptionField() {
  const settingOnError = useWorkflowNode().data?.settingOnError;
  const hasException =
    settingOnError?.settingOnErrorIsOpen &&
    settingOnError?.processType === SettingOnErrorProcessType.EXCEPTION;
  const isSettingOnErrorV2 = useIsSettingOnErrorV2();

  if (!hasException || !isSettingOnErrorV2) {
    return null;
  }

  return (
    <Field label={I18n.t('workflow_250407_201', undefined, '异常处理')}>
      <div className="coz-fg-primary font-medium leading-4 text-md">
        {I18n.t('workflow_250407_202', undefined, '执行异常流程')}
      </div>
      <ExceptionPort />
    </Field>
  );
}
