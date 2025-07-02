import { type NodeResult } from '@coze-workflow/base/api';
import { safeJSONParse } from '@coze-arch/bot-utils';

const generateAuth = (result?: NodeResult) => {
  if (!result?.extra) {
    return {
      needAuth: false,
      authLink: '',
    };
  }

  const extra = safeJSONParse(result?.extra, {});
  const auth = extra?.auth || {};
  const { auth_info: authLink, need_auth: needAuth } = auth;

  return {
    needAuth,
    authLink,
  };
};

export { generateAuth };
