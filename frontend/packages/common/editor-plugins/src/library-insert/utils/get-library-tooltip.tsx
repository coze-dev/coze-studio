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

import { type RefObject } from 'react';

import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { type Tooltip } from '@coze-arch/coze-design';

import { type ILibraryItem, type LibraryBlockInfo } from '../types';
import { LibraryItem } from '../library-search-popover/library-item';
import { RenameLibraryAction } from '../library-search-popover/actions/rename-library-action';
import { AddLibraryAction } from '../library-search-popover/actions/add-library-action';
import { requestLibraryInfo } from './library-validate';
import type { LibraryStatus } from './get-library-status';
interface GetLibraryTooltipProps {
  editorRef: RefObject<EditorAPI>;
  libraryStatus: LibraryStatus;
  libraryItem: ILibraryItem | null;
  readonly: boolean;
  blockDataInfo: LibraryBlockInfo | null;
  spaceId: string;
  onAddLibrary?: (library: ILibraryItem) => void;
  range: {
    left: number;
    right: number;
  };
  projectId?: string;
  avatarBotId?: string;
  onRename?: (pos: { from: number; to: number }) => void;
  disabled?: boolean;
}

export const getLibraryTooltip = async ({
  editorRef,
  libraryStatus,
  libraryItem,
  blockDataInfo,
  onAddLibrary,
  readonly,
  spaceId,
  range,
  projectId,
  avatarBotId,
  onRename,
  disabled,
}: GetLibraryTooltipProps): Promise<{
  tooltipConfig?: React.ComponentProps<typeof Tooltip>;
}> => {
  try {
    if (disabled) {
      return getHiddenLibraryTooltip();
    }

    if (readonly) {
      return getDisabledLibraryTooltip();
    }

    const { type, id } = blockDataInfo ?? {};
    if (!blockDataInfo || !type || !id) {
      return getDisabledLibraryTooltip();
    }

    if (libraryStatus === 'disabled' || !libraryItem) {
      return await getPublicLibraryTooltip({
        blockDataInfo,
        spaceId,
        onAddLibrary,
        projectId,
        avatarBotId,
      });
    }

    if (libraryStatus === 'outdated') {
      return getOutdatedLibraryTooltip({
        editorRef,
        item: libraryItem,
        range,
        onRename,
      });
    }

    if (libraryStatus === 'existing') {
      return getExistingLibraryTooltip(libraryItem);
    }

    return getDisabledLibraryTooltip();
  } catch (error) {
    const errorMsg = (error as { msg: string }).msg;
    if (errorMsg) {
      return {
        tooltipConfig: {
          content: errorMsg,
        },
      };
    }
    return getDisabledLibraryTooltip();
  }
};

const getExistingLibraryTooltip = (
  libraryItem: ILibraryItem,
): {
  tooltipConfig?: React.ComponentProps<typeof Tooltip>;
} => ({
  tooltipConfig: {
    content: (
      <LibraryItem
        title={libraryItem.name ?? ''}
        description={libraryItem.desc ?? ''}
        avatar={libraryItem.icon_url ?? ''}
        className="!p-0"
      />
    ),
    className: 'library-block-tooltip !w-[310px] !p-2',
  },
});

const getDisabledLibraryTooltip = (
  msg?: string,
): {
  tooltipConfig?: React.ComponentProps<typeof Tooltip>;
} => ({
  tooltipConfig: {
    content: msg ?? I18n.t('edit_block_api_disable_tooltips'),
  },
});

const getHiddenLibraryTooltip = (): {
  tooltipConfig?: React.ComponentProps<typeof Tooltip>;
} => ({
  tooltipConfig: {
    visible: false,
    trigger: 'custom',
  },
});

const getOutdatedLibraryTooltip = ({
  item,
  range,
  onRename,
  editorRef,
}: {
  editorRef: RefObject<EditorAPI>;
  item: ILibraryItem;
  range: {
    left: number;
    right: number;
  };
  onRename?: (pos: { from: number; to: number }) => void;
}): {
  tooltipConfig?: React.ComponentProps<typeof Tooltip>;
} => ({
  tooltipConfig: {
    content: (
      <LibraryItem
        title={item.name ?? ''}
        description={item.desc ?? ''}
        avatar={item.icon_url ?? ''}
        className="!p-0"
        actions={
          <RenameLibraryAction
            library={item}
            range={range}
            editorRef={editorRef}
            onRename={onRename}
          />
        }
      />
    ),
    className: 'library-block-tooltip !w-[310px] !p-2',
  },
});

const getPublicLibraryTooltip = async ({
  blockDataInfo,
  spaceId,
  onAddLibrary,
  projectId,
  avatarBotId,
}: {
  blockDataInfo: LibraryBlockInfo | null;
  spaceId: string;
  onAddLibrary?: (library: ILibraryItem) => void;
  projectId?: string;
  avatarBotId?: string;
}): Promise<{
  tooltipConfig?: React.ComponentProps<typeof Tooltip>;
}> => {
  const { id, type } = blockDataInfo ?? {};
  if (!id || !type) {
    return getDisabledLibraryTooltip();
  }

  try {
    const libraryInfo = await requestLibraryInfo({
      id,
      type,
      ...(type === 'plugin' && {
        apiId: blockDataInfo?.apiId,
      }),
      spaceId,
      projectId,
      avatarBotId,
    });
    if (!libraryInfo) {
      return getDisabledLibraryTooltip();
    }
    return {
      tooltipConfig: {
        content: (
          <LibraryItem
            title={libraryInfo.name ?? ''}
            description={libraryInfo.desc ?? ''}
            avatar={libraryInfo.icon_url ?? ''}
            className="!p-0"
            actions={
              onAddLibrary ? (
                <AddLibraryAction
                  library={libraryInfo}
                  onClick={onAddLibrary}
                />
              ) : undefined
            }
          />
        ),
        className: 'library-block-tooltip !w-[310px] !p-2',
        showArrow: false,
      },
    };
  } catch (error) {
    return getDisabledLibraryTooltip((error as { msg: string }).msg);
  }
};
