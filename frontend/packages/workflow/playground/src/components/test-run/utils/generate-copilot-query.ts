import { ValueExpressionType } from '@coze-workflow/base';
import {
  type WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

interface CopilotGenerateItem {
  type: string;
  required: boolean;
  name: string;
  schema?: CopilotGenerateItem[] | CopilotGenerateItem;
}

/**
 * 生成copilot的query
 * @param node
 * @returns
 */
export async function generateCopilotQuery(
  node: WorkflowNodeEntity,
): Promise<string> {
  const nodeJSON = await (node.document as WorkflowDocument).toNodeJSON(node);

  const items = (nodeJSON?.data?.inputs?.inputParameters || [])
    .map(({ name, input }) => {
      if (
        !name ||
        !input?.type ||
        input?.assistType ||
        input?.schema?.assistType ||
        input?.value?.type !== ValueExpressionType.REF
      ) {
        return null;
      }

      const item: CopilotGenerateItem = {
        name,
        type: input.type,
        required: true,
      };

      if (input?.schema) {
        item.schema = input.schema;
      }

      return item;
    })
    .filter(Boolean) as CopilotGenerateItem[];

  return JSON.stringify(items);
}
