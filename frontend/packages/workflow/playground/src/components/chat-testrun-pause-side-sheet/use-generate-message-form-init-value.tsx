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
