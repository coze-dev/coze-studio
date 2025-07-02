import { reporter } from '../reporter';

export const getSlardarInstance = () => reporter.slardarInstance;

// 异步设置 coze 的 uid 信息
export const setUserInfoContext = (userInfo: DataItem.UserInfo) => {
  const slardarInstance = getSlardarInstance();
  if (slardarInstance) {
    slardarInstance?.('context.set', 'coze_uid', userInfo?.user_id_str);
  }
};
