import { get } from 'lodash-es';

import { parseExpression } from '../utils';
import { type SchemaExtractorInputParametersParser } from '../type';
import type { InputValueDTO } from '../../../types';
export const inputParametersParser: SchemaExtractorInputParametersParser =
  inputParameters => {
    let parameters: InputValueDTO[] = [];
    if (!Array.isArray(inputParameters)) {
      if (typeof inputParameters === 'object') {
        Object.keys(inputParameters || {}).forEach(key => {
          parameters.push({
            name: key,
            input: inputParameters[key],
          });
        });
      }
    } else {
      parameters = inputParameters;
    }

    return parameters
      .map(inputParameter => {
        const expression = get(inputParameter, 'input');
        const parsedExpression = parseExpression(expression);
        if (!parsedExpression) {
          return null;
        }
        return {
          name: inputParameter.name,
          ...parsedExpression,
        };
      })
      .filter(Boolean) as ReturnType<SchemaExtractorInputParametersParser>;
  };
