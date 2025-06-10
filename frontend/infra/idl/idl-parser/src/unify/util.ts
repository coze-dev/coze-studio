import { SyntaxType, type ContainerType, type MapType, type FieldType } from './type';

export function convertIntToString(fType: FieldType): FieldType {
  const fieldType = { ...fType };
  const intTypes = [
    SyntaxType.I8Keyword,
    SyntaxType.I16Keyword,
    SyntaxType.I32Keyword,
    SyntaxType.I64Keyword,
  ];
  if (intTypes.includes(fieldType.type)) {
    fieldType.type = SyntaxType.StringKeyword;
  } else if ((fieldType as ContainerType).valueType) {
    (fieldType as ContainerType).valueType = convertIntToString(
      (fieldType as ContainerType).valueType,
    );
    if ((fieldType as MapType).keyType) {
      (fieldType as MapType).keyType = convertIntToString(
        (fieldType as MapType).keyType,
      );
    }
  }

  return fieldType;
}
