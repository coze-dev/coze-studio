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
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
} from 'react';

import { useUpdateEffect } from 'ahooks';

import { type IBuilderChatProps } from '../type';
import { combineAppDataWithProps } from '../services/get-bot-info';
import { type InitData } from '../data-type';

interface BuilderChatContextValue {
  appDataFromOnLine?: InitData | null;
  appDataCombineWithProps?: InitData | null;
}
type BuilderChatContextProps = BuilderChatContextValue & {
  setAppDataFromOnLine?: (appDataFromOnLint: InitData | null) => void;
  setAppDataCombineWithProps?: (
    appDataCombineWithProps: InitData | null,
  ) => void;
};
const BuilderChatContext = createContext<BuilderChatContextProps>({
  appDataFromOnLine: null,
  appDataCombineWithProps: null,
});

export const BuilderChatProvider: FC<
  PropsWithChildren<BuilderChatContextProps>
> = ({ children, ...props }) => (
  <BuilderChatContext.Provider value={props} children={children} />
);

export const useGetAppDataFromOnLine = () => {
  const { appDataFromOnLine } = useContext(BuilderChatContext);
  return appDataFromOnLine;
};

export const useGetAppDataCombineWithProps = () => {
  const { appDataCombineWithProps } = useContext(BuilderChatContext);
  return appDataCombineWithProps;
};

export const useSetAppDataFromOnLine = () => {
  const { setAppDataFromOnLine } = useContext(BuilderChatContext);
  return setAppDataFromOnLine;
};
export const useUpdateAppDataCombineWithProps = (props: IBuilderChatProps) => {
  const { appDataFromOnLine, setAppDataCombineWithProps } =
    useContext(BuilderChatContext);
  useUpdateEffect(() => {
    if (appDataFromOnLine) {
      const formatAPPInfo = combineAppDataWithProps(appDataFromOnLine, props);
      setAppDataCombineWithProps?.(formatAPPInfo);
    }
  }, [appDataFromOnLine, props]);
};
