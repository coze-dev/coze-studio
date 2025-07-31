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

import { type ReactNode, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';

import { VariableTypeTag } from '../../components/variable-type-tag';
import {
  MessageGenerateMode,
  type NicknameVariableMessageSetValue,
  type RoleMessageSetValue,
} from './types';

interface ValueDisplayProps {
  label: ReactNode;
  content: ReactNode;
}

const ValueDisplay: FC<ValueDisplayProps> = props => (
  <div className="h-full w-full flex items-center">
    <div className="font-medium pr-2 whitespace-nowrap">{props.label} : </div>
    <div className="flex-1 flex-nowrap overflow-hidden">{props.content}</div>
  </div>
);

const ContentDisplay: FC<{
  value: RoleMessageSetValue | NicknameVariableMessageSetValue;
}> = props => {
  const { value } = props;
  if (value.generate_mode === MessageGenerateMode.FixedContent) {
    return (
      <Tooltip content={value.content}>
        <div className="truncate">{value.content}</div>
      </Tooltip>
    );
  } else {
    return (
      <VariableTypeTag className="!inline">
        {I18n.t(
          'scene_workflow_chat_node_conversation_content_speaker_generate',
          {},
          'Generate by Agent',
        )}
      </VariableTypeTag>
    );
  }
};

export const RoleMessageSetValueDisplay: FC<{
  value: RoleMessageSetValue;
}> = props => {
  const { value } = props;

  if (value) {
    return (
      <ValueDisplay
        label={
          <>
            {value.role}
            {value.nickname
              ? `(${value.nickname})`
              : `(${I18n.t(
                  'scene_edit_roles_list_nickname_empty_seat',
                  {},
                  '空位',
                )})`}
          </>
        }
        content={<ContentDisplay value={value} />}
      />
    );
  } else {
    return null;
  }
};

export const NicknameMessageSetValueDisplay: FC<{
  value: NicknameVariableMessageSetValue;
}> = props => {
  const { value } = props;
  return (
    <ValueDisplay
      label={value.nickname}
      content={<ContentDisplay value={value} />}
    />
  );
};

export const Placeholder = () => (
  <div className="text-[var(--semi-color-text-0)] opacity-30">
    {I18n.t(
      'scene_workflow_chat_message_content_placeholder',
      {},
      'This is a sample message, click to edit.',
    )}
  </div>
);
