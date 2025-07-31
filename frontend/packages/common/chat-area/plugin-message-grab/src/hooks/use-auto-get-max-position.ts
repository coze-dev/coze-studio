/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
