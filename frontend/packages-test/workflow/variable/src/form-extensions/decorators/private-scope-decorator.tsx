import React, { type FC } from 'react';

import {
  FlowNodeVariableData,
  ScopeProvider,
} from '@flowgram-adapter/free-layout-editor';
import { type DecoratorComponentProps } from '@flowgram-adapter/free-layout-editor';

const PrivateScopeDecorator: FC<DecoratorComponentProps> = props => {
  const { context, children } = props;

  const privateScope = context.node?.getData(FlowNodeVariableData)?.private;

  if (privateScope) {
    return (
      <ScopeProvider value={{ scope: privateScope }}>{children}</ScopeProvider>
    );
  }

  return <>{children}</>;
};

export const privateScopeDecorator = {
  key: 'PrivateScopeDecorator',
  component: PrivateScopeDecorator,
};
