import { type MutableRefObject, useEffect, useRef, useState } from 'react';

import {
  CONTENT_ATTRIBUTE_NAME,
  MESSAGE_SOURCE_ATTRIBUTE_NAME,
  getAncestorAttributeNode,
} from '@coze-common/text-grab';

import { FILTER_MESSAGE_SOURCE } from '../constants/filter-message';

interface HideQuoteProps<T> {
  containerRef?: MutableRefObject<T | null>;
}

export const useHideQuote = <T extends Element>(props?: HideQuoteProps<T>) => {
  const containerRef = useRef<T | null>(null);
  const targetRef = useRef<Element | null>(null);

  const usedContainerRef = props?.containerRef?.current
    ? props.containerRef
    : containerRef;

  const [forceHidden, setForceHidden] = useState(false);

  useEffect(() => {
    const target = getAncestorAttributeNode(
      usedContainerRef.current,
      CONTENT_ATTRIBUTE_NAME,
    );

    const messageSource = target?.attributes.getNamedItem(
      MESSAGE_SOURCE_ATTRIBUTE_NAME,
    )?.value;

    if (FILTER_MESSAGE_SOURCE.includes(Number(messageSource))) {
      setForceHidden(true);
    }

    targetRef.current = target;

    return () => {
      setForceHidden(false);
      targetRef.current = null;
    };
  }, [usedContainerRef.current]);

  return { targetRef, containerRef: usedContainerRef, forceHidden };
};
