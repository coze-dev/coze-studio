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

import classNames from 'classnames';

export interface AnswerActionDividerProps {
  className?: string;
}

export const AnswerActionDivider: React.FC<AnswerActionDividerProps> = ({
  className,
}) => (
  <div
    className={classNames(
      'h-[12px] border-solid border-0 border-l-[1px] coz-stroke-primary mx-[8px]',
      className,
    )}
  />
);
