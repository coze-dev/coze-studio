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

import { I18n } from '@coze-arch/i18n';
import { Tag, Typography } from '@coze-arch/coze-design';

import { NodeItem, LineItem, TextItem } from '../problem-item';
import { type WorkflowProblem, type ProblemItem } from '../../types';
import { BaseGroupWrap } from './base-group-wrap';

interface MyProblemGroupProps {
  problems: WorkflowProblem;
  isMine?: boolean;
  showTitle?: boolean;
  onClick: (p: ProblemItem) => void;
}

export const MyProblemGroup: React.FC<MyProblemGroupProps> = ({
  problems,
  isMine,
  showTitle,
  onClick,
}) => {
  const { node, line } = problems.problems;
  return (
    <BaseGroupWrap
      title={
        showTitle ? (
          <>
            <Typography.Text
              strong
              fontSize="14px"
              className="coz-fg-secondary"
            >
              {problems.name}
            </Typography.Text>

            <Tag className="ml-2" size="small" color="primary">
              {isMine
                ? I18n.t('wf_problem_my_tag')
                : I18n.t('wf_problem_other_tag')}
            </Tag>
          </>
        ) : undefined
      }
    >
      {node.map(i =>
        isMine ? (
          <NodeItem problem={i} onClick={onClick} />
        ) : (
          <TextItem problem={i} onClick={onClick} />
        ),
      )}
      {line.map((i, idx) =>
        isMine ? (
          <LineItem problem={i} idx={idx} onClick={onClick} />
        ) : (
          <TextItem problem={i} onClick={onClick} />
        ),
      )}
    </BaseGroupWrap>
  );
};
