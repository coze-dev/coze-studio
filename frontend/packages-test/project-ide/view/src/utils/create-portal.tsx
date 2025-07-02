import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import ReactDOM from 'react-dom';
import React, { useEffect } from 'react';

import { nanoid } from 'nanoid';
import { useRefresh } from '@coze-project-ide/core';

import { type ReactWidget, ReactWidgetContext } from '../widget/react-widget';

export const createPortal = (
  widget: ReactWidget,
  OriginRenderer: () => React.ReactElement<any, any> | null,
  ErrorFallbackRender: React.FC<FallbackProps & { widget: ReactWidget }>,
) => {
  function PlaygroundReactLayerPortal(): JSX.Element {
    const refresh = useRefresh();
    useEffect(() => {
      const dispose = widget.onUpdate(() => refresh());
      return () => dispose.dispose();
    }, []);
    const result = (
      <ErrorBoundary
        fallbackRender={props => (
          <ErrorFallbackRender {...props} widget={widget} />
        )}
      >
        <ReactWidgetContext.Provider value={widget}>
          <OriginRenderer />
        </ReactWidgetContext.Provider>
      </ErrorBoundary>
    );
    return ReactDOM.createPortal(result, widget.node!);
  }

  return {
    key: widget.getResourceURI()?.toString?.() || nanoid(),
    comp: React.memo(PlaygroundReactLayerPortal) as any,
  };
};
