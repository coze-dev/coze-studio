import { useMemo } from 'react';

import { Tooltip } from '@/components/tooltip';
import { Popover } from '@/components/popover';

import type { Ellipsis, ShowTooltip } from './typography-types';

export const useRenderEllipsis = (ellipsis: Ellipsis | undefined | boolean) =>
  useMemo(() => {
    if (!ellipsis) {
      return false;
    }

    if (typeof ellipsis === 'boolean') {
      return true;
    }

    if (!ellipsis.showTooltip) {
      return ellipsis;
    }

    const renderTooltip = (content, children) => {
      const { opts, type = 'tooltip' } =
        ellipsis.showTooltip as unknown as ShowTooltip;
      const renderContent = opts?.content ?? content;
      const TipComponent = type === 'tooltip' ? Tooltip : Popover;
      return (
        <TipComponent {...opts} content={renderContent} showArrow={true}>
          {children}
        </TipComponent>
      );
    };

    return {
      ...ellipsis,
      showTooltip:
        typeof ellipsis.showTooltip === 'object'
          ? { renderTooltip, ...ellipsis.showTooltip }
          : { renderTooltip },
    };
  }, [ellipsis]);
