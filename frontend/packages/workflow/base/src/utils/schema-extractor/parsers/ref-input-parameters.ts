import { get, isPlainObject } from 'lodash-es';

import { isWorkflowImageTypeURL } from '../utils';
import { type SchemaExtractorReferencesParser } from '../type';

interface Item {
  name: string;
  value: string;
  isImage: boolean;
}

interface ReferenceValue {
  type: string;
  value: {
    content: string;
  };
}

export const refInputParametersParser: SchemaExtractorReferencesParser =
  references => {
    const results: Item[] = [];
    for (const refObject of references) {
      const keys = Object.keys(refObject);
      for (const itemName of keys) {
        const itemValue = refObject[itemName];

        if (
          isPlainObject(itemValue) &&
          (itemValue as ReferenceValue)?.type === 'string'
        ) {
          const content = get(itemValue as ReferenceValue, 'value.content');
          results.push({
            name: itemName,
            value: content,
            isImage: isWorkflowImageTypeURL(content),
          });
        }
      }
    }

    return results;
  };
