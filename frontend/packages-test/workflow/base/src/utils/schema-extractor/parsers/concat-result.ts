import { get } from 'lodash-es';

import { type SchemaExtractorConcatResultParser } from '../type';

export const concatResultParser: SchemaExtractorConcatResultParser =
  concatParams => {
    const concatResult = (concatParams || []).find(
      v => v.name === 'concatResult',
    );
    return get(concatResult, 'input.value.content', '') as string;
  };
