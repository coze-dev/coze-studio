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
  type Effect,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';

import { OptionType } from '@/constants/question-settings';

export const syncQuestionOptionTypeEffect: Effect = props => {
  const { value, context } = props;
  const { node } = context;
  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  if (value === OptionType.Dynamic) {
    return;
  }
  formModel.setValueIn('questionParams.dynamic_option', null);
};
