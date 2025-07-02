import { type SchemaExtractorJSONStringParser } from '../type';

export const jsonStringParser: SchemaExtractorJSONStringParser = (
  jsonString: string,
) => JSON.parse(jsonString || '{}') as object | object[] | undefined;
