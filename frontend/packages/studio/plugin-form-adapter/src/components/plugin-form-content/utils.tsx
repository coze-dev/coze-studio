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

import { useEffect, useState } from 'react';

import { type PluginInfoProps } from '@coze-studio/plugin-shared';
import { type UploadValue } from '@coze-common/biz-components';
import { I18n } from '@coze-arch/i18n';
import { safeJSONParse } from '@coze-arch/bot-utils';
import {
  type commonParamSchema,
  type CreationMethod,
  ParameterLocation,
  type PluginType,
  type PluginMetaInfo,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import { type FormState } from './hooks';

export const formRuleList = {
  name: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_name1_error'),
    },
    IS_OVERSEA || IS_BOE
      ? {
          pattern: /^[\w\s]+$/,
          message: I18n.t('create_plugin_modal_nameerror'),
        }
      : {
          pattern: /^[\w\s\u4e00-\u9fa5]+$/u, // Increased domestic support for Chinese
          message: I18n.t('create_plugin_modal_nameerror_cn'),
        },
  ],
  desc: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_descrip1_error'),
    },
    // Only cn online supports Chinese.
    IS_OVERSEA || IS_BOE
      ? {
          // eslint-disable-next-line no-control-regex -- regex
          pattern: /^[\x00-\x7F]+$/,
          message: I18n.t('create_plugin_modal_descrip_error'),
        }
      : {},
  ],
  url: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_url1_error'),
    },
  ],
  key: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_Parameter_error'),
    },
    {
      // eslint-disable-next-line no-control-regex -- regex
      pattern: /^[\x00-\x7F]+$/,
      message: I18n.t('plugin_Parametename_error'),
    },
  ],
  service_token: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_Servicetoken_error'),
    },
  ],
};

export const getPictureUploadInitValue = (
  info?: PluginMetaInfo,
): UploadValue | undefined => {
  if (!info) {
    return;
  }
  return [
    {
      url: info.icon?.url || '',
      uid: info?.icon?.uri || '',
    },
  ];
};

export interface AuthOption {
  label: string;
  value: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any
  [key: string]: any;
}
/** Recursively find the input under the auth option */
export const findAuthTypeItem = (data: AuthOption[], targetKey = 0) => {
  for (const item of data) {
    if (item.value === targetKey) {
      return item;
    } else if (item.children?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- any
      const res: any = findAuthTypeItem(item.children, targetKey);
      if (res) {
        return res;
      }
    }
  }
  return undefined;
};

export const findAuthTypeItemV2 = (
  opts: AuthOption[],
  authType?: number[],
  subAuthType?: number,
) => {
  if (authType?.[0] === 0) {
    return opts.find(item => item.value === 0);
  } else if (authType?.[0] === 1) {
    const optsItem = opts.find(item => item.value === 1);
    return optsItem?.children.find(
      (item: AuthOption) => item.value === subAuthType,
    );
  } else if (authType?.[0] === 3) {
    const optsItem = opts.find(item => item.value === 3);

    return optsItem?.children.find(
      (item: AuthOption) => item.value === subAuthType,
    );
  }
};

interface RuntimeOptionsType {
  label: string;
  value: string;
}

interface IdeConfType {
  key: string;
  type: string;
  default: string;
  options: {
    value: string;
    name: string;
  }[];
}

export interface UsePluginSchameReturnValue {
  authOption: AuthOption[];
  runtimeOptions: RuntimeOptionsType[];
  defaultRuntime: string;
}

// Get schame and runtime options
export const usePluginSchame = (): UsePluginSchameReturnValue => {
  const [authOption, setAuthOption] = useState<AuthOption[]>([]);
  const [runtimeOptions, setRuntimeOptions] = useState<RuntimeOptionsType[]>(
    [],
  );
  const [defaultRuntime, setDefaultRuntime] = useState('1');

  const getOption = async () => {
    const res = await PluginDevelopApi.GetOAuthSchema();
    const authOptions = [
      {
        label: I18n.t('create_plugin_modal_Authorization_no'),
        value: 0,
        key: 'None',
      },
      {
        label: I18n.t('create_plugin_modal_Authorization_service'),
        value: 1,
        key: 'Service',
        children: [
          {
            label: I18n.t('plugin_auth_method_service_api_key'),
            value: 0,
            key: 'Service Token / API Key',
          },
        ],
      },
      {
        label: I18n.t('create_plugin_modal_Authorization_oauth'),
        value: 3,
        key: 'OAuth',
        children: safeJSONParse(res.oauth_schema),
      },
    ];
    setAuthOption(authOptions);
    const runtimeInfo = (
      safeJSONParse(res.ide_conf, []) as IdeConfType[]
    )?.find?.(item => item.key === 'code_runtime_enum');
    if (runtimeInfo) {
      const runtimeList = runtimeInfo.options.map(item => ({
        value: item.value,
        label: item.name,
      }));
      setRuntimeOptions(runtimeList);
      setDefaultRuntime(runtimeInfo.default);
    }
  };
  useEffect(() => {
    getOption();
  }, []);

  return { authOption, runtimeOptions, defaultRuntime };
};

export const convertPluginMetaParams = ({
  val,
  spaceId,
  headerList,
  projectId,
  creationMethod,
  defaultRuntime,
  pluginType,
  extItemsJSON,
}: {
  val: FormState;
  spaceId: string;
  headerList: commonParamSchema[];
  projectId: string | undefined;
  creationMethod: CreationMethod;
  defaultRuntime: string;
  pluginType: PluginType;
  extItemsJSON: Record<string, string>;
}) => {
  const mainAuthType = val.auth_type?.at(0);
  const serviceSubAuthType = val.auth_type?.at(-1);
  const initParams = {
    ...val,
    icon: { uri: val?.plugin_uri?.[0]?.uid },
    auth_type: mainAuthType,
    common_params: {
      [ParameterLocation.Header]: headerList,
      [ParameterLocation.Body]: [],
      [ParameterLocation.Path]: [],
      [ParameterLocation.Query]: [],
    },
    space_id: spaceId,
    project_id: projectId,
    creation_method: creationMethod,
    ide_code_runtime: val.ide_code_runtime ?? defaultRuntime,
    plugin_type: Number(pluginType) as unknown as PluginType,
    private_link_id:
      val.private_link_id === '0' ? undefined : val.private_link_id,
  };
  const params =
    mainAuthType === 1
      ? {
          ...initParams,
          sub_auth_type: serviceSubAuthType,
          auth_payload: JSON.stringify(extItemsJSON),
        }
      : {
          ...initParams,
          sub_auth_type: mainAuthType === 3 ? serviceSubAuthType : undefined,
          oauth_info: JSON.stringify(extItemsJSON),
        };
  return params;
};

export const registerPluginMeta = async ({
  params,
}: {
  params: ReturnType<typeof convertPluginMetaParams>;
}) => {
  const res = await PluginDevelopApi.RegisterPluginMeta(
    {
      ...params,
    },
    {
      __disableErrorToast: true,
    },
  );
  return res.plugin_id;
};

export const updatePluginMeta = async ({
  params,
  editInfo,
}: {
  params: ReturnType<typeof convertPluginMetaParams>;
  editInfo: PluginInfoProps | undefined;
}) => {
  await PluginDevelopApi.UpdatePluginMeta(
    {
      ...params,
      plugin_id: editInfo?.plugin_id || '',
      edit_version: editInfo?.edit_version,
    },
    {
      __disableErrorToast: true,
    },
  );
  return '';
};
