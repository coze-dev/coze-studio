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

/* eslint-disable @coze-arch/no-deep-relative-import */
import { VariableE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton, Switch } from '@coze-arch/coze-design';

import { ObjectLikeTypes } from '@/store/variable-groups/types';
import { useVariableContext } from '@/context';

import AddOperation from '../add-operation';
import { type TreeNodeCustomData } from '../../../../type';

interface ParamOperatorProps {
  data: TreeNodeCustomData;
  level: number;
  onAppend: () => void;
  onDelete: () => void;
  onEnabledChange: (enabled: boolean) => void;
  hasObjectLike?: boolean;
  needRenderAppendChild?: boolean;
  readonly?: boolean;
}

export default function ParamOperator({
  level,
  data,
  hasObjectLike,
  readonly,
  needRenderAppendChild = true,
  onEnabledChange,
  onDelete,
  onAppend,
}: ParamOperatorProps) {
  const isLimited = level >= 3;

  // Is it possible to add children?
  const canAddChild = !readonly && ObjectLikeTypes.includes(data.type);
  // Is the child button available?
  const enableAddChildButton =
    !readonly && hasObjectLike && canAddChild && needRenderAppendChild;
  // Whether to display the delete button
  const showDeleteButton = !readonly;
  // Whether to display the on/off button
  const enabledSwitch = level === 0;

  const { variablePageCanEdit } = useVariableContext();

  return (
    <div className="flex items-center h-[24px] flex-shrink-0 justify-start gap-x-2 w-[130px]">
      {/* Open/close */}
      <Switch
        size="small"
        disabled={!variablePageCanEdit || !enabledSwitch}
        checked={data.enabled}
        onChange={onEnabledChange}
      />
      {/* Add child item */}
      {needRenderAppendChild ? (
        <div className="flex items-center justify-center">
          <Tooltip
            content={I18n.t('workflow_detail_node_output_add_subitem')}
            theme="dark"
          >
            <div>
              <AddOperation
                color="secondary"
                disabled={isLimited || !enableAddChildButton}
                className="cursor-pointer"
                onClick={onAppend}
                subitem={true}
              />
            </div>
          </Tooltip>
        </div>
      ) : null}
      {/* delete */}
      <IconButton
        data-testid={VariableE2e.VariableTreeDeleteBtn}
        color="secondary"
        onClick={onDelete}
        disabled={!showDeleteButton}
        icon={<IconCozTrashCan />}
      />
    </div>
  );
}
