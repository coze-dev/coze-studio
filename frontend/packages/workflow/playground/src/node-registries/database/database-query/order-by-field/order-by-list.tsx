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
  SortableList,
  SortableItem,
  FieldArrayList,
  FieldArrayItem,
  useFieldArray,
} from '@/form';

import { type OrderByFieldSchema } from './types';
import { OrderByItemField } from './order-by-item-field';

export function OrderByList() {
  const { value, move, remove, name, readonly } =
    useFieldArray<OrderByFieldSchema>();
  return (
    <FieldArrayList>
      <SortableList
        onSortEnd={({ from, to }) => {
          move(from, to);
        }}
      >
        {value?.map((item, index) => (
          <SortableItem
            key={item?.fieldID}
            sortableID={item?.fieldID}
            index={index}
          >
            <FieldArrayItem
              disableRemove={readonly}
              onRemove={() => {
                remove(index);
              }}
            >
              <OrderByItemField name={`${name}.${index}`} />
            </FieldArrayItem>
          </SortableItem>
        ))}
      </SortableList>
    </FieldArrayList>
  );
}
