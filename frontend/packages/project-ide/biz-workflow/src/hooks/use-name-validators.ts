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

import { type RefObject } from 'react';

import {
  useResourceList,
  type BizResourceType,
} from '@coze-project-ide/biz-components';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
export const useNameValidators = ({
  currentResourceRef,
}: {
  currentResourceRef?: RefObject<BizResourceType | undefined>;
} = {}): Array<{
  validator: (rules: unknown[], value: string) => boolean | Error;
}> => {
  const { workflowResource } = useResourceList();
  return [
    {
      validator(_, value) {
        // Filter out current resources
        const otherResource = currentResourceRef?.current
          ? workflowResource.filter(
              r => r.res_id !== currentResourceRef?.current?.res_id,
            )
          : workflowResource;
        if (otherResource.map(item => item.name).includes(value)) {
          return new CustomError(
            REPORT_EVENTS.formValidation,
            I18n.t('project_resource_sidebar_warning_label_exists', {
              label: value,
            }),
          );
        }
        return true;
      },
    },
  ];
};
