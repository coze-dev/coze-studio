import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type IFormSchema } from '@coze-workflow/test-run-next';
/**
 * 目前项目中从 flow-sdk 导入的类型位置比较混乱
 * test run 全部收口到 kit
 */
export { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

interface Context {
  isChatflow: boolean;
  isInProject: boolean;
  workflowId: string;
  spaceId: string;
}
/**
 * Node Registry Test Meta
 */
export type NodeTestMeta =
  | {
      /**
       * 是否支持测试集
       */
      testset?: boolean;
      /**
       * TestRun 运行所需的关联上下文
       */
      generateRelatedContext?: (
        node: WorkflowNodeEntity,
        context: Context,
      ) => IFormSchema | null | Promise<IFormSchema | null>;
      generateFormInputProperties?: (
        node: WorkflowNodeEntity,
      ) => IFormSchema['properties'] | Promise<IFormSchema['properties']>;
      generateFormBatchProperties?: (
        node: WorkflowNodeEntity,
      ) => IFormSchema['properties'] | Promise<IFormSchema['properties']>;
      generateFormSettingProperties?: (
        node: WorkflowNodeEntity,
      ) => IFormSchema['properties'] | Promise<IFormSchema['properties']>;
    }
  | boolean;
