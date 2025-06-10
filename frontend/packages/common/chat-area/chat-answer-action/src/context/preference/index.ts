import { useContext } from 'react';

import { AnswerActionPreferenceContext } from './context';

export const useAnswerActionPreference = () =>
  useContext(AnswerActionPreferenceContext);
