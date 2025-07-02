import { useContext } from 'react';

import {
  UIKitCustomComponentsContext,
  UIKitCustomComponentsMap,
  UIKitCustomComponents,
  UIKitCustomComponentsProvider,
} from './custom-components-context';

export {
  UIKitCustomComponentsContext,
  UIKitCustomComponentsMap,
  UIKitCustomComponents,
  UIKitCustomComponentsProvider,
};

export const useUIKitCustomComponent = () =>
  useContext(UIKitCustomComponentsContext).uiKitCustomComponents || {};
