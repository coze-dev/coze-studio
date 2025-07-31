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
import React from 'react';

import classNames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozMinus } from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton } from '@coze-arch/coze-design';

import { isObjectTreeNode } from '../../utils';
import { type TreeNodeCustomData } from '../../types';
import { useInputTreeContext } from '../../context';
import AddOperation from '../../../../../ui-components/add-operation';

import styles from './index.module.less';

interface InputOperatorProps {
  data: TreeNodeCustomData;
  level: number;
  onAppend: () => void;
  onDelete: () => void;
  hasObject?: boolean;
  needRenderAppendChild?: boolean;
  disableDelete: boolean;
}

export function InputOperator({
  data,
  level,
  onDelete,
  onAppend,
  hasObject,
  needRenderAppendChild = true,
  disableDelete,
}: InputOperatorProps) {
  const { testId } = useInputTreeContext();
  const { concatTestId } = useNodeTestId();
  const isLimited = level >= 3;
  // Whether to display the button for adding a child item
  const _needRenderAppendChild = isObjectTreeNode(data) && !isLimited;

  return (
    <div className={classNames(styles.container, 'gap-1')}>
      {hasObject ? (
        <div className={styles.add}>
          <Tooltip content={I18n.t('workflow_detail_node_output_add_subitem')}>
            <div>
              {_needRenderAppendChild && needRenderAppendChild ? (
                <AddOperation
                  data-testid={concatTestId(
                    testId ?? '',
                    data.field,
                    'add-sub-param',
                  )}
                  size="small"
                  color="secondary"
                  className="cursor-pointer"
                  onClick={onAppend}
                  subitem={true}
                />
              ) : null}
            </div>
          </Tooltip>
        </div>
      ) : null}

      <IconButton
        className="!block"
        size="small"
        color="secondary"
        data-testid={concatTestId(testId ?? '', data.field, 'remove-param')}
        onClick={() => {
          onDelete();
        }}
        disabled={disableDelete}
        icon={<IconCozMinus className="text-sm" />}
      />
    </div>
  );
}
