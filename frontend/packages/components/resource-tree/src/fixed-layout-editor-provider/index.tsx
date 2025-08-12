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

import { useMemo, useCallback, forwardRef } from 'react';

import { type interfaces } from 'inversify';
import {
  FlowDocument,
  createPluginContextDefault,
  PlaygroundReactProvider,
} from '@flowgram-adapter/fixed-layout-editor';

import {
  createFixedLayoutPreset,
  type FixedLayoutPluginContext,
  type FixedLayoutProps,
} from './preset';

export const FixedLayoutEditorProvider = forwardRef<
  FixedLayoutPluginContext,
  FixedLayoutProps
>(function FixedLayoutEditorProvider(props: FixedLayoutProps, ref) {
  const { parentContainer, children, ...others } = props;
  const preset = useMemo(() => createFixedLayoutPreset(others), []);
  const customPluginContext = useCallback(
    (container: interfaces.Container) =>
      ({
        ...createPluginContextDefault(container),
        get document(): FlowDocument {
          return container.get<FlowDocument>(FlowDocument);
        },
      } as FixedLayoutPluginContext),
    [],
  );
  return (
    <PlaygroundReactProvider
      ref={ref}
      plugins={preset}
      customPluginContext={customPluginContext}
      parentContainer={parentContainer}
    >
      {children}
    </PlaygroundReactProvider>
  );
});
