import {
  type WorkflowJSON,
  type SchemaExtractorConfig,
  type SchemaExtracted,
  SchemaExtractor,
} from '@coze-workflow/base';

export const schemaExtractor = (params: {
  schema: WorkflowJSON;
  config: SchemaExtractorConfig;
}): SchemaExtracted[] => {
  const { schema, config } = params;
  const extractor = new SchemaExtractor(schema);
  const extractedSchema: SchemaExtracted[] = extractor.extract(config);
  return extractedSchema;
};
