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

// Template component for shortcut command replacement
import { type FC, useMemo, useRef } from 'react';

import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import { useMessageWidth } from '@coze-common/chat-area';
import { UIIconButton } from '@coze-arch/bot-semi';
import { IconShortcutTemplateClose } from '@coze-arch/bot-icons';

import { getDSLFromComponents } from '../utils/dsl-template';
import { useGetUploadPluginInstance } from '../hooks/use-upload-plugin';
import { type TValue } from '../components/short-cut-panel/widgets/types';
import { ShortCutPanel } from '../components/short-cut-panel';

import style from './index.module.less';

interface ShortcutTemplateProps {
  shortcut: Partial<ShortCutCommand>;
  visible?: boolean;
  readonly?: boolean;
  onClose?: () => void;
  onSubmit?: (componentsFormValues: Record<string, TValue>) => void;
}
export const ShortcutTemplate: FC<ShortcutTemplateProps> = props => {
  const { shortcut, onClose, visible, readonly, onSubmit } = props;
  const shortcutTemplateRef = useRef<HTMLDivElement>(null);
  const getRegisteredPluginInstance = useGetUploadPluginInstance();
  const messageWidth = useMessageWidth();

  const dsl = useMemo(() => {
    const showComponents =
      shortcut.components_list?.filter(com => !com.hide) ?? [];
    return getDSLFromComponents(showComponents);
  }, [shortcut.components_list]);

  const onShortcutPanelSubmit = (values: Record<string, TValue>) => {
    onSubmit?.(values);
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <div
        ref={shortcutTemplateRef}
        className={style['shortcut-template']}
        style={{
          width: `calc(${messageWidth} - 48px)`,
        }}
      >
        {/*header*/}
        <div className="flex items-center text-sm coz-fg-primary px-4 py-[6px] coz-bg-primary rounded-t-3xl h-8">
          {shortcut.shortcut_icon?.url ? (
            <img
              src={shortcut.shortcut_icon.url}
              alt="icon"
              className="mr-1 h-[14px]"
            />
          ) : null}
          <div>{shortcut.command_name}</div>
          <UIIconButton
            icon={<IconShortcutTemplateClose />}
            onClick={onClose}
            wrapperClass="ml-auto"
          />
        </div>
        {/*content*/}
        <div className="p-3">
          <ShortCutPanel
            uploadFile={({ file, onError, onProgress, onSuccess }) => {
              getRegisteredPluginInstance?.({
                file,
                onProgress,
                onError,
                onSuccess,
              });
            }}
            readonly={readonly}
            onSubmit={onShortcutPanelSubmit}
            dsl={dsl}
          />
        </div>
      </div>
    </>
  );
};
