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
 
import { type CSSProperties, type HTMLAttributes } from 'react';

import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

/**
 * 拆分自 packages/data/database-v2/src/components/database-table-data/index.tsx
 * 原本实现基本是从 Semi 文档复制过来的，排序后的数据也没有提交给服务端，PM 似乎也不知道有这个功能，所以 ...
 * @see 
 */
export const SortableRow = (
  // https://github.com/DouyinFE/semi-design/blob/v2.69.2/packages/semi-ui/table/Body/BaseRow.tsx#L396
  // eslint-disable-next-line @typescript-eslint/naming-convention -- semi 没有导出 table row props 的类型
  sortProps: HTMLAttributes<HTMLTableRowElement> & { 'data-row-key': string },
) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortProps['data-row-key'],
  });
  const style: CSSProperties = {
    ...sortProps.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1 : undefined,
    position: isDragging ? 'relative' : undefined,
  };

  return (
    <tr
      {...sortProps}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    />
  );
};
