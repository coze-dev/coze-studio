import { FieldArray, type FieldProps } from '@/form';

import { OrderBy } from './order-by';

export function OrderByField({ name }: Pick<FieldProps, 'name'>) {
  return (
    <FieldArray name={name}>
      <OrderBy />
    </FieldArray>
  );
}
