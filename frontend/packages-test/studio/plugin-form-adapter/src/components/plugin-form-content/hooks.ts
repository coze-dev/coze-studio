import { useRef, useState } from 'react';

import { type FormApi } from '@coze-arch/bot-semi/Form';
import {
  type AuthorizationType,
  type RegisterPluginMetaRequest,
  type commonParamSchema,
} from '@coze-arch/bot-api/plugin_develop';
import { type UploadValue } from '@coze-common/biz-components';
import { type OauthTccOpt } from '@coze-studio/plugin-shared';

import { type UsePluginSchameReturnValue, usePluginSchame } from './utils';

export type FormState = RegisterPluginMetaRequest & {
  plugin_uri: UploadValue;
  auth_type: AuthorizationType[];
} & Record<string, string>;

export interface UsePluginFormStateReturn extends UsePluginSchameReturnValue {
  formApi: React.MutableRefObject<FormApi<FormState> | undefined>;
  extItems: OauthTccOpt[];
  setExtItems: React.Dispatch<React.SetStateAction<OauthTccOpt[]>>;
  headerList: commonParamSchema[];
  setHeaderList: React.Dispatch<React.SetStateAction<commonParamSchema[]>>;
  isValidCheckResult: boolean;
  setIsValidCheckResult: React.Dispatch<React.SetStateAction<boolean>>;
  pluginTypeCreationMethod?: string;
  setPluginTypeCreationMethod: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
}

export const usePluginFormState = (): UsePluginFormStateReturn => {
  const formApi = useRef<
    FormApi<
      RegisterPluginMetaRequest & {
        plugin_uri: UploadValue;
        auth_type: Array<AuthorizationType>;
      } & Record<string, string>
    >
  >();
  const { authOption, runtimeOptions, defaultRuntime } = usePluginSchame();
  const [extItems, setExtItems] = useState<OauthTccOpt[]>([]);
  const [headerList, setHeaderList] = useState<commonParamSchema[]>([
    { name: 'User-Agent', value: 'Coze/1.0' },
  ]);
  // 合规审核结果
  const [isValidCheckResult, setIsValidCheckResult] = useState(true);
  const [pluginTypeCreationMethod, setPluginTypeCreationMethod] =
    useState<string>();

  return {
    formApi,
    extItems,
    setExtItems,
    headerList,
    setHeaderList,
    isValidCheckResult,
    setIsValidCheckResult,
    pluginTypeCreationMethod,
    setPluginTypeCreationMethod,
    authOption,
    runtimeOptions,
    defaultRuntime,
  };
};
