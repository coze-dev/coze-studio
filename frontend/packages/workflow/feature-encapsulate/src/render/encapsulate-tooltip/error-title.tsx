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

import { type FC } from 'react';

import classNames from 'classnames';
import { Typography } from '@coze-arch/coze-design';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  usePlayground,
  useService,
  WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';

import { type EncapsulateValidateError } from '../../validate';

import styles from './index.module.less';

interface Props {
  error: EncapsulateValidateError;
}

export const ErrorTitle: FC<Props> = ({ error }) => {
  const selectServices = useService<WorkflowSelectService>(
    WorkflowSelectService,
  );

  const playground = usePlayground();

  if (!error?.sourceName && !error.sourceIcon) {
    return <div></div>;
  }

  const scrollToNode = async (nodeId: string) => {
    let success = false;
    const node = playground.entityManager.getEntityById<FlowNodeEntity>(nodeId);

    if (node) {
      await selectServices.selectNodeAndScrollToView(node, true);
      success = true;
    }
    return success;
  };

  return (
    <div
      className="flex items-center gap-1 cursor-pointer max-w-[120px]"
      onClick={() => {
        if (error.source) {
          scrollToNode(error.source);
        }
      }}
    >
      {error.sourceIcon ? (
        <img
          width={18}
          height={18}
          src={error.sourceIcon}
          className="w-4.5 h-4.5 rounded-[4px]"
        />
      ) : null}
      {error.sourceName ? (
        <Typography.Paragraph
          className={classNames(
            'font-medium coz-fg-primary',
            styles['error-name'],
          )}
          ellipsis={{
            rows: 1,
            showTooltip: {
              type: 'tooltip',
              opts: {
                style: {
                  width: '100%',
                  wordBreak: 'break-word',
                },
              },
            },
          }}
        >
          {error.sourceName}
        </Typography.Paragraph>
      ) : null}
    </div>
  );
};
