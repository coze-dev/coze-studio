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
