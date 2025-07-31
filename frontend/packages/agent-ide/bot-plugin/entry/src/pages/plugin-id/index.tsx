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

/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useRequest, useUpdateEffect } from 'ahooks';
import { useGetToolColumnsAdapter } from '@coze-studio/plugin-tool-columns-adapter';
import { InitialAction } from '@coze-studio/plugin-shared';
import { BizPluginPublishPopover } from '@coze-studio/plugin-publish-ui-adapter';
import { UIBreadcrumb } from '@coze-studio/components';
import {
  usePluginCallbacks,
  usePluginHistoryController,
  usePluginNavigate,
  usePluginStore,
  useUnmountUnlock,
} from '@coze-studio/bot-plugin-store';
import { useReportTti } from '@coze-arch/report-tti';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { useErrorHandler } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import {
  IconButton,
  Button,
  Table,
  type TableMethods,
  Layout,
  Typography,
  Tooltip,
  Banner,
  Popconfirm,
} from '@coze-arch/coze-design';
import { renderHtmlTitle } from '@coze-arch/bot-utils';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { UIEmpty } from '@coze-arch/bot-semi';
import { IconCodeOutlined } from '@coze-arch/bot-icons';
import { CustomError } from '@coze-arch/bot-error';
import {
  type PluginAPIInfo,
  type GetUpdatedAPIsResponse,
  type GetPluginAPIsRequest,
  CreationMethod,
  PluginType,
  type GetPluginInfoResponse,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { useEditExample } from '@coze-agent-ide/bot-plugin-tools';

import PluginHeader from '@/components/plugin-header';

import {
  useBotCodeEditInPlugin,
  useBotFormEditInPlugin,
  useImportToolInPlugin,
} from '../../hooks';
import { CodeSnippetModal } from '../../components';
import { CreateTool, useCreateTool } from './create-tool';

import s from './index.module.less';

const creationMethodText = {
  [CreationMethod.COZE]: I18n.t('create_tool'),
  [CreationMethod.IDE]: I18n.t('plugin_creation_create_tool_in_ide'),
};

type PreloadIDEHook = (params: { onBack?: () => void; pluginID: string }) => {
  handleInitIde: (readonly: boolean) => void;
  handleShowIde: (params: {
    initialAction: InitialAction;
    toolId?: string;
  }) => void;
};

interface PluginDetailPageProps {
  projectId?: string;
  keepDocTitle?: boolean;
  renderHeaderSlot?: (props: {
    pluginInfo: GetPluginInfoResponse;
  }) => ReactNode;
  usePreloadIDE?: PreloadIDEHook;
}

const PluginDetailPage = ({
  projectId,
  keepDocTitle,
  renderHeaderSlot,
  usePreloadIDE,
}: PluginDetailPageProps) => {
  const spaceID = useSpaceStore(store => store.space.id);

  const {
    wrapWithCheckLock,
    checkPluginIsLockedByOthers,
    updatedInfo,
    pluginInfo,
    canEdit,
    initPlugin,
    unlockPlugin,
    initSuccessed,
    pluginID,
    version,
    updatePluginInfoByImmer,
  } = usePluginStore(
    useShallow(store => ({
      wrapWithCheckLock: store.wrapWithCheckLock,
      checkPluginIsLockedByOthers: store.checkPluginIsLockedByOthers,
      updatedInfo: store.updatedInfo,
      pluginInfo: store.pluginInfo,
      canEdit: store.canEdit,
      initPlugin: store.initPlugin,
      unlockPlugin: store.unlockPlugin,
      initSuccessed: store.initSuccessed,
      pluginID: store.pluginId,
      version: store.version,
      updatePluginInfoByImmer: store.updatePluginInfoByImmer,
    })),
  );
  const isCloudIDEPlugin = pluginInfo?.creation_method === CreationMethod.IDE;
  const isCozePlugin = pluginInfo?.creation_method === CreationMethod.COZE;
  const isInLibraryScope = typeof projectId === 'undefined';
  const pluginHistoryController = usePluginHistoryController();

  const { onStatusChange, onUpdateDisplayName } = usePluginCallbacks();
  const resourceNavigate = usePluginNavigate();
  const navigate = useNavigate();
  const capture = useErrorHandler();

  const [searchParams] = useSearchParams();

  const [curAPIInfo, setCurAPIInfo] = useState<PluginAPIInfo>();

  const [isPublishPopShow, setPublishPopShow] = useState(false);
  const [showPublishCheckPop, setShowPublishCheckPop] = useState(false);
  const [publishPopData, setPublishPopData] = useState<GetUpdatedAPIsResponse>(
    {},
  );

  const [params, setParams] = useState<GetPluginAPIsRequest>({
    //request parameters
    page: 1,
    size: 10,
    plugin_id: pluginID,
    preview_version_ts: version,
  });
  const [targetSwitchId, setTargetSwitchId] = useState<string>('');

  const [showDropdownItem, setShowDropDownItem] = useState<
    PluginAPIInfo | undefined
  >();

  const { modal: codeModal, setShowCodePluginModel } = useBotCodeEditInPlugin({
    modalProps: {
      onSuccess: () => refreshPage(),
    },
  });

  const { modal: pluginEditModal, setShowFormPluginModel } =
    useBotFormEditInPlugin({
      modalProps: {
        onSuccess: () => refreshPage(),
      },
    });

  const { modal: toolInputModal, setShowImportToolModal } =
    useImportToolInPlugin({
      modalProps: {
        onSuccess: () => refreshPage(),
      },
    });

  useUnmountUnlock(pluginID);

  const { data, loading } = useRequest(
    () => PluginDevelopApi.GetPluginAPIs(params),
    {
      refreshDeps: [params],
      onError: error => {
        capture(
          new CustomError(
            REPORT_EVENTS.PluginGetApis,
            `get Plugin Detail Error: ${error.message}`,
          ),
        );
      },
    },
  );

  useEffect(() => {
    const editExampleId = searchParams.get('edit_example_id');
    const editPlugin = searchParams.get('edit_plugin');
    const findTool = data?.api_info?.find(
      item => item.api_id === editExampleId,
    );
    if (findTool && editExampleId) {
      openExample(findTool);
      searchParams.delete('edit_example_id');
      navigate({ search: searchParams.toString() }, { replace: true });
    }

    if (data && editPlugin) {
      handleEditPlugin();
      searchParams.delete('edit_plugin');
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  }, [data, searchParams]);

  useEffect(() => {
    onUpdateDisplayName?.(pluginInfo?.meta_info?.name ?? '');
  }, [pluginInfo?.meta_info?.name]);

  useReportTti({
    isLive: !!data && !loading,
    extra: {
      renderSize: `${data?.api_info?.length}`,
    },
  });

  const dataSource = data?.api_info;

  /** no longer prompt */
  const noTips = async () => {
    const res = await PluginDevelopApi.NoUpdatedPrompt({
      plugin_id: pluginID,
    });
    if (res) {
      refreshPage();
    }
  };

  const checkPublish = async () => {
    if (!pluginInfo?.published) {
      //It has not been published. Click to publish directly.
      setPublishPopShow(true);
      return;
    }

    const res = await PluginDevelopApi.GetUpdatedAPIs({
      plugin_id: pluginID,
    });
    if (
      (res.created_api_names && res.created_api_names.length > 0) ||
      (res.deleted_api_names && res.deleted_api_names.length > 0) ||
      (res.updated_api_names && res.updated_api_names.length > 0)
    ) {
      setPublishPopData(res);
      setShowPublishCheckPop(true);
    } else {
      //Publish directly without modifying the api
      setPublishPopShow(true);
    }
  };

  const getPublishText = () => {
    const arr = [
      ...(publishPopData.created_api_names || []),
      ...(publishPopData.deleted_api_names || []),
      ...(publishPopData.updated_api_names || []),
    ];
    const text = I18n.t('Plugin_update_info_text', {
      number: arr.length,
      array: arr.join('、'),
    });
    return text;
  };

  const refreshPage = () => {
    tableRef.current?.reset();

    initPlugin();

    setParams(p => ({
      ...p,
      page: 1,
      size: 10,
    }));
  };

  const preloadIDE = usePreloadIDE?.({
    onBack: refreshPage,
    pluginID,
  });
  useUpdateEffect(() => {
    if (initSuccessed) {
      onStatusChange?.('normal');
      if (isCloudIDEPlugin) {
        preloadIDE?.handleInitIde(!canEdit);
      }
    } else {
      onStatusChange?.('error');
    }
  }, [initSuccessed]);
  // Differentiate IDE jumps
  const handleIdeJump = (
    initialAction = InitialAction.DEFAULT,
    toolId = '',
  ) => {
    // IDE logic
    if (isCloudIDEPlugin) {
      // Change the routing address and it will be cleared when returning.
      preloadIDE?.handleShowIde({ initialAction, toolId });
    } else if (toolId) {
      resourceNavigate.tool?.(toolId);
    }
  };

  const onRow = (record?: PluginAPIInfo) => ({
    onClick: () => {
      if (record?.api_id) {
        setShowDropDownItem(undefined);

        if (isCloudIDEPlugin) {
          handleIdeJump(InitialAction.SELECT_TOOL, record?.api_id);
          return;
        }

        resourceNavigate.tool?.(
          record.api_id,
          canEdit ? { mode: 'preview' } : {},
        );
      }
    }, // Click line
  });

  const { exampleNode, openExample } = useEditExample({
    onUpdate: refreshPage,
  });

  const { getColumns, reactNode: customToolNode } = useGetToolColumnsAdapter({
    targetSwitchId,
    setTargetSwitchId,
    loading,
    canEdit,
    refreshPage,
    plugin_id: pluginID,
    pluginInfo,
    updatedInfo,
    showDropdownItem,
    setShowDropDownItem,
    handleIdeJump,
    setCurAPIInfo,
    openExample,
    projectId,
    unlockPlugin,
  });
  const columns = getColumns();

  const tableRef = useRef<TableMethods>(null);
  // @ts-expect-error -- linter-disable-autofix
  const createToolText = creationMethodText[pluginInfo?.creation_method] || '';
  const { openModal: openCreateToolModal, content: createToolContent } =
    useCreateTool({
      text: createToolText,
      isShowBtn: false,
      disabled: !canEdit,
      onClickWrapper: wrapWithCheckLock,
      onBeforeClick: () => {
        setShowDropDownItem(undefined);
      },
      plugin_id: pluginID,
      space_id: spaceID,
    });

  const handleEditPlugin = async () => {
    setShowDropDownItem(undefined);
    if (canEdit) {
      const isLocked = await checkPluginIsLockedByOthers();

      if (isLocked) {
        return;
      }
    }

    setShowFormPluginModel(true);
  };

  const handlePublishSuccess = () => {
    pluginHistoryController.current?.reload();
    setPublishPopShow(false);
    updatePluginInfoByImmer(draft => {
      if (!draft) {
        return;
      }
      draft.published = true;
    });
  };

  const isRenderCodePluginButton = !isCloudIDEPlugin;

  const isRenderCreateToolButton = canEdit && Boolean(data?.total);

  const isRenderImportButton = canEdit && !isCloudIDEPlugin;

  const isRenderPublishButton = isRenderCreateToolButton && isInLibraryScope;

  const isRenderIDEPublishButton = isRenderPublishButton && isCloudIDEPlugin;

  const isRenderCozePluginPublishButton = isRenderPublishButton && isCozePlugin;

  return (
    <div className={s['tool-wrapper']}>
      {codeModal}
      {pluginEditModal}
      {toolInputModal}
      {customToolNode}
      {exampleNode}
      <Layout
        className="flex"
        title={renderHtmlTitle(
          I18n.t('tab_plugin_detail', {
            plugin_name: pluginInfo?.meta_info?.name ?? '',
          }),
        )}
        keepDocTitle={keepDocTitle}
      >
        {isInLibraryScope ? (
          <Layout.Header
            className={s['layout-header']}
            breadcrumb={
              <UIBreadcrumb
                showTooltip={{ width: '300px' }}
                pluginInfo={pluginInfo?.meta_info}
                compact={false}
              />
            }
          />
        ) : null}

        <Layout.Content className={s['layout-content']}>
          {/* Published and updated */}
          {pluginInfo?.status &&
          pluginInfo?.published &&
          canEdit &&
          isInLibraryScope ? (
            <Banner
              className={s.banner}
              type="info"
              bordered
              fullMode={false}
              description={
                <div>
                  {I18n.t('plugin_update_tip')}
                  <Typography.Text
                    className={s.notips}
                    onClick={() => {
                      noTips();
                    }}
                  >
                    {I18n.t('not_show_again')}
                  </Typography.Text>
                </div>
              }
            />
          ) : null}
          {/* Plugin Introduction */}
          {pluginInfo ? (
            <PluginHeader
              pluginInfo={pluginInfo}
              loading={loading}
              canEdit={canEdit}
              onClickEdit={handleEditPlugin}
              extraRight={
                <>
                  {renderHeaderSlot?.({ pluginInfo })}
                  {isRenderCodePluginButton ? (
                    <Tooltip
                      position="left"
                      content={I18n.t('Plugin_button_code_tooltip')}
                    >
                      <IconButton
                        icon={<IconCodeOutlined />}
                        onClick={() => {
                          setShowDropDownItem(undefined);
                          setShowCodePluginModel(true);
                        }}
                      />
                    </Tooltip>
                  ) : null}
                  {isRenderCreateToolButton ? (
                    <CreateTool
                      text={createToolText}
                      disabled={!canEdit}
                      onClickWrapper={wrapWithCheckLock}
                      onBeforeClick={() => {
                        setShowDropDownItem(undefined);
                        if (isCloudIDEPlugin) {
                          // Change the routing address and it will be cleared when returning.
                          preloadIDE?.handleShowIde({
                            initialAction: InitialAction.CREATE_TOOL,
                            toolId: '',
                          });
                          return false;
                        }
                        return true;
                      }}
                      plugin_id={pluginID}
                      space_id={spaceID}
                    />
                  ) : null}
                  {isRenderImportButton ? (
                    <Button
                      color="primary"
                      disabled={
                        !canEdit || pluginInfo?.plugin_type === PluginType.LOCAL
                      }
                      onClick={wrapWithCheckLock(() => {
                        setShowDropDownItem(undefined);
                        setShowImportToolModal(true);
                      })}
                    >
                      {I18n.t('import')}
                    </Button>
                  ) : null}
                  {/* ! Post button */}
                  {isRenderIDEPublishButton ? (
                    <Tooltip
                      position="left"
                      content={I18n.t('Plugin_button_publish_tooltip')}
                    >
                      <Button
                        disabled={!data?.total}
                        theme="solid"
                        onClick={() => {
                          setShowDropDownItem(undefined);
                          handleIdeJump();
                        }}
                      >
                        {I18n.t('Publish')}
                      </Button>
                    </Tooltip>
                  ) : null}
                  {isRenderCozePluginPublishButton ? (
                    <Popconfirm
                      visible={showPublishCheckPop}
                      onCancel={() => setShowPublishCheckPop(false)}
                      onClickOutSide={() => {
                        setShowPublishCheckPop(false);
                      }}
                      style={{ width: 400 }}
                      trigger="custom"
                      onConfirm={() => {
                        setShowPublishCheckPop(false);
                        setPublishPopShow(true);
                      }}
                      title={I18n.t('Plugin_update_info_title')}
                      content={<>{getPublishText()}</>}
                      okText={I18n.t('Confirm')}
                      cancelText={I18n.t('Cancel')}
                    >
                      <span>
                        <BizPluginPublishPopover
                          spaceId={spaceID}
                          pluginInfo={pluginInfo}
                          pluginId={pluginID}
                          isInLibraryScope={isInLibraryScope}
                          isPluginHasPublished={Boolean(pluginInfo.published)}
                          visible={isPublishPopShow}
                          onClickOutside={() => setPublishPopShow(false)}
                          onPublishSuccess={handlePublishSuccess}
                        >
                          <span>
                            <Tooltip
                              position="left"
                              content={I18n.t('Plugin_button_publish_tooltip')}
                            >
                              <Button
                                disabled={!data?.total}
                                theme="solid"
                                onClick={checkPublish}
                              >
                                {I18n.t('Publish')}
                              </Button>
                            </Tooltip>
                          </span>
                        </BizPluginPublishPopover>
                      </span>
                    </Popconfirm>
                  ) : null}
                </>
              }
            />
          ) : null}
          {/* Tool List Form */}
          {!!dataSource?.length && (
            <div className="mb-[24px] mt-[36px] text-[18px] weight-[600]">
              {I18n.t('plugin_api_list_table_name')}
            </div>
          )}
          <Table
            ref={tableRef}
            offsetY={390}
            tableProps={{
              rowKey: 'api_id',
              loading,
              dataSource,
              columns,
              onRow,
              onChange: e => {
                if (e.sorter?.sortOrder) {
                  //chronological sorting
                  setParams(p => ({
                    ...p,
                    page: 1,
                    size: 10,
                    order: {
                      desc: e.sorter?.sortOrder === 'descend',
                    },
                  }));
                }
              },
            }}
            empty={
              <UIEmpty
                empty={{
                  title: I18n.t('plugin_empty_desc'),
                  btnText: canEdit ? createToolText : undefined,
                  btnOnClick: () => {
                    if (isCloudIDEPlugin) {
                      // Change the routing address and it will be cleared when returning.
                      preloadIDE?.handleShowIde({
                        initialAction: InitialAction.CREATE_TOOL,
                        toolId: '',
                      });
                      return;
                    } else {
                      openCreateToolModal();
                    }
                  },
                }}
              />
            }
            enableLoad
            total={Number(data?.total || 0)}
            onLoad={() => {
              setParams(p => ({
                ...p,
                page: (params.page ?? 0) + 1,
              }));
            }}
          />
          {createToolContent}
        </Layout.Content>
      </Layout>
      <CodeSnippetModal
        visible={!!curAPIInfo}
        onCancel={() => {
          setCurAPIInfo(undefined);
        }}
        pluginAPIInfo={curAPIInfo}
      />
    </div>
  );
};

export { PluginDetailPage };
