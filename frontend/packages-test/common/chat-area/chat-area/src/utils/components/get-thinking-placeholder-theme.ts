import { type PreferenceContextInterface } from '../../context/preference/types';

export const getThinkingPlaceholderTheme = ({
  bizTheme,
}: {
  bizTheme: PreferenceContextInterface['theme'];
}): 'whiteness' | 'grey' => {
  if (bizTheme === 'home') {
    return 'whiteness';
  }
  return 'grey';
};
