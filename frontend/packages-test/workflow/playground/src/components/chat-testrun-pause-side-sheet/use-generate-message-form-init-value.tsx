import { useGetSceneFlowRoleList } from '../../hooks/use-get-scene-flow-params';
import { type SpeakerMessageSetValue } from '../../form-extensions/setters/speaker-message-set-array/types';
import { type MessageValue } from './types';

export const useGenerateMessageFormInitValue = () => {
  const { data: roleList } = useGetSceneFlowRoleList();

  return (messages: Array<SpeakerMessageSetValue> | undefined) => {
    const result = messages?.reduce<Array<MessageValue>>((buf, message) => {
      const role = roleList?.find(
        _role => _role.biz_role_id === message.biz_role_id,
      );
      if (!role) {
        return buf;
      } else {
        buf.push({
          role: message.role,
          content: message.content,
          nickname: message.nickname ?? '',
        });
        return buf;
      }
    }, []);

    return result;
  };
};
