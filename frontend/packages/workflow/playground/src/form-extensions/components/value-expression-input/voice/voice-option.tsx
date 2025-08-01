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

import React from 'react';

import classnames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Avatar, Tag } from '@coze-arch/coze-design';

import voiceAvatar from '../assets/voice_avatar.png';

interface TagProps {
  name?: string;
  onClose?: () => void;
}

export const VoiceTag = ({ name, onClose }: TagProps) => (
  <Tag
    size="mini"
    closable={!!onClose}
    onClose={onClose}
    className={classnames('max-w-full min-w-[65%] overflow-hidden w-full')}
    style={{
      height: 20,
    }}
    color="primary"
  >
    <div
      className={classnames('block w-full overflow-hidden', {
        'text-[12px] coz-fg-primary font-medium': true,
      })}
    >
      {name}
    </div>
  </Tag>
);

interface OptionProps {
  onClick?: () => void;
}

export const VoiceOption = ({ onClick }: OptionProps) => (
  <>
    <div className="w-full relative">
      <div
        className={classnames(
          'p-1 flex items-center cursor-pointer hover:coz-mg-primary active:coz-mg-primary-pressed h-6 rounded-[4px] coz-mg-primary',
        )}
      >
        <Avatar
          style={{
            width: '16px',
            height: '16px',
          }}
          shape={'square'}
          size="extra-extra-small"
          src={voiceAvatar}
        />

        <div className="flex-1 ml-1 truncate text-xs" onClick={onClick}>
          {I18n.t('workflow_variable_select_voice')}
        </div>
      </div>
    </div>
  </>
);
