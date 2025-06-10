import { useContext } from 'react';

import { ScrollViewContext } from '../../context/scroll-view-context';

export const useGetScrollView = () => {
  const { getScrollView } = useContext(ScrollViewContext);
  if (!getScrollView) {
    throw new Error('scrollView context not provide');
  }
  return getScrollView;
};
