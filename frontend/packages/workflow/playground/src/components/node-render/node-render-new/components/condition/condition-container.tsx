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

import { ConditionLogic } from '@coze-workflow/base';

import { LogicDisplay } from './logic-display';

interface Condition {
  left?: React.ReactNode;
  operator?: React.ReactNode;
  right?: React.ReactNode;
}

interface ConditionContainerProps {
  conditions: Condition[];
  logic?: ConditionLogic;
}

export const ConditionContainer: FC<ConditionContainerProps> = props => {
  const { conditions = [], logic = ConditionLogic.AND } = props;

  return (
    <div className="coz-stroke-plus coz-bg-max border border-solid py-1 rounded-mini text-xs coz-fg-primary min-h-[32px]">
      {conditions.map((condition, index) => (
        <>
          <div className="flex items-center px-1">
            <div className="flex-1 min-w-0 overflow-hidden">
              {condition.left}
            </div>
            <div className="flex items-center flex-grow-0 flex-shrink-0 basis-[0] px-2 ">
              {condition.operator}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              {condition.right}
            </div>
          </div>
          {index < conditions.length - 1 ? (
            <LogicDisplay logic={logic} />
          ) : null}
        </>
      ))}
    </div>
  );
};
