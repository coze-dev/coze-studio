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

import { getVariableRangeList } from '../../utils/onboarding-variable';
import { primitiveExhaustiveCheck } from '../../utils/exhaustive-check';
import {
  OnboardingVariable,
  type OnboardingVariableMap,
} from '../../constant/onboarding-variable';

export const useRenderVariable =
  (variableMap: OnboardingVariableMap) => (text: string) => {
    const variableWithRangeList = getVariableRangeList(text, variableMap);

    return variableWithRangeList.map(item => {
      const { variable } = item;

      if (variable === OnboardingVariable.USER_NAME) {
        return {
          ...item,
          render: (_?: string) => <>{variableMap[variable]}</>,
        };
      }
      primitiveExhaustiveCheck(variable);
      return {
        ...item,
        render: () => <></>,
      };
    });
  };
