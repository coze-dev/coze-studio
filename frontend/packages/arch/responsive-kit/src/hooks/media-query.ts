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

// @coze-arch/responsive-kit
import { useEffect, useState } from 'react';

import {
  SCREENS_TOKENS,
  SCREENS_TOKENS_2,
  type ScreenRange,
} from '../constant';

export const useCustomMediaQuery = ({
  rangeMinPx,
  rangeMaxPx,
}: {
  rangeMinPx?: string;
  rangeMaxPx?: string;
}) => {
  // 1. Patchwork query statements according to query range
  const getQuery = () => {
    const minQuery = rangeMinPx ? `(min-width: ${rangeMinPx})` : '';
    const maxQuery = rangeMaxPx ? `(max-width: ${rangeMaxPx})` : '';
    return minQuery && maxQuery
      ? `${minQuery} and ${maxQuery}`
      : minQuery || maxQuery;
  };
  const query = getQuery();

  // 2. Cooperate with the monitoring event to dynamically determine whether it is in the area
  const [matches, setMatches] = useState(window.matchMedia(query).matches);
  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const documentChangeHandler = () => {
      setMatches(mediaQueryList.matches);
    };

    mediaQueryList?.addEventListener?.('change', documentChangeHandler);
    documentChangeHandler();
    return () => {
      mediaQueryList?.removeEventListener?.('change', documentChangeHandler);
    };
  }, [query]);

  return matches;
};

// Determine whether the current screen pixels match the media query conditions
export const useMediaQuery = ({
  rangeMin,
  rangeMax,
}: {
  rangeMin?: ScreenRange;
  rangeMax?: ScreenRange;
}) => {
  const tokens = { ...SCREENS_TOKENS, ...SCREENS_TOKENS_2 };

  const rangeMinPx = rangeMin ? tokens[rangeMin] : '';
  const rangeMaxPx = rangeMax ? tokens[rangeMax] : '';
  return useCustomMediaQuery({
    rangeMinPx,
    rangeMaxPx,
  });
};
