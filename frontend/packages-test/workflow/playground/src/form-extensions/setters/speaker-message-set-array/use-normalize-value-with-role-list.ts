import { useGetSceneFlowRoleList } from '../../../hooks/use-get-scene-flow-params';
import { type SpeakerMessageSetValue } from './types';

export const useNormalizeValueWithRoleList = (
  remoteValue: Array<SpeakerMessageSetValue | undefined> | undefined,
) => {
  const { isLoading, data: roleList } = useGetSceneFlowRoleList();
  if (!remoteValue || isLoading) {
    return [];
  }

  return remoteValue.map(item => {
    // 如果没有 biz_role_id， 说明是nickname变量，这里不做处理
    if (!item?.biz_role_id) {
      return item;
    }

    const role = roleList?.find(
      _role => _role.biz_role_id === item?.biz_role_id,
    );

    // 如果没找到对应的角色，说明已经被删除，这里不做处理，外面报错提示已失效
    if (!role) {
      return item;
    }

    // 如果 value 保存的 nickname 和 角色列表里的都有，就以角色列表里的为准
    if (role?.nickname && item.nickname) {
      return {
        ...item,
        role: role.role,
        nickname: role.nickname,
      } as unknown as SpeakerMessageSetValue;
    }

    return item;
  });
};
