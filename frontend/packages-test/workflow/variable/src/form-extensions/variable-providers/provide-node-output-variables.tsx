import { type VariableProviderAbilityOptions } from '@flowgram-adapter/free-layout-editor';

import { parseNodeOutputByViewVariableMeta } from '../../core';

export const provideNodeOutputVariables: VariableProviderAbilityOptions = {
  key: 'provide-node-output-variables',
  namespace: '/node/outputs',
  parse(value, context) {
    return parseNodeOutputByViewVariableMeta(context.node.id, value);
  },
};
