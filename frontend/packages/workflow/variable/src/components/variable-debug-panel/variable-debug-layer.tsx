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
