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

/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable max-lines-per-function */
import { useEffect, useMemo, useRef, useState } from 'react';

import { useMemoizedFn, useRequest } from 'ahooks';
import { userStoreService } from '@coze-studio/user-store';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import {
  EVENT_NAMES,
  type PluginMockDataGenerateMode,
  sendTeaEvent,
  type ParamsTypeDefine,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { SceneType, usePageJumpService } from '@coze-arch/bot-hooks';
import { SpaceType } from '@coze-arch/bot-api/playground_api';
import {
  type MockSet,
  type BizCtx,
  infra,
  TrafficScene,
  type MockSetBinding,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';
import {
  getEnvironment,
  getMockSubjectInfo,
  getPluginInfo,
  type MockSetSelectProps,
} from '@coze-studio/mockset-shared';

import { getUsedScene, isCurrent } from '../util/index';
import { MockTrafficEnabled } from '../util/get-mock-set-options';
import { type EnabledMockSetInfo } from '../component/hooks/store';
import { CONNECTOR_ID, REAL_DATA_MOCKSET } from '../component/const';

function combineBindMockSetInfo(
  mockSetBindingList: Array<MockSetBinding>,
  mockSetDetailSet: Record<string, MockSet>,
): Array<EnabledMockSetInfo> {
  return mockSetBindingList.map(mockSetInfo => {
    const { mockSetID } = mockSetInfo;
    const detail = mockSetID ? mockSetDetailSet[mockSetID] : {};
    return {
      mockSetBinding: mockSetInfo,
      mockSetDetail: detail,
    };
  });
}

const useMockSetInSettingModalController = ({
  bindSubjectInfo: mockSubjectInfo,
  bizCtx: bizSceneCtx,
  readonly = false,
}: MockSetSelectProps) => {
  const [isEnabled, setIsEnabled] = useState(!!0);
  const [isInit, setIsInit] = useState(!0);

  const { detail: subjectDetail, ...bindSubjectInfo } = mockSubjectInfo;

  const { spaceID, toolID, pluginID } = getPluginInfo(
    bizSceneCtx,
    bindSubjectInfo,
  );
  const uid = userStoreService.useUserInfo()?.user_id_str;
  const spaceType = useSpaceStore(s => s.space.space_type);
  const isPersonal = spaceType === SpaceType.Personal;

  const { jump } = usePageJumpService();

  const bizCtx: BizCtx = useMemo(
    () => ({
      ...bizSceneCtx,
      connectorUID: uid,
      connectorID: CONNECTOR_ID, // Business line for Coze
    }),
    [bizSceneCtx, uid, CONNECTOR_ID],
  );

  const [selectedMockSet, setSelectedMockSet] =
    useState<MockSet>(REAL_DATA_MOCKSET);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const preSelectionRef = useRef<MockSet>(REAL_DATA_MOCKSET);

  const { runAsync: changeMockSet, loading: changeMockSetLoading } = useRequest(
    async (mockSet: MockSet, isBinding = true) => {
      const basicParams: ParamsTypeDefine[EVENT_NAMES.use_mockset_front] = {
        environment: getEnvironment(),
        workspace_id: spaceID || '',
        workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
        tool_id: toolID || '',
        status: 1,
        mock_set_id: (mockSet.id as string) || '',
        where: getUsedScene(bizCtx.trafficScene),
      };
      try {
        await debuggerApi.BindMockSet({
          mockSetID: isBinding ? mockSet.id : '0',
          bizCtx,
          mockSubject: bindSubjectInfo,
        });
        isBinding &&
          sendTeaEvent(EVENT_NAMES.use_mockset_front, {
            ...basicParams,
            status: 0,
          });
      } catch (e) {
        setSelectedMockSet(preSelectionRef.current);
        // @ts-expect-error -- linter-disable-autofix
        logger.error({ error: e, eventName: 'change_mockset_fail' });
        isBinding &&
          sendTeaEvent(EVENT_NAMES.use_mockset_front, {
            ...basicParams,
            status: 1,
            // @ts-expect-error -- linter-disable-autofix
            error: e?.msg as string,
          });
      }
    },
    {
      manual: true,
    },
  );

  const doChangeMock = (obj?: MockSet) => {
    if (obj) {
      preSelectionRef.current = selectedMockSet;
      setSelectedMockSet(obj);
      changeMockSet(obj);
    }
  };

  const doEnabled = useMemoizedFn(() => {
    if (isEnabled) {
      doChangeMock(REAL_DATA_MOCKSET);
    }

    setIsEnabled(!isEnabled);
  });

  const initialInfo = useMemo(
    () => ({
      bizCtx,
      bindSubjectInfo,
      name: subjectDetail?.name,
    }),
    [bizCtx, bindSubjectInfo, subjectDetail],
  );

  const [deleteTargetId, setDeleteTargetId] = useState(undefined);

  const { data: deleteUsingCountInfo } = useRequest(
    async () => {
      try {
        const { usersUsageCount } = await debuggerApi.GetMockSetUsageInfo({
          mockSetID: deleteTargetId,
          spaceID,
        });
        return Number(usersUsageCount ?? 0);
      } catch (e) {
        // @ts-expect-error -- linter-disable-autofix
        logger.error({ error: e, eventName: 'fetch_mockset_ref_fail' });
        return 0;
      }
    },
    {
      refreshDeps: [deleteTargetId],
      ready: deleteTargetId !== undefined,
    },
  );

  const deleteRenderTitle =
    (deleteUsingCountInfo ?? 0) > 0
      ? I18n.t('people_using_mockset_delete', { num: deleteUsingCountInfo })
      : I18n.t('delete_the_mockset');

  const {
    data: mockSetData,
    loading: isListLoading,
    refresh,
  } = useRequest(
    async d => {
      try {
        const res = await debuggerApi.MGetMockSet({
          bizCtx,
          // @ts-expect-error -- linter-disable-autofix
          mockSubject: getMockSubjectInfo(bizCtx, mockSubjectInfo),
          pageToken: d?.pageToken,
          orderBy: infra.OrderBy.UpdateTime,
          desc: true,
        });

        setIsInit(!!0);

        return res?.mockSets ?? [];
      } catch (e) {
        // @ts-expect-error -- linter-disable-autofix
        logger.error({ error: e, eventName: 'mockset_list_fetch_fail' });

        return [];
      }
    },
    { ready: !readonly },
  );

  const { data: enabledMockSetInfo, loading: isSettingLoading } = useRequest(
    async () => {
      try {
        const { mockSetBindings = [], mockSetDetails = {} } =
          await debuggerApi.MGetMockSetBinding(
            {
              bizCtx,
              needMockSetDetail: true,
            },
            {
              headers: {
                'rpc-persist-mock-traffic-enable': MockTrafficEnabled.ENABLE,
              },
            },
          );

        return combineBindMockSetInfo(mockSetBindings, mockSetDetails);
      } catch (e) {
        // @ts-expect-error -- linter-disable-autofix
        logger.error({ error: e, eventName: 'poll_scene_mockset_fail' });
      }
    },
    { ready: !readonly, refreshDeps: [bizCtx] },
  );

  const doConfirmDelete = useMemoizedFn(async () => {
    const basicParams: ParamsTypeDefine[EVENT_NAMES.del_mockset_front] = {
      environment: getEnvironment(),
      workspace_id: spaceID || '',
      workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
      tool_id: toolID || '',
      mock_set_id: String(deleteTargetId) || '',
      status: 1,
    };
    try {
      deleteTargetId &&
        (await debuggerApi.DeleteMockSet({
          id: deleteTargetId,
          bizCtx,
        }));

      refresh();

      setDeleteTargetId(undefined);

      sendTeaEvent(EVENT_NAMES.del_mockset_front, {
        ...basicParams,
        status: 0,
      });
    } catch (e) {
      sendTeaEvent(EVENT_NAMES.del_mockset_front, {
        ...basicParams,
        status: 1,
        // @ts-expect-error -- linter-disable-autofix
        error: e?.message as string,
      });
    }
  });

  useEffect(() => {
    if (!enabledMockSetInfo?.length) {
      return;
    }

    const mockSetInfo = enabledMockSetInfo?.find(mockInfo =>
      isCurrent(
        {
          bizCtx: mockInfo?.mockSetBinding?.bizCtx || {},
          bindSubjectInfo: mockInfo?.mockSetBinding?.mockSubject || {},
        },
        {
          bizCtx,
          bindSubjectInfo,
        },
      ),
    );

    if (changeMockSetLoading) {
      return;
    }

    if (mockSetInfo?.mockSetDetail) {
      setSelectedMockSet(mockSetInfo?.mockSetDetail);
      setIsEnabled(!0);
    } else {
      setSelectedMockSet(REAL_DATA_MOCKSET);
    }
  }, [enabledMockSetInfo]);

  const doHandleView = useMemoizedFn(
    (
      record?: MockSet,
      autoGenerateConfig?: { generateMode: PluginMockDataGenerateMode },
    ) => {
      const { trafficScene } = bizCtx || {};
      const { id } = record || {};
      if (spaceID && pluginID && toolID && id) {
        jump(
          trafficScene === TrafficScene.CozeWorkflowDebug
            ? SceneType.WORKFLOW__TO__PLUGIN_MOCK_DATA
            : SceneType.BOT__TO__PLUGIN_MOCK_DATA,
          {
            spaceId: spaceID,
            pluginId: pluginID,
            toolId: toolID,
            toolName: subjectDetail?.name,
            mockSetId: String(id),
            mockSetName: record?.name,
            bizCtx: JSON.stringify(bizCtx),
            bindSubjectInfo: JSON.stringify(bindSubjectInfo),
            generationMode: autoGenerateConfig?.generateMode,
          },
        );
      }
    },
  );

  return {
    // actions
    doSetCreateModal: setShowCreateModal,
    doHandleView,
    doEnabled,
    doSetDeleteId: setDeleteTargetId,
    deleteRenderTitle,
    doConfirmDelete,
    doChangeMock,
    // data-source
    selectedMockSet,
    mockSetData,
    initialInfo,
    // status
    isListLoading: isListLoading && isInit,
    isSettingLoading,
    isEnabled,
    showCreateModal,
  };
};

export { useMockSetInSettingModalController };
