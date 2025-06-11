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
      // 不应该走到这里
      return {
        ...item,
        render: () => <></>,
      };
    });
  };
