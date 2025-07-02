import { useContext } from 'react';

import { ScrollViewSizeContext } from './context';

export const useScrollViewSize = () => useContext(ScrollViewSizeContext);
