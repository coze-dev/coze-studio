// import { runtimeEnv } from '@coze-arch/bot-env/runtime';
const DEBUG_TAG = 'open_debug';
const OPEN_CONSOLE_MARK = new RegExp(`(?:\\?|\\&)${DEBUG_TAG}=true`);

export const shouldCloseConsole = () => {
  // 如果URL带有调试开启标记，则允许console打开
  const { search } = window.location;
  let isOpenDebug = !!sessionStorage.getItem(DEBUG_TAG);
  if (!isOpenDebug) {
    isOpenDebug = OPEN_CONSOLE_MARK.test(search);
    isOpenDebug && sessionStorage.setItem(DEBUG_TAG, 'true');
  }
  // 除了正式正常环境都允许console打开
  const isProduction = !!(IS_RELEASE_VERSION );
  console.log('IS_RELEASE_VERSION', IS_RELEASE_VERSION, isProduction);
  return !isOpenDebug && isProduction;
};
