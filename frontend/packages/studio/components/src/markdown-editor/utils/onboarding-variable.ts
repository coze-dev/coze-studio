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
  type OnboardingVariable,
  type OnboardingVariableMap,
} from '../constant/onboarding-variable';
import { typedKeys } from './typed-keys';

export interface VariableWithRange {
  range: [number, number];
  variable: OnboardingVariable;
}

export const getFixedVariableTemplate = (template: string) => `{{${template}}}`;

export const matchAllTemplateRanges = (
  text: string,
  template: string,
): { start: number; end: number }[] => {
  // Regular expressions to match the contents of double curly braces
  const templateRegex = new RegExp(getFixedVariableTemplate(template), 'g');
  const matches: { start: number; end: number }[] = [];

  // Loop through all matches
  while (true) {
    const match = templateRegex.exec(text);

    if (!match) {
      break;
    }
    const templateString = match[0];
    const start = match.index;
    const end = templateString.length + start;

    matches.push({ start, end });
  }
  return matches;
};

export const getVariableRangeList = (
  content: string,
  variableMap: OnboardingVariableMap,
) => {
  const result: VariableWithRange[] = [];
  typedKeys(variableMap).forEach(variable => {
    const allMatchedRanges = matchAllTemplateRanges(content, variable);
    const variableWithRangeList: VariableWithRange[] = allMatchedRanges.map(
      ({ start, end }) => ({
        variable,
        range: [start, end],
      }),
    );
    result.push(...variableWithRangeList);
  });

  return result;
};
