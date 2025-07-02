import type { SchemaExtractorImageReferenceParser } from '../type';
import { inputParametersParser } from './input-parameters';
export const imageReferenceParser: SchemaExtractorImageReferenceParser =
  references => {
    if (!Array.isArray(references)) {
      return [];
    }
    return inputParametersParser(
      references.map(ref => ({
        name: '-',
        input: ref.url,
      })),
    );
  };
