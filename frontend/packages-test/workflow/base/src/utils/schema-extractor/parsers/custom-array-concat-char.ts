import { get } from 'lodash-es';

import { type SchemaExtractorArrayConcatCharParser } from '../type';
import { SYSTEM_DELIMITERS } from '../constant';

export const arrayConcatCharParser: SchemaExtractorArrayConcatCharParser =
  concatParams => {
    const allArrayItemConcatChars = (concatParams || []).find(
      v => v.name === 'allArrayItemConcatChars',
    );

    let customConcatChars = '';
    if (allArrayItemConcatChars) {
      const list = get(allArrayItemConcatChars, 'input.value.content', []) as {
        value: string;
      }[];

      const customItems = list.filter(
        v => !SYSTEM_DELIMITERS.includes(v.value),
      );
      customConcatChars = customItems.map(v => v.value).join(', ');
    }

    return customConcatChars;
  };
