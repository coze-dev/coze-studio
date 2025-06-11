import { useEffect, useState } from 'react';

import { type UploadValue } from '@coze-common/biz-components';
import { I18n } from '@coze-arch/i18n';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { type PluginMetaInfo } from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

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
          pattern: /^[\w\s\u4e00-\u9fa5]+$/u, // 国内增加支持中文
          message: I18n.t('create_plugin_modal_nameerror_cn'),
        },
  ],
  desc: [
    {
      required: true,
      message: I18n.t('create_plugin_modal_descrip1_error'),
    },
    // 只有cn 线上才支持中文
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
    {
      pattern: /^(https):\/\/.+$/,
      message: I18n.t('create_plugin_modal_url_error_https'),
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
/** 递归寻找auth选项下的输入项 */
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
  // 无能为力 👐
  if (authType?.[0] === 0) {
    return opts.find(item => item.value === 0);
  } else if (authType?.[0] === 1) {
    const optsItem = opts.find(item => item.value === 1);
    return optsItem?.children.find(
      (item: AuthOption) => item.value === subAuthType,
    );
  } else if (authType?.[0] === 3 && subAuthType === 4) {
    // 这里是一个很古老的 hack 逻辑
    // authType 的取值为：[0],[1],[3,4]
    const optsItem = opts.find(item => item.value === 3);
    return optsItem?.children.find((item: AuthOption) => item.value === 4);
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

// 获取schame 和 runtime options
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
