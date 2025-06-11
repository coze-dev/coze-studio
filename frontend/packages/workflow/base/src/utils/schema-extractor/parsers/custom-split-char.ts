import { get } from 'lodash-es';

import { type SchemaExtractorSplitCharParser } from '../type';
import { SYSTEM_DELIMITERS } from '../constant';

export const splitCharParser: SchemaExtractorSplitCharParser = splitParams => {
  const allDelimiters = (splitParams || []).find(
    v => v.name === 'allDelimiters',
  );

  let customDelimiters = '';
  if (allDelimiters) {
    const list = get(allDelimiters, 'input.value.content', []) as {
      value: string;
    }[];
    const customItems = list.filter(v => !SYSTEM_DELIMITERS.includes(v.value));
    customDelimiters = customItems.map(v => v.value).join(', ');
  }

  return customDelimiters;
};
