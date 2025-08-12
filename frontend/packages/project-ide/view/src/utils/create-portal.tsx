/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
