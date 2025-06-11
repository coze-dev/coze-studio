import { useContext } from 'react';

import { UIKitEventContext } from './context';

export const useUiKitEventCenter = () => useContext(UIKitEventContext);
