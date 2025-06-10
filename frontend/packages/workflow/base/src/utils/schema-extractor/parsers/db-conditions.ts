import { type SchemaExtractorDbConditionsParser } from '../type';
import { inputParametersParser } from './input-parameters';
export const dbConditionsParser: SchemaExtractorDbConditionsParser =
  conditionList =>
    conditionList
      ?.flatMap(conditions => inputParametersParser(conditions || []))
      ?.filter(Boolean) as ReturnType<SchemaExtractorDbConditionsParser>;
