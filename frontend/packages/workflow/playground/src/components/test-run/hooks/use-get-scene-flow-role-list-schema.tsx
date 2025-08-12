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

import { ViewVariableType } from '@coze-workflow/base/types';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';

import { useGetSceneFlowRoleList } from '../../../hooks/use-get-scene-flow-params';

export const useGetSceneFlowRoleListSchema = () => {
  const { isLoading, data: roleList } = useGetSceneFlowRoleList();

  if (isLoading) {
    return () => null;
  } else {
    return () => ({
      title: (
        <span className="text-sm">
          {I18n.t('scene_workflow_testrun_title', {}, '关联场景信息')}
        </span>
      ),
      name: 'role_information',
      type: 'FormArray',
      originType: ViewVariableType.ArrayObject,
      initialValue: roleList?.map(item => ({
        role: item.role,
        nickname: item.nickname,
        origin_nickname: item.nickname,
        player_description: item.description,
      })),
      component: {
        // Array rendering setter
        type: 'Array',
      },
      decorator: {
        type: 'FormItem',
        props: {
          tooltip: I18n.t(
            'scene_workflow_testrun_title_tooltip',
            {},
            '场景角色中存在空位，请先为这些角色预设一个Nickname。Nickname仅支持英文、数字、下划线，且不能重复',
          ),
        },
      },
      items: {
        title:
          '{{$record.role}} ' +
          `({{$record.origin_nickname || '${I18n.t(
            'scene_edit_roles_list_nickname_empty_seat',
            {},
            '空位',
          )}'}}` +
          `)${I18n.t(
            'scene_workflow_testrun_nickname_nickname',
            {},
            'Nickname',
          )}`,
        type: 'FormString',
        name: 'nickname',
        required: true,
        disabled: '{{!!$record.origin_nickname}}',
        validator: [
          {
            validator: value => {
              const reg = /^[a-zA-Z0-9_-]{1,64}$/;
              return reg.test(value)
                ? true
                : I18n.t(
                    'scene_workflow_testrun_nickname_error',
                    {},
                    'Nickname 仅支持英文、数字、下划线',
                  );
            },
            triggerType: 'onBlur',
          },
          {
            validator: (value, rule, context) => {
              try {
                const parentValue = context.graph.parent.value;
                const currentIndex = context.indexes?.[0];
                if (!currentIndex) {
                  return true;
                }

                const hasRepeatedValue = parentValue
                  .filter((item, index) => index !== currentIndex)
                  .find(item => item.nickname === value);
                if (hasRepeatedValue) {
                  return I18n.t(
                    'scene_workflow_testrun_nickname_error',
                    {},
                    '昵称仅支持英文、数字、下划线，且不能重复',
                  );
                } else {
                  return true;
                }
              } catch (e) {
                reporter.errorEvent({
                  eventName: 'workflow_testrun_nickname_repeat_validate_err',
                  namespace: 'workflow',
                  error: e,
                });
                return true;
              }
            },
            triggerType: 'onBlur',
          },
        ],
        decorator: {
          type: 'FormItem',
        },
        component: {
          type: 'Input',
          props: {
            placeholder: I18n.t(
              'scene_workflow_testrun_nickname_placeholder',
              {},
              '请输入昵称',
            ),
          },
        },
      },
    });
  }
};
