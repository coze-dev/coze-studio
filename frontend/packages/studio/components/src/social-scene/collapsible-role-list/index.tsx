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

import { Tag, Tooltip } from '@coze-arch/coze-design';
import { Boundary, OverflowList } from '@blueprintjs/core';

import s from './index.module.less';

interface CollapsibleRoleListProps {
  list: Role[];
}

interface Role {
  name: string;
  count: number;
}

export function CollapsibleRoleList({ list }: CollapsibleRoleListProps) {
  return (
    <OverflowList
      collapseFrom={Boundary.END}
      items={list || []}
      className="w-full mt-[12px] gap-[4px]"
      overflowRenderer={items => {
        if (!items.length) {
          return null;
        }
        return (
          <Tooltip
            position="top"
            content={
              <div className="flex items-center gap-[4px] flex-wrap overflow-hidden">
                {items.map((item, idx) => (
                  <RoleTag key={idx} item={item} />
                ))}
              </div>
            }
          >
            <Tag color="primary" prefixIcon={null} className={s['role-tag']}>
              +{items.length}
            </Tag>
          </Tooltip>
        );
      }}
      visibleItemRenderer={(item, idx) => <RoleTag key={idx} item={item} />}
    />
  );
}

function RoleTag({ item }: { item: Role }) {
  return (
    <div>
      <Tag color="primary" prefixIcon={null} className={s['role-tag']}>
        {item.name}
        {item.count > 1 ? `x${item.count}` : ''}
      </Tag>
    </div>
  );
}
