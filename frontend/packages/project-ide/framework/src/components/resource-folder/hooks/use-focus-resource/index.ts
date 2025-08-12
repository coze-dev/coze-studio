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

    // If in view, do not roll
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
