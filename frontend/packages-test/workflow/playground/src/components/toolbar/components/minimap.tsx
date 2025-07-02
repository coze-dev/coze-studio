import {
  FlowMinimapService,
  MinimapRender,
} from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';

import type { ToolbarHandlers } from '../type';

interface IMinimap {
  handlers: ToolbarHandlers;
}

export const Minimap = (props: IMinimap) => {
  const { handlers } = props;
  const { minimapVisible } = handlers;
  const minimapService = useService(FlowMinimapService);
  if (!minimapVisible) {
    return <></>;
  }
  return (
    <div
      className="workflow-toolbar-minimap flex mb-2"
      data-testid="workflow.detail.toolbar.minimap"
    >
      <MinimapRender
        service={minimapService}
        panelStyles={{}}
        containerStyles={{
          pointerEvents: 'auto',
          position: 'relative',
          top: 'unset',
          right: 'unset',
          bottom: 'unset',
          left: 'unset',
        }}
        inactiveStyle={{
          opacity: 1,
          scale: 1,
          translateX: 0,
          translateY: 0,
        }}
      />
    </div>
  );
};
