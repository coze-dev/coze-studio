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

import { type FC, type ReactElement } from 'react';

import { DndProvider } from '../dnd-provider';
import {
  type ConnectDnd,
  useDnDSortableItem,
  type UseDndSortableParams,
} from './hooks';

export interface ITemRenderProps<TData> {
  data: TData;
  connect: ConnectDnd;
  isHovered?: boolean;
  isDragging?: boolean;
}

export type TItemRender<TData> = FC<ITemRenderProps<TData>>;

const ItemWrapper = <TData extends object>({
  id,
  type,
  data,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  itemRender: ItemRender,
  enabled,
  onMove,
  direction,
}: {
  data: TData;
  itemRender: TItemRender<TData>;
} & UseDndSortableParams) => {
  const dndSortableProps = useDnDSortableItem({
    id,
    type,
    onMove,
    enabled,
    direction,
  });
  return <ItemRender {...dndSortableProps} data={data} />;
};

export interface SortableListProps<TData>
  extends Omit<UseDndSortableParams, 'id' | 'onMove'> {
  list: TData[];
  getId?: (data: TData) => string | number;
  onChange: (list: TData[]) => void;
  itemRender: TItemRender<TData>;
}

const defaultGetId = <TData extends { id: string }>(data: TData) => data.id;

export const SortableList = <TData extends object>({
  list,
  type,
  getId = defaultGetId as NonNullable<SortableListProps<TData>['getId']>,
  onChange,
  enabled,
  itemRender,
  direction,
}: SortableListProps<TData>): ReactElement => (
  <DndProvider>
    {list.map(item => {
      const id = getId(item);
      return (
        <ItemWrapper<TData>
          key={id}
          type={type}
          id={id}
          data={item}
          itemRender={itemRender}
          enabled={enabled}
          direction={direction}
          /**
           * Raw array [1, 2, target, 4, 5, source, 7, 8]
           * before = true  j==> [1,2, source, target, 4, 5, 7, 8]
           * before = false ==> [1,2, target, source, 4, 5, 7, 8]
           **/
          onMove={(sourceId, targetId, before) => {
            const newList = [...list];
            const sourceIndex = newList.findIndex(
              source => getId(source) === sourceId,
            );
            const sourceItem = newList.splice(sourceIndex, 1)[0];
            const targetIndex =
              newList.findIndex(target => getId(target) === targetId) +
              (before ? 0 : 1);
            if (sourceIndex === targetIndex) {
              // Do not trigger onChange if the index is the same before and after to avoid frequent rerender
              return;
            }
            sourceItem && newList.splice(targetIndex, 0, sourceItem);
            onChange(newList);
          }}
        />
      );
    })}
  </DndProvider>
);
