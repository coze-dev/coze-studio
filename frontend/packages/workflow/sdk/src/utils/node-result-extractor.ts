import {
  type WorkflowJSON,
  type NodeResultExtracted,
  NodeResultExtractor,
  type NodeResult,
} from '@coze-workflow/base';

export const nodeResultExtractor = (params: {
  nodeResults: NodeResult[];
  schema: WorkflowJSON;
}): NodeResultExtracted[] => {
  const { nodeResults, schema } = params;
  const extractor = new NodeResultExtractor(nodeResults, schema);
  return extractor.extract();
};
