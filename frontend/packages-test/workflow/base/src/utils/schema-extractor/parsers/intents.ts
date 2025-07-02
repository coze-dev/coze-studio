import { type SchemaExtractorIntentsParamParser } from '../type';

export const intentsParser: SchemaExtractorIntentsParamParser = intents => ({
  intent: intents.map((item, idx) => `${idx + 1}. ${item.name}`).join(' '),
});
