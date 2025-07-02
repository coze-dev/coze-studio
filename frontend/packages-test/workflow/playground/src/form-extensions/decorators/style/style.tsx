import React, { useCallback } from 'react';

import { type DecoratorComponentProps } from '@flowgram-adapter/free-layout-editor';

function StyleComponent({
  children,
  options,
}: DecoratorComponentProps): JSX.Element {
  const { style } = options;

  const renderContent = useCallback(
    () => <div style={style}>{children}</div>,
    [],
  );
  return renderContent();
}

export const style = {
  key: 'Style',
  component: StyleComponent,
};
