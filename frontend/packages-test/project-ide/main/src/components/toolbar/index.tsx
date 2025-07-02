import React from 'react';

import { type ProjectIDEWidget } from '@coze-project-ide/framework';

import { ReloadButton } from './reload-button';
import { FullScreenButton } from './full-screen-button';

export const ToolBar = ({ widget }: { widget: ProjectIDEWidget }) => (
  <div style={{ display: 'flex' }}>
    <ReloadButton widget={widget} />
    <FullScreenButton />
  </div>
);
