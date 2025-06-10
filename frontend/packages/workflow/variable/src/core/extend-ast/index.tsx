import {
  VariableFieldKeyRenameService,
  type VariablePluginOptions,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowVariableFacadeService } from '../workflow-variable-facade-service';
import { WrapArrayExpression } from './wrap-array-expression';
import { MergeGroupExpression } from './merge-group-expression';
import { ExtendBaseType } from './extend-base-type';
import { CustomKeyPathExpression } from './custom-key-path-expression';
import { CustomArrayType } from './custom-array-type';

export const extendASTNodes: VariablePluginOptions['extendASTNodes'] = [
  [
    CustomKeyPathExpression,
    ctx => ({
      facadeService: ctx.get(WorkflowVariableFacadeService),
      renameService: ctx.get(VariableFieldKeyRenameService),
    }),
  ],
  [
    WrapArrayExpression,
    ctx => ({
      facadeService: ctx.get(WorkflowVariableFacadeService),
      renameService: ctx.get(VariableFieldKeyRenameService),
    }),
  ],
  CustomArrayType,
  ExtendBaseType,
  MergeGroupExpression,
];
