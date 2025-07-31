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

import { type TreeNodeCustomData } from '../../type';
import { ObjectLikeTypes } from '../../constants';
import { useOutputTreeContext } from '../../../../context';
import AddOperation from '../../../../../../../ui-components/add-operation';

import styles from './index.module.less';

interface ParamOperatorProps {
  data: TreeNodeCustomData;
  level: number;
  onAppend: () => void;
  onDelete: () => void;
  onEnabledChange: (enabled: boolean) => void;
  disableDelete: boolean;
  hasObjectLike?: boolean;
  needRenderAppendChild?: boolean;
  disabled?: boolean;
}

export default function ParamOperator({
  data,
  level,
  onDelete,
  onAppend,
  disableDelete,
  hasObjectLike,
  disabled,
  needRenderAppendChild = true,
}: ParamOperatorProps) {
  const { isPreset } = data;
  const { testId } = useOutputTreeContext();
  const { concatTestId } = useNodeTestId();
  const isLimited = level >= 3;
  // Whether to display the button for adding a child item
  const _needRenderAppendChild =
    ObjectLikeTypes.includes(data.type) && !isLimited;

  return (
    <div className={classNames(styles.container, 'gap-1')}>
      {hasObjectLike ? (
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
      {isPreset && !disabled ? (
        <div className="w-6" />
      ) : (
        <IconButton
          className="!block"
          size="small"
          color="secondary"
          disabled={disableDelete}
          data-testid={concatTestId(testId ?? '', data.field, 'remove-param')}
          onClick={() => {
            if (disableDelete) {
              return;
            }
            onDelete();
          }}
          icon={<IconCozMinus className="text-sm" />}
        />
      )}
    </div>
  );
}
