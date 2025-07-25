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
 
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { useErrorHandler, reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { CustomError } from '@coze-arch/bot-error';
import { localStorageService } from '@coze-foundation/local-storage';
import { useSpaceStore } from '@coze-foundation/space-store';

const getFallbackWorkspaceURL = async (
  fallbackSpaceID: string,
  fallbackSpaceMenu: string,
  checkSpaceID: (id: string) => boolean,
) => {
  const targetSpaceId =
    (await localStorageService.getValueSync('workspace-spaceId')) ??
    fallbackSpaceID;
  const targetSpaceSubMenu =
    (await localStorageService.getValueSync('workspace-subMenu')) ??
    fallbackSpaceMenu;

  if (targetSpaceId && checkSpaceID(targetSpaceId)) {
    return `/space/${targetSpaceId}/${targetSpaceSubMenu}`;
  }

  return `/space/${fallbackSpaceID}/${targetSpaceSubMenu}`;
};

export const useInitSpace = ({
  spaceId,
  fetchSpacesWithSpaceId,
  isReady,
}: {
  spaceId?: string;
  fetchSpacesWithSpaceId?: (spaceId: string) => Promise<unknown>;
  isReady?: boolean;
} = {}) => {
  const [isError, setIsError] = useState<boolean>(false);
  const navigate = useNavigate();
  const capture = useErrorHandler();

  const { space, spaceListLoading, spaceList } = useSpaceStore(
    useShallow(
      store =>
        ({
          space: store.space,
          spaceListLoading: store.loading,
          spaceList: store.spaceList,
        }) as const,
    ),
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (async (spaceId?: string) => {
      try {
        if (!isReady) {
          return;
        }

        // 如果未指定spaceId，则跳转到兜底的space下的项目开发子路由
        if (!spaceId) {
          // 拉取空间列表
          await useSpaceStore.getState().fetchSpaces(true);
          // 获取个人空间Id
          const personalSpaceID = useSpaceStore.getState().getPersonalSpaceID();
          // 空间列表的第一个空间
          const firstSpaceID = useSpaceStore.getState().spaceList[0]?.id;
          // 未指定spaceId的兜底空间
          const fallbackSpaceID = personalSpaceID ?? firstSpaceID ?? '';
          // 检查指定的spaceId是否可以访问
          const { checkSpaceID } = useSpaceStore.getState();

          // 无工作空间，提示创建
          if (!fallbackSpaceID) {
            Toast.warning(I18n.t('enterprise_workspace_default_tips2_toast'));
          } else {
            // 获取兜底的跳转URL
            const targetURL = await getFallbackWorkspaceURL(
              fallbackSpaceID,
              'develop',
              checkSpaceID,
            );
            // 跳转
            navigate(targetURL);
          }
        } else {
          // 拉取空间列表
          await fetchSpacesWithSpaceId?.(spaceId);

          if (!useSpaceStore.getState().checkSpaceID(spaceId)) {
            // 当 space id 在space 列表找不到时，抛出错误
            capture(
              new CustomError(ReportEventNames.errorPath, 'space id error', {
                customGlobalErrorConfig: {
                  title: I18n.t('workspace_no_permission_access'),
                  subtitle:
                    'You do not have permission to access this space or the space ID does not exist',
                },
              }),
            );
          } else {
            // 更新space store的spaceId
            useSpaceStore.getState().setSpace(spaceId);
          }
        }
      } catch (e) {
        reporter.error({
          message: 'init_space_error',
          error: e as Error,
        });
        setIsError(true);
        capture(
          new CustomError(ReportEventNames.errorPath, 'space id error', {
            customGlobalErrorConfig: {
              title: I18n.t('workspace_no_permission_access'),
              subtitle: (e as Error).message,
            },
          }),
        );
      }
    })(spaceId);
  }, [spaceId, isReady]);

  return { loading: !space.id, isError, spaceListLoading, spaceList };
};
