import { FormItemSchemaType } from '../../constants';

export function getTestsetFormSubFieldType(type: string) {
  switch (type) {
    case FormItemSchemaType.STRING:
      return 'String';
    case FormItemSchemaType.FLOAT:
    case FormItemSchemaType.NUMBER:
      return 'Number';
    case FormItemSchemaType.OBJECT:
      return 'Object';
    case FormItemSchemaType.BOOLEAN:
      return 'Boolean';
    case FormItemSchemaType.INTEGER:
      return 'Integer';
    default:
      return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
  }
}
