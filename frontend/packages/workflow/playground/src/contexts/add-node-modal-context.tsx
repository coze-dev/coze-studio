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
  useContext,
  forwardRef,
  type PropsWithChildren,
  useImperativeHandle,
} from 'react';

import { type AddNodeRef } from '@/typing';
import { useAddNode } from '@/hooks/use-add-node';

export type AddNodeModalContextType = Partial<
  Pick<
    ReturnType<typeof useAddNode>,
    'openImageflow' | 'openWorkflow' | 'openPlugin' | 'updateAddNodePosition'
  >
>;
export type AddNodeModalProviderRefType = AddNodeRef;

const AddNodeModalContext = createContext<AddNodeModalContextType>({});

export const useAddNodeModalContext = () => useContext(AddNodeModalContext);

export const AddNodeModalProvider = forwardRef<
  AddNodeModalProviderRefType,
  PropsWithChildren<{ readonly: boolean }>
>(({ readonly, children }, ref) => {
  const {
    handleAddNode,
    updateAddNodePosition,
    modals,
    openPlugin,
    openWorkflow,
    openImageflow,
  } = useAddNode();
  useImperativeHandle(
    ref,
    () => ({
      handleAddNode: (item, coord, isDrag) => {
        if (readonly) {
          return;
        }
        handleAddNode(item, coord, isDrag);
      },
    }),
    [readonly, handleAddNode],
  );
  return (
    <AddNodeModalContext.Provider
      value={{ openPlugin, openWorkflow, openImageflow, updateAddNodePosition }}
    >
      {children}
      {modals}
    </AddNodeModalContext.Provider>
  );
});
