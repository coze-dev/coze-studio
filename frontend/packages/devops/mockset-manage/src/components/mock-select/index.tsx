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

/* eslint-disable @coze-arch/max-line-per-function -- migrating code */
/* eslint-disable @typescript-eslint/no-explicit-any -- migrate code */
/* eslint-disable max-lines -- migrate code */
/* eslint-disable max-lines-per-function -- migrating code */

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
} from 'react';

import classNames from 'classnames';
import {
  useInViewport,
  useInfiniteScroll,
  useRequest,
  useUnmount,
} from 'ahooks';
import { userStoreService } from '@coze-studio/user-store';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import {
  PluginMockDataGenerateMode,
  sendTeaEvent,
  type ParamsTypeDefine,
  EVENT_NAMES,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
// eslint-disable-next-line @coze-arch/no-pkg-dir-import
import { type SemiSelectActions } from '@coze-arch/bot-semi/src/components/ui-select';
import {
  Spin,
  UIToast,
  Tooltip,
  UIButton,
  UISelect,
} from '@coze-arch/bot-semi';
import { IconAdd } from '@coze-arch/bot-icons';
import { SceneType, usePageJumpService } from '@coze-arch/bot-hooks';
import { SpaceType } from '@coze-arch/bot-api/developer_api';
import {
  TrafficScene,
  infra,
  type BizCtx,
  type MockSet,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';
import { IconTick, IconUploadError } from '@douyinfe/semi-icons';

import { MockSetEditModal } from '../mockset-edit-modal';
import { MockSetDeleteModal } from '../mockset-delete-modal';
import { type AutoGenerateConfig } from '../auto-generate-select';
import {
  getEnvironment,
  getMockSubjectInfo,
  getPluginInfo,
  getUsedScene,
  isCurrent,
  isRealData,
} from '../../utils';
import {
  type MockSelectOptionProps,
  type MockSelectRenderOptionProps,
  type MockSetSelectProps,
  MockSetStatus,
} from '../../interface';
import { useInitialGetEnabledMockSet } from '../../hooks/use-get-mockset';
import {
  CONNECTOR_ID,
  DELAY_TIME,
  MOCK_OPTION_LIST,
  POLLING_INTERVAL,
  REAL_DATA_ID,
  REAL_DATA_MOCKSET,
} from '../../const';
import { MockSetItem } from './option-item';

import styles from './index.module.less';

export function getMockSetOption(mockSet: MockSet): MockSelectOptionProps {
  const isInValid =
    !isRealData(mockSet) &&
    (mockSet?.schemaIncompatible || !mockSet?.mockRuleQuantity);
  return {
    value: mockSet?.id || '',
    label: (
      <Tooltip
        key={mockSet?.id}
        content={I18n.t('mockset_invaild_tip', { MockSetName: mockSet.name })}
        style={{ display: isInValid ? 'block' : 'none' }}
      >
        <span
          className={classNames(
            'flex items-center w-[100%] min-w-0',
            styles['select-label'],
          )}
        >
          {isInValid ? (
            <IconUploadError
              style={{
                verticalAlign: 'middle',
                marginRight: 2,
                color: '#FF8500',
              }}
            />
          ) : null}
          <span
            className={classNames(
              'flex-1 min-w-0 overflow-hidden text-ellipsis',
              isInValid ? 'text-[#1D1C2359]' : 'text-[#1D1C23CC]',
            )}
          >
            {mockSet?.name || ''}
          </span>
        </span>
      </Tooltip>
    ),
    disabled: isInValid,
    detail: mockSet,
  };
}

export function getMockSetOptionList(
  mockSets: MockSet[],
): Array<MockSelectOptionProps> {
  return mockSets.map(mockSet => getMockSetOption(mockSet));
}
export interface MockSetSelectActions {
  handleParentNodeDelete: () => void;
}

const MockSetSelectComp = (
  {
    bindSubjectInfo: mockSubjectInfo,
    bizCtx: bizSceneCtx,
    className,
    style: baseStyle,
    readonly,
  }: MockSetSelectProps,
  ref: ForwardedRef<MockSetSelectActions>,
) => {
  const { detail: subjectDetail, ...bindSubjectInfo } = mockSubjectInfo;

  const { spaceID, toolID, pluginID } = getPluginInfo(
    bizSceneCtx,
    bindSubjectInfo,
  );
  const uid = userStoreService.useUserInfo()?.user_id_str;
  const spaceType = useSpaceStore(s => s.space.space_type);
  const isPersonal = spaceType === SpaceType.Personal;

  const bizCtx: BizCtx = {
    ...bizSceneCtx,
    connectorUID: uid,
    connectorID: CONNECTOR_ID, // Business line for Coze
  };

  const { jump } = usePageJumpService();

  const [selectedMockSet, setSelectedMockSet] =
    useState<MockSet>(REAL_DATA_MOCKSET);
  const selectedValue = getMockSetOption(selectedMockSet);

  const [optionList, setOptionList] = useState<Array<MockSelectOptionProps>>(
    getMockSetOptionList(MOCK_OPTION_LIST),
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteMockSet, setDeleteMockSet] = useState<MockSet | undefined>();

  const preSelectionRef = useRef<MockSet>(REAL_DATA_MOCKSET);
  const selectionDomRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<SemiSelectActions>(null);

  const [inViewPort] = useInViewport(selectionDomRef);
  const {
    data: enabledMockSetInfo,
    addMockComp,
    removeMockComp,
    start,
    cancel,
    setRestartTimer,
  } = useInitialGetEnabledMockSet({
    bizCtx,
    pollingInterval: POLLING_INTERVAL,
  });

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
        logger.error({ error: e as Error, eventName: 'change_mockset_fail' });
        isBinding &&
          sendTeaEvent(EVENT_NAMES.use_mockset_front, {
            ...basicParams,
            status: 1,
            error: (e as Error | undefined)?.message as string,
          });
      }
    },
    {
      manual: true,
    },
  );

  const handleChange = async (obj?: MockSelectOptionProps) => {
    cancel();
    preSelectionRef.current = selectedMockSet;
    setSelectedMockSet((obj as MockSelectOptionProps)?.detail || {});
    await changeMockSet((obj as MockSelectOptionProps)?.detail || {});
    const restartTimerId = setTimeout(() => {
      start();
    }, DELAY_TIME);
    setRestartTimer(restartTimerId);
  };

  const {
    reload: fetchOptionList,
    loadMore,
    loading,
    loadingMore,
    data: optionListData,
  } = useInfiniteScroll(
    async d => {
      try {
        const res = await debuggerApi.MGetMockSet({
          bizCtx,
          mockSubject: getMockSubjectInfo(bizCtx, mockSubjectInfo),
          pageToken: d?.pageToken,
          orderBy: infra.OrderBy.UpdateTime,
          desc: true,
        });
        const mockSetList = getMockSetOptionList(res?.mockSets || []);

        return {
          list: mockSetList || [],
          pageToken: res?.pageToken,
          hasMore: res?.hasMore ?? true,
          schema: res?.schema,
          count: res?.count,
        };
      } catch (e) {
        logger.error({
          error: e as Error,
          eventName: 'mockset_list_fetch_fail',
        });
        return {
          list: [],
          pageToken: d?.pageToken,
          hasMore: d?.hasMore,
        };
      }
    },
    {
      manual: true,
    },
  );

  useImperativeHandle(ref, () => ({
    handleParentNodeDelete: () => {
      changeMockSet(selectedMockSet, false);
    },
  }));

  useEffect(() => {
    const newOptionList = [
      getMockSetOption(REAL_DATA_MOCKSET),
      ...(optionListData?.list || []),
    ];
    setOptionList(newOptionList);
  }, [optionListData]);

  useEffect(() => {
    const mockSetInfo = enabledMockSetInfo.find(mockInfo =>
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
    } else {
      setSelectedMockSet(REAL_DATA_MOCKSET);
    }
  }, [enabledMockSetInfo]);

  useUnmount(() => {
    const length = removeMockComp({ bizCtx, bindSubjectInfo });
    if (!length) {
      cancel();
    }
  });

  useEffect(() => {
    if (inViewPort) {
      const length = addMockComp({ bizCtx, bindSubjectInfo });
      if (length === 1) {
        start();
      }
    } else {
      const length = removeMockComp({ bizCtx, bindSubjectInfo });
      if (!length) {
        cancel();
      }
    }
  }, [inViewPort]);

  const closePanel = () => {
    selectionRef?.current?.close();
  };

  const handleView = (
    record?: MockSet,
    autoGenerateConfig?: AutoGenerateConfig,
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
  };

  const renderCreateMockSet = () => (
    <>
      <div className={styles.divider}></div>
      <div
        onClick={() => {
          setShowCreateModal(true);
          closePanel();
        }}
        className={styles['create-container']}
      >
        <IconAdd
          className="mr-[10px]"
          style={{ fontSize: 14, color: '#4D53E8' }}
        />
        <span>{I18n.t('create_mockset')}</span>
      </div>
    </>
  );

  const renderLoadMore = () =>
    loading ||
    (optionListData?.list?.length || 0) >=
      (optionListData?.count || 0) ? null : (
      <div
        className={classNames(
          styles['select-option-container'],
          styles['load-more'],
        )}
      >
        {loadingMore ? (
          <>
            <Spin wrapperClassName={styles['spin-icon']} />
            <span>{I18n.t('Loading')}</span>
          </>
        ) : (
          <UIButton
            onClick={loadMore}
            theme="borderless"
            style={{ fontSize: 12 }}
          >
            {I18n.t('Load More' as any)}
          </UIButton>
        )}
      </div>
    );

  const renderOptionItem = (renderProps: MockSelectRenderOptionProps) => {
    const {
      disabled,
      selected,
      value,
      focused,
      style,
      onMouseEnter,
      onClick,
      detail,
    } = renderProps;

    const getTooltipInfo = () => {
      if (detail?.schemaIncompatible) {
        return I18n.t('tool_updated_check_mockset_compatibility');
      } else if ((detail?.mockRuleQuantity || 0) <= 0) {
        return I18n.t('mockset_is_empty_add_data_before_use');
      }
      return '';
    };

    return (
      <Tooltip
        zIndex={110}
        content={getTooltipInfo()}
        visible={disabled && focused}
        position="left"
        style={{ display: disabled ? 'block' : 'none' }} // Visible disabled not effective
      >
        <div
          style={style}
          className={classNames(
            styles['select-option-container'],
            focused && styles['custom-option-render-focused'],
            disabled && styles['custom-option-render-disabled'],
            selected && styles['custom-option-render-selected'],
          )}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
        >
          <div className="w-[16px] h-[16px] mr-[8px]">
            {selected ? (
              <IconTick style={{ fontSize: 14 }} className="text-[#4D53E8]" />
            ) : (
              <div className="w-[16px]"></div>
            )}
          </div>
          {value === REAL_DATA_ID ? (
            <span>{I18n.t('real_data')}</span>
          ) : (
            <MockSetItem
              status={
                detail?.schemaIncompatible
                  ? MockSetStatus.Incompatible
                  : MockSetStatus.Normal
              }
              name={detail?.name || ''}
              onDelete={() => {
                closePanel();
                setDeleteMockSet(detail);
              }}
              onView={() => {
                handleView(detail);
              }}
              disableCreator={isPersonal}
              viewOnly={uid !== detail?.creator?.ID}
              creatorName={detail?.creator?.name}
              className="flex-1 min-w-0"
            ></MockSetItem>
          )}
        </div>
      </Tooltip>
    );
  };

  return (
    <div ref={selectionDomRef} style={baseStyle} className={className}>
      <UISelect
        stopPropagation
        disabled={readonly || changeMockSetLoading}
        className={classNames(
          styles['select-container'],
          changeMockSetLoading && styles['switch-disabled'],
        )}
        ref={selectionRef}
        selectedClassname={styles['item-selected']}
        optionList={optionList}
        dropdownClassName={styles['option-list']}
        outerBottomSlot={renderCreateMockSet()}
        innerBottomSlot={renderLoadMore()}
        onDropdownVisibleChange={(visible: boolean) => {
          if (visible) {
            fetchOptionList();
          } else {
            setOptionList([getMockSetOption(REAL_DATA_MOCKSET)]);
          }
        }}
        loading={loading}
        renderOptionItem={renderOptionItem}
        value={selectedValue}
        onChangeWithObject
        onChange={async obj => {
          await handleChange(obj as unknown as MockSelectOptionProps);
        }}
      />
      {showCreateModal ? (
        <MockSetEditModal
          zIndex={9999}
          visible={showCreateModal}
          onCancel={() => setShowCreateModal(false)}
          onSuccess={(info, autoGenerateConfig) => {
            const { id } = info || {};
            setShowCreateModal(false);

            const msgMap = {
              [PluginMockDataGenerateMode.LLM]: I18n.t(
                'created_mockset_please_add_mock_data_llm_generation',
              ),
              [PluginMockDataGenerateMode.RANDOM]: I18n.t(
                'created_mockset_please_add_mock_data_random_generation',
              ),
              [PluginMockDataGenerateMode.MANUAL]: I18n.t(
                'created_mockset_please_add_mock_data',
              ),
            };
            UIToast.success(
              msgMap[
                autoGenerateConfig?.generateMode ||
                  PluginMockDataGenerateMode.MANUAL
              ],
            );

            handleView({ id }, autoGenerateConfig);
          }}
          initialInfo={{
            bizCtx,
            bindSubjectInfo,
            name: subjectDetail?.name,
          }}
          needResetPopoverContainer={
            bizCtx.trafficScene === TrafficScene.CozeWorkflowDebug
          }
        />
      ) : null}
      {deleteMockSet ? (
        <MockSetDeleteModal
          zIndex={9999}
          visible={!!deleteMockSet}
          mockSetInfo={{
            detail: deleteMockSet,
            ctx: { bizCtx, mockSubjectInfo: bindSubjectInfo },
          }}
          onSuccess={() => {
            deleteMockSet.id === selectedMockSet.id &&
              setSelectedMockSet(REAL_DATA_MOCKSET);
            setDeleteMockSet(undefined);
            cancel();
            start();
          }}
          onCancel={() => setDeleteMockSet(undefined)}
          needResetPopoverContainer={
            bizCtx.trafficScene === TrafficScene.CozeWorkflowDebug
          }
        />
      ) : null}
    </div>
  );
};

export const MockSetSelect = forwardRef(MockSetSelectComp);
