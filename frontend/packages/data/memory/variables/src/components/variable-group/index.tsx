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

import { type VariableGroup as VariableGroupType } from '@/store';

import { type TreeNodeCustomData } from '../variable-tree/type';
import { VariableTree } from '../variable-tree';
import { VariableGroupParamHeader, useGetHideKeys } from './group-header';
import { GroupCollapsibleWrapper } from './group-collapsible-wraper';

interface IVariableGroupProps {
  groupInfo: VariableGroupType;
  readonly?: boolean;
  validateExistKeyword?: boolean;
  onVariableChange: (changeValue: TreeNodeCustomData) => void;
}

export const VariableGroup = (props: IVariableGroupProps) => {
  const {
    groupInfo,
    readonly = true,
    validateExistKeyword = false,
    onVariableChange,
  } = props;
  const hideHeaderKeys = useGetHideKeys(groupInfo);
  return (
    <>
      <GroupCollapsibleWrapper groupInfo={groupInfo}>
        <VariableGroupParamHeader hideHeaderKeys={hideHeaderKeys} />
        <div className="pl-6">
          {groupInfo.subGroupList?.map(subGroup => (
            <GroupCollapsibleWrapper groupInfo={subGroup} level={1}>
              <VariableTree
                hideHeaderKeys={hideHeaderKeys}
                groupId={groupInfo.groupId}
                value={subGroup.varInfoList ?? []}
                readonly={readonly}
                channel={subGroup.channel}
                validateExistKeyword={validateExistKeyword}
                onChange={onVariableChange}
              />
            </GroupCollapsibleWrapper>
          ))}
        </div>
        <div className="flex flex-col pl-6">
          <VariableTree
            hideHeaderKeys={hideHeaderKeys}
            groupId={groupInfo.groupId}
            value={groupInfo.varInfoList ?? []}
            readonly={readonly}
            channel={groupInfo.channel}
            validateExistKeyword={validateExistKeyword}
            onChange={onVariableChange}
          />
        </div>
      </GroupCollapsibleWrapper>
    </>
  );
};
