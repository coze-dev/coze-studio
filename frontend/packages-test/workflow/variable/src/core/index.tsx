export { extendASTNodes } from './extend-ast';
export {
  parseNodeOutputByViewVariableMeta,
  parseNodeBatchByInputList,
} from './utils/create-ast';
export { WorkflowVariableFacadeService } from './workflow-variable-facade-service';

// 重命名为 WorkflowVariable，便于业务理解
export { WorkflowVariableFacade as WorkflowVariable } from './workflow-variable-facade';
