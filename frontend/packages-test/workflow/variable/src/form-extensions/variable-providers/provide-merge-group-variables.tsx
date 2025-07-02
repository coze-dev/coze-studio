import {
  ASTFactory,
  ASTKind,
  type ObjectType,
} from '@flowgram-adapter/free-layout-editor';
import { type VariableProviderAbilityOptions } from '@flowgram-adapter/free-layout-editor';
import { type EffectOptions } from '@flowgram-adapter/free-layout-editor';

import { createEffectFromVariableProvider } from '../../utils/variable-provider';
import { setValueIn } from '../../utils/form';
import { type RefExpression } from '../../typings';
import {
  createMergeGroupExpression,
  MergeStrategy,
} from '../../core/extend-ast/merge-group-expression';
import { createRefExpression } from '../../core/extend-ast/custom-key-path-expression';
import { WorkflowVariableFacadeService } from '../../core';

interface MergeGroup {
  name: string;
  variables: RefExpression[];
}

/**
 * 合并组变量同步
 */
export const provideMergeGroupVariables: VariableProviderAbilityOptions = {
  key: 'provide-merge-group-variables',
  namespace: '/node/outputs',
  parse(value: MergeGroup[], context) {
    const nodeId = context.node.id;

    return [
      ASTFactory.createVariableDeclaration({
        key: `${nodeId}.outputs`,
        type: ASTFactory.createObject({
          properties: value?.map(_item =>
            ASTFactory.createProperty({
              key: _item?.name,
              initializer: createMergeGroupExpression({
                mergeStrategy: MergeStrategy.FirstNotEmpty,
                expressions: _item.variables.map(_v =>
                  createRefExpression({
                    keyPath: _v?.content?.keyPath || [],
                    rawMeta: _v?.rawMeta,
                  }),
                ),
              }),
            }),
          ),
        }),
      }),
    ];
  },
  onInit(ctx) {
    const facadeService = ctx.node.getService(WorkflowVariableFacadeService);

    return ctx.scope.ast.subscribe(() => {
      // 监听输出变量变化，回填到表单的 outputs
      const outputVariable = ctx.scope.output.variables[0];
      if (outputVariable?.type?.kind === ASTKind.Object) {
        const { properties } = outputVariable.type as ObjectType;

        const nextOutputs = properties
          .map(
            _property =>
              // OutputTree 组件中，所有树节点的 key 需要保证是唯一的
              facadeService.getVariableFacadeByField(_property)
                .viewMetaWithUniqKey,
          )
          .filter(Boolean);

        setValueIn(ctx.node, 'outputs', nextOutputs);
      }
    });
  },
};

export const provideMergeGroupVariablesEffect: EffectOptions[] =
  createEffectFromVariableProvider(provideMergeGroupVariables);
