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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Steps } from '@coze-arch/coze-design';

export enum BatchImportStep {
  Upload,
  Config,
  Preview,
  Process,
}

export interface BatchImportStepsProps {
  step: BatchImportStep;
}

export function BatchImportSteps({ step }: BatchImportStepsProps) {
  return (
    <Steps
      type="basic"
      hasLine={false}
      current={step}
      className={classNames(
        'my-[24px] justify-center',
        '[&_.semi-steps-item]:flex-none',
        '[&_.semi-steps-item-title]:!max-w-[unset]',
      )}
    >
      <Steps.Step title={I18n.t('db_optimize_014')} />
      <Steps.Step title={I18n.t('db_optimize_015')} />
      <Steps.Step title={I18n.t('db_optimize_016')} />
      <Steps.Step title={I18n.t('db_optimize_017')} />
    </Steps>
  );
}
