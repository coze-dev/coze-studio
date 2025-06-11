import { createContext, useContext } from 'react';

import { type SpeakerMessageSetValue } from './types';
const SpeakerMessageSetArrayContext = createContext<{
  value?: Array<SpeakerMessageSetValue | undefined>;
  readonly?: boolean;
  testId: string;
}>({
  testId: '',
});

export const SpeakerMessageSetArrayContextProvider =
  SpeakerMessageSetArrayContext.Provider;
export const useSpeakerMessageSetContext = () =>
  useContext(SpeakerMessageSetArrayContext);
