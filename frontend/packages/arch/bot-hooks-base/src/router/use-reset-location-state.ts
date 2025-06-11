import { useLocation } from 'react-router-dom';

/** 清空认证数据的路由参数 */
export const resetAuthLoginDataFromRoute = () => {
  window.history.replaceState({}, '');
};
export function useResetLocationState() {
  const location = useLocation();
  return () => {
    // 清空location的state
    location.state = {};
    resetAuthLoginDataFromRoute();
  };
}
