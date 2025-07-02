import { useResizableSidePanelStore } from '@/hooks/use-resizable-side-panel-store';
import { useFloatLayoutSize } from '@/hooks';

import { getConstraintWidth } from './utils';
import { MAX_WIDTH } from './constants';

const PADDING = 16;

export function useSidePanelWidth(): { max: number; width: number } {
  const storeWidth = useResizableSidePanelStore(state => state.width);
  const { width: layoutWidth } = useFloatLayoutSize();
  const maxLayoutWidth = layoutWidth ? layoutWidth - PADDING : 0;
  const max = maxLayoutWidth ? Math.min(maxLayoutWidth, MAX_WIDTH) : MAX_WIDTH;
  const width = getConstraintWidth(storeWidth, max);

  return {
    max,
    width,
  };
}
