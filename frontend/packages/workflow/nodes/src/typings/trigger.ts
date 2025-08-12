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
  type ValueExpression,
  type OutputValueVO,
} from '@coze-workflow/base/types';
import {
  type FormDataTypeName,
  type IFormItemMeta,
  type ValidatorProps,
} from '@flowgram-adapter/free-layout-editor';

export namespace TriggerForm {
  export const TabName = 'tab';
  export enum Tab {
    Basic = 'basic',
    Trigger = 'trigger',
  }
  export const TriggerFormName = 'trigger';
  export const TriggerFormIsOpenName = 'isOpen';
  export const TriggerFormEventTypeName = 'event';
  export const TriggerFormEventIdName = 'eventID';
  export const TriggerFormAppIdName = 'appID';
  export const TriggerFormParametersName = 'parameters';
  export const TriggerFormCronjobName = 'crontab';
  export const TriggerFormCronjobTypeName = 'crontabType';
  export const TriggerFormBindWorkflowName = 'workflowId';
  export enum TriggerFormEventType {
    Time = 'time',
    Event = 'event',
  }

  export const getVariableName = (variable: OutputValueVO): string =>
    `${variable?.type},${variable?.key ?? variable?.name}`;

  export type Validation =
    | 'requiredWhenTriggerOpenedAndSelectedTime'
    | 'requiredWhenTriggerOpenedAndSelectedEvent'
    | 'required'
    | 'cronValidateWhenTriggerOpenedAndSelectedTime'
    | 'cronValidate';
  export type ValidationFn = (props: ValidatorProps<any, any>) => string | true;

  export interface FormItemMeta {
    name: string;
    label: string;
    required?: boolean;
    type: FormDataTypeName;
    isInTriggerNode?: boolean;
    setter: string;
    setterProps?: {
      defaultValue?: any;
      size?: string;
      [k: string]: any;
    };
    tooltip?: string;
    hidden?: string | boolean; // '{{$values.tab === "time"}}'
    validation?: Validation | ValidationFn;
    otherAbilities?: IFormItemMeta['abilities'];
    otherMetaProps?: { [k: string]: any };
    otherDecoratorProps?: { [k: string]: any };
  }

  export type FormMeta = FormItemMeta[];

  // form value
  export interface FormValue {
    [TriggerFormIsOpenName]?: boolean;
    [TriggerFormEventTypeName]?: TriggerFormEventType;
    [k: string]: any;
  }
}

export enum CronJobType {
  Cronjob = 'cronjob',
  Selecting = 'selecting',
}

export interface CronJobValue {
  type?: CronJobType;
  content?: ValueExpression;
}
