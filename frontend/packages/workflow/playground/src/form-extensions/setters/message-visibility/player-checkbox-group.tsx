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

import { type FC, useEffect } from 'react';

import { intersectionWith } from 'lodash-es';
import { concatTestId } from '@coze-workflow/base';
import { RoleType } from '@coze-arch/idl/social_api';
import { I18n } from '@coze-arch/i18n';
import { CheckboxGroup, Checkbox } from '@coze-arch/coze-design';

import { VariableTypeTag } from '../../components/variable-type-tag';
import { useGetSceneFlowRoleList } from '../../../hooks/use-get-scene-flow-params';
import { type RoleSetting } from './types';
import { useMessageVisibilityContext } from './context';

interface PlayerCheckboxGroupProps {
  value?: RoleSetting[];
  onChange: (userSettings: RoleSetting[]) => void;
}

export const PlayerCheckboxGroup: FC<PlayerCheckboxGroupProps> = props => {
  const { value, onChange } = props;
  const { testId } = useMessageVisibilityContext();
  const { data: roleList = [] } = useGetSceneFlowRoleList();

  useEffect(() => {
    // If there is biz_role_id, the description is role information
    const roleValues = value?.filter(item => item.biz_role_id);

    if (!roleValues?.length) {
      const hostUserSetting = roleList.find(
        item => item.role_type === RoleType.Host,
      );
      if (hostUserSetting) {
        onChange?.([hostUserSetting]);
      }
    }
  }, []);

  const handleOnChange = checkedValue => {
    const result = intersectionWith(
      roleList,
      checkedValue,
      (a: RoleSetting, b) => !!b && a.biz_role_id === b,
    );
    onChange?.(result);
  };

  let placeholderIdx = 1;

  return (
    <CheckboxGroup
      value={(value || []).map(item => item.biz_role_id)}
      className="mt-4"
      style={{ width: '100%' }}
      onChange={handleOnChange}
    >
      {roleList?.map(item => (
        <Checkbox
          value={item.biz_role_id}
          disabled={item.role_type === RoleType.Host}
          data-testid={concatTestId(testId, 'role', item.biz_role_id)}
        >
          {item.role}
          <VariableTypeTag>
            {item.nickname ||
              `${I18n.t(
                'scene_edit_roles_list_nickname_empty_seat',
                {},
                '空位',
              )}${placeholderIdx++}`}
          </VariableTypeTag>
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};
