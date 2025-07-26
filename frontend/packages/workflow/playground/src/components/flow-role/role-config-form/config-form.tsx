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

import { useMemo } from 'react';

import { type Form } from '@coze-workflow/test-run/formily';
import { LazyFormCore } from '@coze-workflow/test-run';
import { I18n } from '@coze-arch/i18n';

import { useRoleService } from '@/hooks';

import { formValue2Data, data2FormValue } from './utils';
import { RoleVoices, AddVoices, TextToVoice } from './role-voices';
import { RoleSuggestion, RoleSuggestionSwitch } from './role-suggestion';
import {
  SuggestionList,
  DisplayAllSwitch,
  AIGenerateBtn,
} from './role-onboarding';
import { RoleNameInput } from './role-name-input';
import { RoleDefaultInput } from './role-input';
import { RoleBackground, AddBackground } from './role-background';
import { RoleAvatarUpload } from './role-avatar-upload';

const schema = {
  type: 'object',
  properties: {
    info: {
      type: 'void',
      'x-component': 'FormSection',
      'x-component-props': {
        title: I18n.t('skill_role_information'),
        tooltip: I18n.t('workflow_role_config_title_tooltip'),
        collapsible: true,
      },
      properties: {
        name: {
          title: I18n.t('scene_edit_roles_create_name'),
          type: 'string',
          required: true,
          'x-component': 'RoleNameInput',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            tooltip: I18n.t('workflow_role_config_name_tooltip'),
          },
          'x-validator': {
            required: true,
            message: I18n.t('workflow_testset_required_tip', {
              param_name: I18n.t('scene_edit_roles_create_name'),
            }),
          },
        },
        description: {
          title: I18n.t('role_info.description'),
          type: 'string',
          'x-component': 'TextArea',
          'x-component-props': {
            placeholder: I18n.t('workflow_role_config_description_placeheader'),
            size: 'small',
          },
          'x-decorator': 'FormItem',
        },
        avatar: {
          title: I18n.t('workflow_role_config_avatar'),
          type: 'string',
          'x-component': 'RoleAvatarUpload',
          'x-reactions': [
            {
              dependencies: ['name', 'description'],
              fulfill: {
                schema: {
                  'x-component-props.generateInfo': {
                    name: '{{$deps[0]}}',
                    desc: '{{$deps[1]}}',
                  },
                },
              },
            },
          ],
          'x-decorator': 'FormItem',
        },
      },
    },
    onboarding: {
      type: 'void',
      'x-component': 'FormSection',
      'x-component-props': {
        title: I18n.t('devops_publish_multibranch_BotInfo.OnboardingInfo'),
        collapsible: true,
        // will support soon
        action: IS_OPEN_SOURCE ? null : <AIGenerateBtn />,
      },
      properties: {
        prologue: {
          title: I18n.t('bot_edit_opening_text_title'),
          type: 'string',
          'x-component': 'FullInput',
          'x-component-props': {
            placeholder: I18n.t(
              'community_Please_enter_please_enter_your_post',
            ),
            modalTitle: I18n.t('bot_edit_opening_text_title'),
          },
          'x-decorator': 'FormItem',
        },
        questions: {
          title: I18n.t('review_bot_Onboarding_suggested_questions'),
          type: 'string',
          'x-component': 'SuggestionList',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            action: <DisplayAllSwitch />,
          },
        },
      },
    },
    suggest: {
      type: 'object',
      'x-component': 'RoleSuggestion',
      'x-component-props': {},
      'x-decorator': 'FormSection',
      'x-decorator-props': {
        title: I18n.t('review_agent_suggestreplyinfo'),
        collapsible: true,
        action: <RoleSuggestionSwitch />,
      },
    },
    background: {
      type: 'object',
      'x-component': 'RoleBackground',
      'x-decorator': 'FormSection',
      'x-decorator-props': {
        title: I18n.t(
          'devops_publish_multibranch_BotInfo.BackgroundImageInfoList',
        ),
        collapsible: true,
        action: <AddBackground />,
      },
    },
    voices: {
      type: 'object',
      // will support soon
      'x-visible': !IS_OVERSEA && !IS_OPEN_SOURCE,
      'x-decorator': 'FormSection',
      'x-decorator-props': {
        title: I18n.t('workflow_role_config_voices_title'),
        collapsible: true,
        action: <AddVoices />,
      },
      properties: {
        config: {
          type: 'object',
          'x-component': 'RoleVoices',
        },
        textToVoice: {
          type: 'boolean',
          'x-component': 'TextToVoice',
        },
      },
    },
    input: {
      type: 'void',
      // will support soon
      'x-visible': !IS_OVERSEA && !IS_OPEN_SOURCE,
      'x-component': 'FormSection',
      'x-component-props': {
        title: I18n.t('workflow_role_config_input_title'),
        collapsible: true,
      },
      properties: {
        default: {
          type: 'string',
          'x-component': 'RoleDefaultInput',
        },
      },
    },
  },
};

export const RoleConfigForm: React.FC<{
  disabled?: boolean;
}> = ({ disabled }) => {
  const roleService = useRoleService();

  const initialValues = useMemo(
    () => data2FormValue(roleService.role || {}),
    [roleService],
  );

  const handleFormValuesChange = (form: Form) => {
    if (disabled) {
      return;
    }
    const v = form.values;
    roleService.debounceSave(formValue2Data(v));
  };

  return (
    <div>
      <LazyFormCore
        schema={schema}
        components={{
          SuggestionList,
          RoleSuggestion,
          RoleVoices,
          RoleDefaultInput,
          TextToVoice,
          RoleBackground,
          RoleNameInput,
          RoleAvatarUpload,
        }}
        disabled={disabled}
        initialValues={initialValues}
        onFormValuesChange={handleFormValuesChange}
      />
    </div>
  );
};
