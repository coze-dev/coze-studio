import { useContext } from 'react';

import { PreferenceContext } from './preference-context';

export { NewMessageInterruptScenario } from './types';

export const usePreference = () => useContext(PreferenceContext);
