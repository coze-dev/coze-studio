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
import { useEffect, useRef, useState } from 'react';

import { type AxiosResponse } from 'axios';
import { userStoreService } from '@coze-studio/user-store';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import {
  EVENT_NAMES,
  sendTeaEvent,
  type ParamsTypeDefine,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { UIToast, UIModal } from '@coze-arch/bot-semi';
import { IconWarningInfo } from '@coze-arch/bot-icons';
import { type ApiError } from '@coze-arch/bot-http';
import {
  type Convert2OpenAPIRequest,
  type BatchCreateAPIRequest,
  type BatchCreateAPIResponse,
  type Convert2OpenAPIResponse,
} from '@coze-arch/bot-api/plugin_develop';
import {
  SpaceType,
  type PluginMetaInfo,
} from '@coze-arch/bot-api/developer_api';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import {
  getImportFormatType,
  getInitialPluginMetaInfo,
  isDuplicatePathErrorResponseData,
  parsePluginInfo,
} from './utils';
import { showMergeTool } from './show-merge-tool';
import { PluginInfoConfirm } from './plugin-info-confirm';
import { type ImportData, ImportModal } from './import-modal';
import {
  ERROR_CODE,
  INITIAL_PLUGIN_REPORT_PARAMS,
  INITIAL_TOOL_REPORT_PARAMS,
  getEnv,
} from './const';
interface ImportModalProps {
  visible: boolean;
  onCancel?: () => void;
  onSuccess?: (pluginInfo?: { plugin_id?: string }) => void;
  projectId?: string;
}

export type ImportPluginModalProps = ImportModalProps;
export interface ImportToolModalProps extends ImportModalProps {
  pluginInfo?: {
    pluginName?: string;
    pluginUrl?: string;
    pluginID?: string;
    pluginDesc?: string;
    editVersion?: number;
  };
}

interface ImportPluginInfo {
  aiPlugin?: string;
  openAPI?: string;
  metaInfo?: PluginMetaInfo;
}

export const ImportPluginModal: React.FC<ImportPluginModalProps> = props => {
  const { visible } = props;
  return visible ? <ImportPluginModalContent {...props} /> : null;
};

export const ImportPluginModalContent: React.FC<
  ImportPluginModalProps
> = props => {
  const { onCancel, visible, onSuccess, projectId } = props;
  const [importPluginInfo, setImportPluginInfo] = useState<ImportPluginInfo>();

  const { id: spaceId, space_type } = useSpaceStore(store => store.space);

  const reportParams = useRef<
    ParamsTypeDefine[EVENT_NAMES.create_plugin_front]
  >(INITIAL_PLUGIN_REPORT_PARAMS);

  const isPersonal = space_type === SpaceType.Personal;

  useEffect(() => {
    reportParams.current = {
      ...reportParams.current,
      environment: getEnv(),
      workspace_id: spaceId || '',
      workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
      status: 1,
      create_type: 'import',
    };
  }, [spaceId, isPersonal]);

  const convert2OpenAPI = async (
    req: Convert2OpenAPIRequest,
  ): Promise<{ success: boolean; errMsg?: string }> => {
    try {
      const { openapi, ai_plugin, plugin_data_format } =
        await PluginDevelopApi.Convert2OpenAPI(req, {
          __disableErrorToast: true,
        });

      // Parse string
      const result = parsePluginInfo({
        aiPlugin: ai_plugin,
        openAPI: openapi,
      });
      const metaImportPluginInfo = getInitialPluginMetaInfo(result);

      setImportPluginInfo({
        aiPlugin: ai_plugin,
        openAPI: openapi,
        metaInfo: metaImportPluginInfo,
      });

      reportParams.current = {
        ...reportParams.current,
        import_format_type: getImportFormatType(plugin_data_format),
        import_tools_count: Object.entries(result?.openAPI?.paths || {}).length,
      };

      return {
        success: true,
      };
    } catch (e) {
      const { msg, code, response } = e as ApiError;
      // @ts-expect-error -- linter-disable-autofix
      logger.error({ error: e, eventName: 'plugin_convert_openapi_fail' });
      reportParams.current = {
        ...reportParams.current,
        import_format_type: getImportFormatType(
          (response as unknown as AxiosResponse<Convert2OpenAPIResponse>)?.data
            ?.plugin_data_format,
        ),
        import_tools_count: 0,
      };
      sendTeaEvent(EVENT_NAMES.create_plugin_front, {
        ...reportParams.current,
        status: 1,
        error_message: msg,
      });
      if (
        Number(code) === ERROR_CODE.DUP_PATH ||
        isDuplicatePathErrorResponseData(response?.data)
      ) {
        const handleMerge = async () => {
          const { errMsg, success } = await convert2OpenAPI({
            ...req,
            merge_same_paths: true,
          });
          if (!success) {
            UIToast.error({
              content: withSlardarIdButton(errMsg || I18n.t('error')),
            });
            return Promise.reject(errMsg);
          }
        };
        showMergeTool({
          onOk: handleMerge,
          duplicateInfos: (
            response as unknown as AxiosResponse<Convert2OpenAPIResponse>
          )?.data?.duplicate_api_infos,
        });
        return { success: false, errMsg: '' };
      } else {
        return {
          success: false,
          errMsg: msg || I18n.t('error'),
        };
      }
    }
  };

  const handleConvertOpenAPI = async ({ content, type }: ImportData) => {
    reportParams.current = {
      ...reportParams.current,
      import_way_type: type,
    };
    return await convert2OpenAPI({
      data: content || '',
      space_id: spaceId,
      merge_same_paths: false,
    });
  };

  return (
    <>
      <ImportModal
        title={I18n.t('import_plugin')}
        visible={visible}
        onCancel={onCancel}
        onOk={handleConvertOpenAPI}
      />
      {importPluginInfo ? (
        <PluginInfoConfirm
          visible={!!importPluginInfo}
          projectId={projectId}
          onCancel={() => setImportPluginInfo(undefined)}
          importInfo={{
            metaInfo: importPluginInfo.metaInfo,
            openAPI: importPluginInfo.openAPI,
            aiPlugin: importPluginInfo.aiPlugin,
            extra: { reportParams: reportParams.current },
          }}
          onSuccess={data => {
            onCancel?.();
            onSuccess?.(data);
          }}
        />
      ) : null}
    </>
  );
};

export const ImportToolModal: React.FC<ImportToolModalProps> = props => {
  const { visible } = props;
  return visible ? <ImportToolModalContent {...props} /> : null;
};

export const ImportToolModalContent: React.FC<ImportToolModalProps> = props => {
  const { onCancel, visible, onSuccess, pluginInfo } = props;

  const reportParams = useRef<
    ParamsTypeDefine[EVENT_NAMES.create_plugin_tool_front]
  >(INITIAL_TOOL_REPORT_PARAMS);

  const { id: spaceId, space_type } = useSpaceStore(store => store.space);
  const isPersonal = space_type === SpaceType.Personal;

  const userInfo = userStoreService.useUserInfo();

  useEffect(() => {
    reportParams.current = {
      ...reportParams.current,
      environment: getEnv(),
      workspace_id: spaceId || '',
      workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
      status: 1,
      create_type: 'import',
      plugin_id: pluginInfo?.pluginID || '',
    };
  }, [pluginInfo?.pluginID, spaceId, isPersonal]);

  const handleBatchImportTool = async (req?: BatchCreateAPIRequest) => {
    try {
      const resp = await PluginDevelopApi.BatchCreateAPI(req, {
        __disableErrorToast: true,
      });
      const toolsCount = req?.replace_same_paths
        ? req?.paths_to_replace?.length
        : resp?.paths_created?.length;
      sendTeaEvent(EVENT_NAMES.create_plugin_tool_front, {
        ...reportParams.current,
        status: 0,
        import_tools_count: toolsCount || 0,
      });
      if (resp && !resp?.paths_duplicated?.length) {
        UIToast.success(
          req?.replace_same_paths
            ? I18n.t('plugin_tool_replace_success')
            : I18n.t('plugin_tool_import_succes'),
        );
        onCancel?.();
        onSuccess?.();
      }
    } catch (e) {
      const { code, response } = e as ApiError;

      if (
        Number(code) !== ERROR_CODE.DUP_PATH &&
        !isDuplicatePathErrorResponseData(response?.data)
      ) {
        return Promise.reject(e);
      }

      sendTeaEvent(EVENT_NAMES.create_plugin_tool_front, {
        ...reportParams.current,
        status: 0,
        import_tools_count:
          (response as unknown as AxiosResponse<BatchCreateAPIResponse>)?.data
            ?.paths_created?.length || 0,
      });
      handleDupPath(
        req,
        (response as unknown as AxiosResponse<BatchCreateAPIResponse>)?.data,
      );
    }
  };

  const handleDupPath = (
    req?: BatchCreateAPIRequest,
    resp?: BatchCreateAPIResponse,
  ) => {
    const { paths_created = [], paths_duplicated = [] } = resp || {};
    const importedLength = paths_created.length;
    const duplicatedLength = paths_duplicated.length;
    const failedContent = I18n.t('failed_to_import_tool', {
      num: duplicatedLength,
    });
    const successContent = I18n.t('tools_imported_successfully', {
      num: importedLength,
    });
    UIModal.warning({
      title: importedLength
        ? `${successContent}, ${failedContent}`
        : failedContent,
      content: duplicatedLength
        ? I18n.t('plugin_tool_exists_tips', { num: duplicatedLength })
        : null,
      okText: I18n.t('replace'),
      cancelText: I18n.t('Cancel'),
      centered: true,
      icon: <IconWarningInfo />,
      okButtonProps: {
        type: 'warning',
      },
      onOk: async () => {
        const batchCreateReq: BatchCreateAPIRequest = {
          ...req,
          replace_same_paths: true,
          paths_to_replace: paths_duplicated,
        };
        try {
          await handleBatchImportTool(batchCreateReq);
        } catch (err) {
          const { msg: errMsg } = err as ApiError;
          UIToast.error({
            content: withSlardarIdButton(errMsg || I18n.t('error')),
          });
          sendTeaEvent(EVENT_NAMES.create_plugin_tool_front, {
            ...reportParams.current,
            import_tools_count: 0,
            status: 1,
            error_message: errMsg || '',
          });
        }
      },
      onCancel: importedLength
        ? async () => {
            onCancel?.();
            await onSuccess?.();
          }
        : undefined,
    });
  };

  const convertOpenAPI = async (req: Convert2OpenAPIRequest) =>
    await PluginDevelopApi.Convert2OpenAPI(
      { ...req, plugin_description: pluginInfo?.pluginDesc },
      {
        __disableErrorToast: true,
      },
    );

  const batchImport = async (req: Convert2OpenAPIRequest) => {
    try {
      const resp = await convertOpenAPI(req);

      reportParams.current = {
        ...reportParams.current,
        import_format_type: getImportFormatType(resp?.plugin_data_format),
      };
      const batchCreateReq: BatchCreateAPIRequest = {
        plugin_id: pluginInfo?.pluginID,
        ai_plugin: resp?.ai_plugin,
        openapi: resp?.openapi,
        replace_same_paths: false,
        space_id: spaceId,
        dev_id: userInfo?.user_id_str,
        edit_version: pluginInfo?.editVersion,
      };

      await handleBatchImportTool(batchCreateReq);
      return { success: true };
    } catch (e) {
      const { msg, code, response } = e as ApiError;
      // @ts-expect-error -- linter-disable-autofix
      logger.error({ error: e, eventName: 'batch_create_fail' });

      reportParams.current = {
        ...reportParams.current,
        import_format_type: getImportFormatType(
          (response as unknown as AxiosResponse<Convert2OpenAPIResponse>)?.data
            ?.plugin_data_format,
        ),
      };
      sendTeaEvent(EVENT_NAMES.create_plugin_tool_front, {
        ...reportParams.current,
        import_tools_count: 0,
        status: 1,
        error_message: msg || '',
      });

      if (
        Number(code) === ERROR_CODE.DUP_PATH ||
        isDuplicatePathErrorResponseData(response?.data)
      ) {
        const handleMerge = async () => {
          const { success, errMsg } = await batchImport({
            ...req,
            merge_same_paths: true,
          });

          if (!success) {
            UIToast.error({
              content: withSlardarIdButton(errMsg || I18n.t('error')),
            });
            return Promise.reject(e);
          }
        };

        showMergeTool({
          onOk: handleMerge,
          duplicateInfos: (
            response as unknown as AxiosResponse<Convert2OpenAPIResponse>
          )?.data?.duplicate_api_infos,
        });
        return { success: false };
      } else {
        return {
          success: false,
          errMsg: msg || I18n.t('error'),
        };
      }
    }
  };

  const handleImport = async (importData?: ImportData) => {
    const { content, type } = importData || {};
    reportParams.current = {
      ...reportParams.current,
      import_way_type: type,
    };
    const res = await batchImport({
      data: content || '',
      plugin_name: pluginInfo?.pluginName,
      plugin_url: pluginInfo?.pluginUrl,
      merge_same_paths: false,
      space_id: spaceId,
    });

    return res;
  };

  return (
    <ImportModal
      title={I18n.t('import_plugin_tool')}
      visible={visible}
      onCancel={onCancel}
      onOk={handleImport}
    />
  );
};
