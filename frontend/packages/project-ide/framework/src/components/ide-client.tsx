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

import React, { useCallback } from 'react';

import { IDEClient, type IDEClientOptions } from '@coze-project-ide/client';

import { type ProjectIDEClientProps as PresetPluginOptions } from '../types';
import {
  createPresetPlugin,
  createCloseConfirmPlugin,
  createContextMenuPlugin,
} from '../plugins';

interface ProjectIDEClientProps {
  presetOptions: PresetPluginOptions;
  plugins?: IDEClientOptions['plugins'];
}

export const ProjectIDEClient: React.FC<
  React.PropsWithChildren<ProjectIDEClientProps>
> = ({ presetOptions, plugins, children }) => {
  const options = useCallback(() => {
    const temp: IDEClientOptions = {
      preferences: {
        defaultData: {
          theme: 'light',
        },
      },
      view: {
        restoreDisabled: true,
        widgetFactories: [],
        defaultLayoutData: {},
        widgetFallbackRender: presetOptions.view.widgetFallbackRender,
      },
      plugins: [
        createPresetPlugin(presetOptions),
        createCloseConfirmPlugin(),
        createContextMenuPlugin(),
        ...(plugins || []),
      ],
    };
    return temp;
  }, [presetOptions, plugins]);

  return (
    <IDEClient
      options={options}
      // Compatible with mnt e2e environment, in e2e environment, the height will collapse to 0
      // Therefore, additional style compatibility is required
      // className={(window as any)._mnt_e2e_testing_ ? 'e2e-flow-container' : ''}
      className="e2e-flow-container"
    >
      {children}
    </IDEClient>
  );
};
