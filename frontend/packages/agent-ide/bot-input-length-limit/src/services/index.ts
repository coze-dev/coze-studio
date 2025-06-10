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
