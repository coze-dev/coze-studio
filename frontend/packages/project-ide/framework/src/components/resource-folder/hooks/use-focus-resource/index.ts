import { useRef } from 'react';

import { calcOffsetTopByCollapsedMap } from '../../utils';
import {
  type ResourceType,
  type ConfigType,
  type ResourceMapType,
} from '../../type';
import { ITEM_HEIGHT } from '../../constant';

const useFocusResource = ({
  resourceTreeRef,
  collapsedMapRef,
  resourceMap,
  config,
}: {
  config?: ConfigType;
  resourceTreeRef: React.MutableRefObject<ResourceType>;
  collapsedMapRef: React.MutableRefObject<Record<string, boolean>>;
  resourceMap: React.MutableRefObject<ResourceMapType>;
}) => {
  const scrollWrapper = useRef<HTMLDivElement>(null);

  const scrollEnable = useRef(true);

  const scrollInView = (selectedId: string) => {
    if (
      !scrollWrapper.current ||
      !scrollEnable.current ||
      !selectedId ||
      !resourceTreeRef.current ||
      !resourceMap?.current?.[selectedId]
    ) {
      return;
    }

    const scrollTop = calcOffsetTopByCollapsedMap({
      selectedId,
      resourceTree: resourceTreeRef.current,
      collapsedMap: collapsedMapRef.current,
      itemHeight: config?.itemHeight || ITEM_HEIGHT,
    });

    // 如果在视图内， 则不滚
    if (
      scrollTop > scrollWrapper.current.scrollTop &&
      scrollTop <
        scrollWrapper.current.offsetHeight + scrollWrapper.current.scrollTop
    ) {
      return;
    }

    scrollWrapper.current.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  };

  const tempDisableScroll = (t?: number) => {
    scrollEnable.current = false;

    setTimeout(() => {
      scrollEnable.current = true;
    }, t || 300);
  };

  return {
    scrollInView,
    scrollWrapper,
    tempDisableScroll,
  };
};
export { useFocusResource };
