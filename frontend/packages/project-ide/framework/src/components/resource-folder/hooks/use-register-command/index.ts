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

import { useEffect, useRef } from 'react';

import { CommandRegistry, useIDEService } from '@coze-project-ide/client';

import { ContextMenuConfigMap } from '../use-right-click-panel/constant';
import {
  type RightPanelConfigType,
  type ResourceFolderContextType,
  type ResourceType,
} from '../../type';
import { BaseResourceContextMenuBtnType } from '../../constant';

const useRegisterCommand = ({
  isFocus,
  id,
  updateContext,
  clearContext,
  selectedIdRef,
  tempSelectedMapRef,
}: {
  isFocus: boolean;
  id: string;
  updateContext: (v: Partial<ResourceFolderContextType>) => void;
  clearContext: () => void;
  selectedIdRef: React.MutableRefObject<string>;
  tempSelectedMapRef: React.MutableRefObject<Record<string, ResourceType>>;
}) => {
  const cbRef = useRef<Record<string, (v?: any) => void>>({});
  const commandRegistry = useIDEService<CommandRegistry>(CommandRegistry);

  const dispatchInstance = useRef<ResourceFolderContextType>({
    onEnter: () => {
      cbRef.current[BaseResourceContextMenuBtnType.EditName]?.();
    },
    onDelete: () => {
      cbRef.current[BaseResourceContextMenuBtnType.Delete]?.();
    },
    onCreateFolder: () => {
      cbRef.current[BaseResourceContextMenuBtnType.CreateFolder]?.();
    },
    onCreateResource: () => {
      cbRef.current[BaseResourceContextMenuBtnType.CreateResource]?.();
    },
  });

  const registerEvent = (type: BaseResourceContextMenuBtnType, cb) => {
    cbRef.current[type] = cb;
  };

  const registerCommand = (config: RightPanelConfigType[]) => {
    config.forEach(command => {
      if ('type' in command) {
        return;
      }

      if (ContextMenuConfigMap[command.id]) {
        if (command.label || command.shortLabel) {
          commandRegistry.updateCommand(command.id, {
            ...(command.label ? { label: command.label } : {}),
            ...(command.shortLabel ? { shortLabel: command.shortLabel } : {}),
          });
        }
      } else if (command.execute) {
        // If there is a custom execute function, it will only need to be re-registered.
        if (commandRegistry.getCommand(command.id)) {
          commandRegistry.unregisterCommand(command.id);
        }
        commandRegistry.registerCommand(
          {
            id: command.id,
            label: command.label,
            shortLabel: command.label,
          },
          {
            execute: () => {
              command.execute?.();
            },
            isEnabled: opt => !opt.disabled,
            isVisible: opt => !opt.isHidden,
          },
        );
      }
    });
  };

  useEffect(() => {
    if (isFocus) {
      updateContext({
        ...dispatchInstance.current,
        currentSelectedId: selectedIdRef.current,
        tempSelectedMap: tempSelectedMapRef.current,
        id,
      });
    } else {
      clearContext();
    }
  }, [isFocus]);

  return {
    registerEvent,
    registerCommand,
  };
};

export { useRegisterCommand };
