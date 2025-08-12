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
  type RefObject,
  createContext,
  useContext,
  useEffect,
  type SetStateAction,
  type Dispatch,
  useState,
  useMemo,
} from 'react';

import { noop, omit } from 'lodash-es';
import { useSize } from 'ahooks';

interface TConfigItem {
  width?: number;
}

type ContextItems = Record<symbol, TConfigItem>;

interface CollapsibleIconButtonContextValue {
  showText: boolean;
  setItems: Dispatch<SetStateAction<ContextItems | undefined>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention -- this is context
export const CollapsibleIconButtonContext =
  createContext<CollapsibleIconButtonContextValue>({
    showText: true,
    setItems: noop,
  });

export const useItem = (key: symbol, ref: RefObject<HTMLElement>) => {
  const { showText, setItems } = useContext(CollapsibleIconButtonContext);
  const size = useSize(ref);
  useEffect(() => {
    setItems(items => ({
      ...items,
      [key]: { width: size?.width ?? 0 },
    }));
  }, [size?.width]);

  // Component destruction and removal
  useEffect(
    () => () => {
      setItems(items => omit(items, key));
    },
    [],
  );

  return showText;
};

export const useWrapper = (ref: RefObject<HTMLElement>, gap = 0) => {
  const [items, setItems] = useState<ContextItems>();
  const size = useSize(ref);

  const totalWidth = Object.getOwnPropertySymbols(items || {}).reduce<number>(
    (res, key, index) =>
      res + (items?.[key]?.width ?? 0) + (index > 0 ? gap : 0),
    0,
  );
  const showText = !!size?.width && size.width >= totalWidth;

  const contextValue = useMemo<CollapsibleIconButtonContextValue>(
    () => ({
      showText,
      setItems,
    }),
    [showText],
  );

  return contextValue;
};
