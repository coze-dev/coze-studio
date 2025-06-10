import { FormItemSchemaType } from '../../constants';

function isNumberType(t: string) {
  return t === FormItemSchemaType.NUMBER || t === FormItemSchemaType.FLOAT;
}

/** 判断类型一致，**特化：**`number`和`float`视为同一类型 */
export const isTestsetFormSameFieldType = (t1?: string, t2?: string) => {
  if (typeof t1 === 'undefined' || typeof t2 === 'undefined') {
    return false;
  }

  return isNumberType(t1) ? isNumberType(t2) : t1 === t2;
};
