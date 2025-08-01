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

import { type ReactNode } from 'react';

import {
  useGetToolColumns,
  type UseGetToolColumnsProps,
} from '@coze-studio/plugin-tool-columns';

export interface UseGetToolColumnsAdapterProps
  extends Omit<UseGetToolColumnsProps, 'customRender'> {
  unlockPlugin: () => Promise<void>;
  refreshPage: () => void;
}

export type UseGetToolColumnsAdapterType = (
  props: UseGetToolColumnsAdapterProps,
) => {
  reactNode?: ReactNode;
} & ReturnType<typeof useGetToolColumns>;

export const useGetToolColumnsAdapter: UseGetToolColumnsAdapterType = props => {
  const { getColumns } = useGetToolColumns(props);
  return { getColumns };
};
