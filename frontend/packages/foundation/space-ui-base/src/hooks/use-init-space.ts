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
        } as const),
    ),
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (async (spaceId?: string) => {
      try {
        if (!isReady) {
          return;
        }

        // If spaceId is not specified, jump to the project development subroute under the space of the backseat
        if (!spaceId) {
          // Pull space list
          await useSpaceStore.getState().fetchSpaces(true);
          // Get Personal Space Id
          const personalSpaceID = useSpaceStore.getState().getPersonalSpaceID();
          // The first space in the space list
          const firstSpaceID = useSpaceStore.getState().spaceList[0]?.id;
          // SpaceId not specified
          const fallbackSpaceID = personalSpaceID ?? firstSpaceID ?? '';
          // Checks if the specified spaceId is accessible
          const { checkSpaceID } = useSpaceStore.getState();

          // No workspace, prompt to create
          if (!fallbackSpaceID) {
            Toast.warning(I18n.t('enterprise_workspace_default_tips2_toast'));
          } else {
            // Get the jump URL of the back cover.
            const targetURL = await getFallbackWorkspaceURL(
              fallbackSpaceID,
              'develop',
              checkSpaceID,
            );
            // jump
            navigate(targetURL);
          }
        } else {
          // Pull space list
          await fetchSpacesWithSpaceId?.(spaceId);

          if (!useSpaceStore.getState().checkSpaceID(spaceId)) {
            // Throws an error when the space id cannot be found in the space list
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
            // Update space store spaceId
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
