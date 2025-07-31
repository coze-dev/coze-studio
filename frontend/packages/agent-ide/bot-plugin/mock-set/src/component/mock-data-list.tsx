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
import { useParams } from 'react-router-dom';
import {
  useState,
  useEffect,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
} from 'react';

import classNames from 'classnames';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import {
  EVENT_NAMES,
  sendTeaEvent,
  type ParamsTypeDefine,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { Empty, Spin, UIModal } from '@coze-arch/bot-semi';
import { PageType, usePageJumpResponse } from '@coze-arch/bot-hooks';
import { SpaceType } from '@coze-arch/bot-api/developer_api';
import { infra, type MockRule } from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';
import {
  IllustrationNoContent,
  IllustrationNoContentDark,
} from '@douyinfe/semi-illustrations';
import { IconAlertCircle } from '@douyinfe/semi-icons';
import { getEnvironment } from '@coze-studio/mockset-shared';

import { type MockDataInfo } from '../util/typings';
import { SpaceHolder } from './space-holder';
import { CreationMode, MockDataCreateCard } from './mock-data-create-card';
import { MockDataCard } from './mock-data-card';

import s from './index.module.less';

enum RuleActions {
  CREATE,
  EDIT,
  DELETE,
}

interface MockDataListProps {
  mockSetID?: string;
  perm: {
    readOnly: boolean;
    uninitialized: boolean;
  };
  toolSchema: string;
  bizCtx: infra.BizCtx;
  onListUpdate?: (length: number, needScrollToTop?: boolean) => void;
}

export interface MockDataListActions {
  update: () => void;
  create: () => void;
}

export const MockDataList = forwardRef(
  (
    { mockSetID, perm, toolSchema, bizCtx, onListUpdate }: MockDataListProps,
    ref: ForwardedRef<MockDataListActions>,
  ) => {
    // loading
    const [loading, setLoading] = useState(false);
    // mock data list
    const [mockDataList, setMockDataList] = useState<MockRule[]>([]);
    // modal visible
    const [createModalVisible, setCreateModalVisible] =
      useState<boolean>(false);
    // delete modal visible
    const [deleteModalVisible, setDeleteModalVisible] =
      useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    // Currently selected
    const [currentSelect, setCurrentSelect] = useState<
      MockDataInfo | undefined
    >();

    const routeResponse = usePageJumpResponse(PageType.PLUGIN_MOCK_DATA);

    const { mock_set_id, space_id, tool_id } = useParams<DynamicParams>();
    // Space information
    const spaceType = useSpaceStore(store => store.space.space_type);
    const isPersonal = spaceType === SpaceType.Personal;

    const clickItemUpdateEntryHandler = (params: MockDataInfo) => {
      setCurrentSelect(params);
      setCreateModalVisible(true);
    };

    const clickItemDeleteEntryHandler = (params: MockDataInfo) => {
      setCurrentSelect(params);
      setDeleteModalVisible(true);
    };

    // Get the mock data under the current mock set
    const getMockData = async (needScrollToTop?: boolean) => {
      try {
        setLoading(true);
        const data = await debuggerApi.MGetMockRule({
          bizCtx,
          mockSetID: mock_set_id,
          orderBy: infra.OrderBy.UpdateTime,
          desc: true,
        });
        setMockDataList(data.mockRules || []);

        onListUpdate?.(data.mockRules?.length || 0, needScrollToTop);
      } catch (error) {
        // @ts-expect-error -- linter-disable-autofix
        logger.error({ error, eventName: 'get_mock_data_fail' });
      } finally {
        setLoading(false);
      }
    };

    const deleteConfirmHandler = async () => {
      const { mock } = currentSelect || {};
      if (!mock) {
        return;
      }

      const basicParams: Omit<
        ParamsTypeDefine[EVENT_NAMES.del_mock_front],
        'status'
      > = {
        environment: getEnvironment(),
        workspace_id: space_id || '',
        workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
        tool_id: tool_id || '',
        mock_set_id: mock_set_id || '',
        mock_counts: 1,
      };

      try {
        setDeleting(true);
        await debuggerApi.DeleteMockRule({
          bizCtx,
          id: String(mock.id),
        });

        updateList(mock, RuleActions.DELETE);
        setCurrentSelect(undefined);
        setDeleteModalVisible(false);

        sendTeaEvent(EVENT_NAMES.del_mock_front, {
          ...basicParams,
          status: 0,
        });
      } catch (error) {
        // @ts-expect-error -- linter-disable-autofix
        logger.error({ error, eventName: 'delete_mock_fail' });
        sendTeaEvent(EVENT_NAMES.del_mock_front, {
          ...basicParams,
          status: 1,
          // @ts-expect-error -- linter-disable-autofix
          error,
        });
      } finally {
        setDeleting(false);
      }
    };

    // frontend update
    const updateList = (data: MockRule, action: RuleActions) => {
      let len = 0;
      if (action === RuleActions.CREATE) {
        // Create scenes to force updates directly
        getMockData(true);
      } else if (action === RuleActions.DELETE) {
        len = mockDataList.length - 1;
        setMockDataList(cur => {
          const index = cur.findIndex(item => item.id === data?.id);
          if (index !== -1) {
            cur.splice(index, 1);
          }
          len = cur.length;
          return [...cur];
        });

        onListUpdate?.(len);
      } else {
        len = mockDataList.length;
        setMockDataList(cur => {
          const index = cur.findIndex(item => item.id === data?.id);
          if (index !== -1) {
            cur.splice(index, 1);
            cur.unshift(data);
          }
          len = cur.length;
          return [...cur];
        });
        onListUpdate?.(len, true);
      }
    };

    useImperativeHandle(ref, () => ({
      update: getMockData,
      create: () => {
        setCurrentSelect(undefined);
        setCreateModalVisible(true);
      },
    }));

    useEffect(() => {
      getMockData();
    }, [mockSetID]);

    useEffect(() => {
      if (routeResponse?.generationMode) {
        // Clear jump parameters
        const state = {
          ...history.state,
          usr: { ...(history.state.usr || {}), generationMode: undefined },
        };
        history.replaceState(state, '');
      }
    }, []);

    const renderList = () => {
      if (loading || perm.uninitialized) {
        return (
          <div className={s['list-container-no-header_flexible']}>
            <Spin
              size="large"
              spinning
              style={{ height: '80%', width: '100%' }}
            />
          </div>
        );
      }

      if (perm.readOnly && mockDataList.length === 0) {
        return (
          <>
            <h1 className={classNames(s['content-title'])}>
              {I18n.t('mockset_data')}
            </h1>
            <div className={s['list-container_flexible']}>
              <Empty
                className={s.empty}
                image={<IllustrationNoContent />}
                darkModeImage={<IllustrationNoContentDark />}
                description={I18n.t('no_mock_yet')}
              />
            </div>
          </>
        );
      }

      if (!perm.readOnly && mockDataList.length === 0) {
        return (
          <div className={s['list-container-no-header_flexible']}>
            <MockDataCreateCard
              mode={CreationMode.CARD}
              mockInfo={{
                schema: toolSchema,
              }}
              onSuccess={data => {
                data && updateList(data[0], RuleActions.CREATE);
              }}
              bizCtx={bizCtx}
              forceGenerate={
                routeResponse?.generationMode
                  ? {
                      mode: routeResponse.generationMode,
                      count: 1,
                    }
                  : undefined
              }
            />
          </div>
        );
      }

      return (
        <>
          <h1 className={classNames(s['content-title'])}>
            {I18n.t('mockset_data')}
          </h1>
          <div className={s['list-container_scroll']}>
            {mockDataList.map(item => (
              <MockDataCard
                readOnly={perm.readOnly}
                key={item.id}
                mock={item}
                schema={toolSchema}
                onEdit={params => clickItemUpdateEntryHandler(params)}
                onRemove={params => clickItemDeleteEntryHandler(params)}
                bizCtx={bizCtx}
              />
            ))}
          </div>
        </>
      );
    };

    return (
      <>
        <SpaceHolder height={24} />
        {renderList()}
        <MockDataCreateCard
          mode={CreationMode.MODAL}
          mockInfo={
            currentSelect || {
              schema: toolSchema,
            }
          }
          visible={createModalVisible}
          onCancel={() => {
            setCurrentSelect(undefined);
            setCreateModalVisible(false);
          }}
          onSuccess={data => {
            setCurrentSelect(undefined);
            setCreateModalVisible(false);
            data?.[0] &&
              updateList(
                data[0],
                currentSelect ? RuleActions.EDIT : RuleActions.CREATE,
              );
          }}
          bizCtx={bizCtx}
        />
        <UIModal
          type="info"
          icon={
            <IconAlertCircle
              size="extra-large"
              className="inline-flex text-[#FF2710]"
            />
          }
          title={I18n.t('delete_mock_data')}
          visible={deleteModalVisible}
          onCancel={() => {
            setCurrentSelect(undefined);
            setDeleteModalVisible(false);
          }}
          okText={I18n.t('confirm')}
          cancelText={I18n.t('cancel')}
          confirmLoading={deleting}
          onOk={() => deleteConfirmHandler()}
          okType="danger"
        >
          {I18n.t('operation_cannot_be_reversed')}
        </UIModal>
      </>
    );
  },
);
