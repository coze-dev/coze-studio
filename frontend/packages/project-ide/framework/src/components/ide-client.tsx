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
      // 兼容 mnt e2e 环境，在 e2e 环境下，高度会被坍缩成 0
      // 因此需要额外的样式兼容
      // className={(window as any)._mnt_e2e_testing_ ? 'e2e-flow-container' : ''}
      // TODO: 等待@zengdeping 添加环境变量后重置
      className="e2e-flow-container"
    >
      {children}
    </IDEClient>
  );
};
