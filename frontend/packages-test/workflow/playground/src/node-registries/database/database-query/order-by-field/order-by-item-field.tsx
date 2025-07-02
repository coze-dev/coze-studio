import { useCurrentDatabaseField } from '@/node-registries/database/common/hooks';
import { DataTypeTag } from '@/node-registries/common/components';
import { Label, withField, useField } from '@/form';

import { type OrderByFieldSchema } from './types';
import { AceOrDescField } from './ace-or-desc-field';

export const OrderByItemField = withField(() => {
  const { name, value } = useField<OrderByFieldSchema>();
  const databaseField = useCurrentDatabaseField(value?.fieldID);

  return (
    <>
      <Label
        className="w-[138px]"
        extra={<DataTypeTag type={databaseField?.type}></DataTypeTag>}
      >
        <span className="w-[90px] truncate">{databaseField?.name}</span>
      </Label>
      <AceOrDescField name={`${name}.isAsc`} type={databaseField?.type} />
    </>
  );
});
