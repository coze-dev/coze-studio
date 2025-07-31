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
