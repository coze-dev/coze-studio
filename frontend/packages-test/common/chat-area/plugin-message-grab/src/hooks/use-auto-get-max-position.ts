import {
  type MutableRefObject,
  useEffect,
  useState,
  type RefObject,
} from 'react';

import { defer } from 'lodash-es';
import { type GrabPosition } from '@coze-common/text-grab';

import { type MenuListRef } from '../custom-components/menu-list';

export const useAutoGetMaxPosition = ({
  position,
  messageRef,
  floatMenuRef,
}: {
  position: GrabPosition | null;
  messageRef: MutableRefObject<Element | null>;
  floatMenuRef: RefObject<MenuListRef>;
}) => {
  const [maxPositionX, setMaxPositionX] = useState(0);

  useEffect(() => {
    const maxX = messageRef.current?.getBoundingClientRect().right ?? 0;
    setMaxPositionX(maxX);
    defer(() => floatMenuRef.current?.refreshOpacity());
  }, [position, messageRef.current, floatMenuRef.current]);

  return { maxPositionX };
};
