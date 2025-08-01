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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  type OutputValueVO,
  type ValueExpression,
  type ViewVariableMeta,
} from '@coze-workflow/base/types';
import { type InputValueVO } from '@coze-workflow/base';

export interface FormData {
  inputs: { inputParameters: InputValueVO[] };
}

import {
  type FormItemMeta as _FormItemMeta,
  type FormMeta as _FormMeta,
} from '@/node-registries/common/components/dynamic-form';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TriggerForm {
  export const TriggerFormName = 'trigger';
  export const TriggerFormIsOpenName = 'isOpen';
  export const TriggerFormEventTypeName = 'event';
  export const TriggerFormEventIdName = 'eventID';
  export const TriggerFormAppIdName = 'appID';
  export const TriggerFormParametersName = 'parameters';
  export const TriggerFormCronjobName = 'crontab';
  export const TriggerFormCronjobTypeName = 'crontabType';
  export const TriggerFormBindWorkflowName = 'workflowId';

  export const getVariableName = (variable: OutputValueVO): string =>
    `${variable?.type},${variable?.key ?? variable?.name}`;

  export type FormItemMeta = _FormItemMeta;

  export type FormMeta = _FormMeta;

  // form value
}

export enum CronJobType {
  Cronjob = 'cronjob',
  Selecting = 'selecting',
}

export interface CronJobValue {
  type?: CronJobType;
  content?: ValueExpression;
}

export type DynamicInputsVO = Record<string, ValueExpression> & {
  [TriggerForm.TriggerFormCronjobName]?: {
    type?: CronJobType;
    content?: ValueExpression;
  };
};
export interface NodeDataVO {
  [k: string]: any;
  inputs: {
    fixedInputs: Record<string, ValueExpression>;
    dynamicInputs: DynamicInputsVO;
    payload?: Record<string, ValueExpression>;
    bindWorkflowId?: string;
  };
  nodeMeta: any;
  outputs: ViewVariableMeta[];
}
