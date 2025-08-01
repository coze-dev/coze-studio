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

import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button, Menu } from '@coze-arch/coze-design';

import { type LibraryEntityConfig } from '../types';

export const LibraryHeader: React.FC<{
  entityConfigs: LibraryEntityConfig[];
}> = ({ entityConfigs }) => (
  <div className="flex items-center justify-between mb-[16px]">
    <div className="font-[500] text-[20px]">
      {I18n.t('navigation_workspace_library')}
    </div>
    <Menu
      position="bottomRight"
      className="w-120px mt-4px mb-4px"
      render={
        <Menu.SubMenu mode="menu">
          {entityConfigs.map(config => config.renderCreateMenu?.() ?? null)}
        </Menu.SubMenu>
      }
    >
      <Button
        theme="solid"
        type="primary"
        icon={<IconCozPlus />}
        data-testid="workspace.library.header.create"
      >
        {I18n.t('library_resource')}
      </Button>
    </Menu>
  </div>
);
