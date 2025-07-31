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

import { cloneDeep } from 'lodash-es';
import GraphemeSplitter from 'grapheme-splitter';

import {
  type BotInputLengthConfig,
  type WorkInfoOnboardingContent,
} from './type';
import { getBotInputLengthConfig } from './constants';

export class BotInputLengthService {
  graphemeSplitter: GraphemeSplitter;
  constructor(private getInputLengthConfig: () => BotInputLengthConfig) {
    this.graphemeSplitter = new GraphemeSplitter();
  }

  getInputLengthLimit: (field: keyof BotInputLengthConfig) => number = field =>
    this.getInputLengthConfig()[field];

  getValueLength: (value: string | undefined) => number = value => {
    if (typeof value === 'undefined') {
      return 0;
    }
    return this.graphemeSplitter.countGraphemes(value);
  };

  sliceStringByMaxLength: (param: {
    value: string;
    field: keyof BotInputLengthConfig;
  }) => string = ({ value, field }) =>
    this.graphemeSplitter
      .splitGraphemes(value)
      .slice(0, this.getInputLengthLimit(field))
      .join('');

  sliceWorkInfoOnboardingByMaxLength = (
    param: WorkInfoOnboardingContent,
  ): WorkInfoOnboardingContent => {
    const { prologue, suggested_questions, suggested_questions_show_mode } =
      cloneDeep(param);
    return {
      prologue: this.sliceStringByMaxLength({
        value: prologue,
        field: 'onboarding',
      }),
      suggested_questions: suggested_questions.map(sug => ({
        ...sug,
        content: this.sliceStringByMaxLength({
          value: sug.content,
          field: 'onboardingSuggestion',
        }),
      })),
      suggested_questions_show_mode,
    };
  };
}

export const botInputLengthService = new BotInputLengthService(
  getBotInputLengthConfig,
);
