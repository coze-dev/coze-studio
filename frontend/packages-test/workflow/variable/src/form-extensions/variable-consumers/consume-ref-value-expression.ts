import { ASTFactory, type ASTNode } from '@flowgram-adapter/free-layout-editor';
import { type VariableConsumerAbilityOptions } from '@flowgram-adapter/free-layout-editor';

/**
 * TODO 数组内 variable-consumer 拿不到 value 值
 */
export const consumeRefValueExpression: VariableConsumerAbilityOptions = {
  key: 'consume-ref-value-expression',
  parse(v, ctx) {
    console.log(
      '[ debugger test change ] > ',
      ctx.formItem?.formModel,
      ctx.formItem?.path,
      v,
    );

    return ASTFactory.createKeyPathExpression({
      keyPath: v?.content?.keyPath,
    });
  },
  onInit(ctx) {
    const { options, scope, formItem } = ctx;

    const astKey = options?.namespace || formItem?.path || '';

    return scope.ast.subscribe<ASTNode>(
      _type => {
        console.log('[ debugger type ] >', _type);
      },
      {
        selector: _ast => _ast.get(astKey)?.returnType as ASTNode,
      },
    );
  },
};
