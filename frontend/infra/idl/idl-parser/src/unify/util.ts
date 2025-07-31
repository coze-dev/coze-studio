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
  SyntaxType,
  type ContainerType,
  type MapType,
  type FieldType,
} from './type';

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
