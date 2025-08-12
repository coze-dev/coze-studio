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

import { Layer } from '@flowgram-adapter/free-layout-editor';
import { Collapse } from '@douyinfe/semi-ui';

import { VariableDebugPanel } from './content';

export class VariableDebugLayer extends Layer {
  render(): JSX.Element {
    return (
      <div
        style={{
          position: 'fixed',
          right: 50,
          top: 100,
          background: '#fff',
          borderRadius: 5,
          boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.1)',
          zIndex: 999,
        }}
      >
        <Collapse>
          <Collapse.Panel header="Variable (Debug)" itemKey="1">
            <VariableDebugPanel />
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}
