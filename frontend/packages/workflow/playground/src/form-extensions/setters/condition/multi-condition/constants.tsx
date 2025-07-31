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

import { ConditionType } from '@coze-arch/idl/workflow_api';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozEqual,
  IconCozEqualSlash,
  IconCozGreater,
  IconCozGreaterEqual,
  IconCozLess,
  IconCozLessEqual,
  IconCozProperSuperset,
  IconCozProperSupersetSlash,
} from '@coze-arch/coze-design/icons';

export enum Logic {
  OR = 1,
  AND = 2,
}

export const logicTextMap = new Map<number, string>([
  [Logic.OR, I18n.t('workflow_detail_condition_or')],
  [Logic.AND, I18n.t('workflow_detail_condition_and')],
]);

export const operatorMap = {
  [ConditionType.Equal]: <IconCozEqual />,
  [ConditionType.NotEqual]: <IconCozEqualSlash />,
  [ConditionType.LengthGt]: <IconCozGreater />,
  [ConditionType.LengthGtEqual]: <IconCozGreaterEqual />,
  [ConditionType.LengthLt]: <IconCozLess />,
  [ConditionType.LengthLtEqual]: <IconCozLessEqual />,
  // contain
  [ConditionType.Contains]: <IconCozProperSuperset />,
  // Do not include
  [ConditionType.NotContains]: <IconCozProperSupersetSlash />,
  // isEmpty
  [ConditionType.Null]: <IconCozEqual />,
  // isNotEmpty
  [ConditionType.NotNull]: <IconCozEqualSlash />,
  // isTrue
  [ConditionType.True]: <IconCozEqual />,
  // isFalse
  [ConditionType.False]: <IconCozEqual />,
  [ConditionType.Gt]: <IconCozGreater />,
  [ConditionType.GtEqual]: <IconCozGreaterEqual />,
  [ConditionType.Lt]: <IconCozLess />,
  [ConditionType.LtEqual]: <IconCozLessEqual />,
};
