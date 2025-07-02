import { createContext, useContext } from 'react';

import { type IEventCallbacks } from '@coze-common/chat-uikit-shared';
/**
 * 为了支持CozeImage隔空取物和性能优化角度考虑临时开的Context，没事儿别乱用。。。。
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const OnboardingContext = createContext<{
  imageAutoSizeContainerWidth: number | undefined;
  eventCallbacks: IEventCallbacks | undefined;
}>({
  imageAutoSizeContainerWidth: undefined,
  eventCallbacks: undefined,
});

export const useOnboardingContext = () => useContext(OnboardingContext);
