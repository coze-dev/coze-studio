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

import {
  FlowMinimapService,
  MinimapRender,
} from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/fixed-layout-editor';

export const Minimap = ({ visible }: { visible: boolean }) => {
  const minimapService = useService(FlowMinimapService);
  if (!visible) {
    return <></>;
  }
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '60px',
        width: '198px',
        zIndex: 99,
      }}
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
