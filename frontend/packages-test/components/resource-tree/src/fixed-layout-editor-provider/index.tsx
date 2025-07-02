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
      }) as FixedLayoutPluginContext,
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
