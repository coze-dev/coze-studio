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

/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from 'react';
import { useRef, useEffect } from 'react';

import { MenuService, useIDEService } from '@coze-project-ide/client';

import { createUniqId } from '../../utils';
import { type ResourceType, type RightPanelConfigType } from '../../type';
import { RESOURCE_FOLDER_WRAPPER_CLASS } from '../../constant';
import { handleConfig } from './util';
import { ContextMenuConfigMap } from './constant';

const commandIdStashSet: Set<string> = new Set();

const RESOURCE_FOLDER_SEPARATOR_KEY = 'resource-folder-separator-key';

const useRightClickPanel = ({
  tempSelectedMapRef,
  contextMenuHandler,
  registerCommand,
  id,
  contextMenuDisabled,
  onContextMenuVisibleChange,
}: {
  tempSelectedMapRef: React.MutableRefObject<Record<string, ResourceType>>;
  contextMenuHandler?: (v: ResourceType[]) => RightPanelConfigType[];
  registerCommand: (config: RightPanelConfigType[]) => void;
  id: string;
  contextMenuDisabled?: boolean;
  onContextMenuVisibleChange?: (v: boolean) => void;
}) => {
  const menuService = useIDEService<MenuService>(MenuService);

  const separatorNum = useRef(0);
  const menuNum = useRef(0);
  const rightPanelVisible = useRef(false);
  const changeRightPanelVisible = (v: boolean) => {
    if (rightPanelVisible.current !== v) {
      rightPanelVisible.current = v;
      onContextMenuVisibleChange?.(rightPanelVisible.current);
    }
  };

  const clearMenuItems = () => {
    menuService.clearMenuItems(
      [
        ...commandIdStashSet.keys(),
        ...Object.keys(ContextMenuConfigMap),
        ...new Array(separatorNum.current)
          .fill(null)
          .map(_ => command => command === RESOURCE_FOLDER_SEPARATOR_KEY),
      ].filter(Boolean),
    );
    separatorNum.current = 0;
    menuNum.current = 0;
  };

  const dispose = () => {
    clearMenuItems();
    (menuService as any)?.contextMenu?.menu?.close?.();
    changeRightPanelVisible?.(false);
  };

  const contextMenuCallback = (e, resources?: ResourceType[]) => {
    const baseConfig = contextMenuHandler
      ? contextMenuHandler(
          resources || Object.values(tempSelectedMapRef.current),
        )
      : [];

    const config = handleConfig(baseConfig);

    registerCommand(config);

    clearMenuItems();

    config.forEach(v => {
      if ('type' in v) {
        separatorNum.current = separatorNum.current + 1;
        menuNum.current = menuNum.current + 1;
        menuService.addMenuItem({
          command: RESOURCE_FOLDER_SEPARATOR_KEY,
          type: 'separator',
          selector: `.${createUniqId(RESOURCE_FOLDER_WRAPPER_CLASS, id)}`,
        });
        return;
      }
      if (!v.id) {
        return;
      }

      if (!commandIdStashSet.has(v.id)) {
        commandIdStashSet.add(v.id);
      }
      if (!contextMenuDisabled) {
        menuNum.current = menuNum.current + 1;
        menuService.addMenuItem({
          command: v.id,
          selector: `.${createUniqId(RESOURCE_FOLDER_WRAPPER_CLASS, id)}`,
          args: v,
          tooltip: v.tooltip,
        });
      }
    });

    if (!contextMenuDisabled && menuNum.current > 0) {
      menuService.open(e);
      setTimeout(() => {
        changeRightPanelVisible?.(true);
      }, 0);
    }

    return () => {
      dispose();
    };
  };

  useEffect(() => {
    (menuService as any)?.contextMenu?.menu?.aboutToClose?.connect?.(() => {
      if (rightPanelVisible.current) {
        changeRightPanelVisible?.(false);
      }
    });
    return () => {
      dispose();
    };
  }, []);

  return { contextMenuCallback, closeContextMenu: dispose };
};

export { useRightClickPanel };
