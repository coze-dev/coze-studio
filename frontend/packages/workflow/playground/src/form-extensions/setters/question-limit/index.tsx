import { type FC } from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { QuestionLimit as BaseQuestionLimit } from '../../components/question-limit';

type CheckboxProps = SetterComponentProps;

export const QuestionLimit: FC<CheckboxProps> = props => (
  <BaseQuestionLimit {...props} />
);

export const questionLimit = {
  key: 'question-limit',
  component: QuestionLimit,
};
