import { parseExpression } from '../utils';
import { type SchemaExtractorDbFieldsParser } from '../type';
export const dbFieldsParser: SchemaExtractorDbFieldsParser = dbFields =>
  dbFields
    ?.map(([fieldID, fieldValue]) => {
      const parsedFieldID = parseExpression(fieldID?.input);
      const parsedFieldValue = parseExpression(fieldValue?.input);
      if (!parsedFieldValue) {
        return null;
      }

      return {
        name: parsedFieldID?.value,
        value: parsedFieldValue?.value,
        isImage: parsedFieldValue?.isImage,
      };
    })
    ?.filter(Boolean) as ReturnType<SchemaExtractorDbFieldsParser>;
