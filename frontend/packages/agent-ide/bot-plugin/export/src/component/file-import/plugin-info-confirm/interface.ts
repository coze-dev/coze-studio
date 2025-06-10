import {
  type RegisterPluginMetaRequest,
  type AuthorizationType,
  type commonParamSchema,
} from '@coze-arch/bot-api/developer_api';
import { type UploadValue } from '@coze-common/biz-components';

export interface ConfirmFormProps
  extends Omit<RegisterPluginMetaRequest, 'auth_type'> {
  plugin_uri: UploadValue;
  auth_type: Array<AuthorizationType>;
  headerList?: Array<commonParamSchema>;
  client_id?: string;
  client_secret?: string;
}
