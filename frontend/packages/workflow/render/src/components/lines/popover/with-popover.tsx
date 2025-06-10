import React from 'react';

import { FlowRendererRegistry } from '@flowgram-adapter/free-layout-editor';
import {
  useService,
  WorkflowHoverService,
} from '@flowgram-adapter/free-layout-editor';

const LINE_POPOVER = 'line-popover';

export default function WithPopover(Component) {
  return function WrappedComponent(props) {
    const hoverService = useService<WorkflowHoverService>(WorkflowHoverService);

    const renderRegistry =
      useService<FlowRendererRegistry>(FlowRendererRegistry);

    const Popover =
      renderRegistry.tryToGetRendererComponent(LINE_POPOVER)?.renderer;

    const { line } = props;
    const isHovered = hoverService.isHovered(line._id);

    return (
      <>
        <Component {...props} />
        {Popover ? <Popover line={line} isHovered={isHovered} /> : null}
      </>
    );
  };
}
