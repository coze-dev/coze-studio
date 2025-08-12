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

import { I18n } from '@coze-arch/i18n';
import { Select } from '@coze-arch/coze-design';

import { Logic, logicTextMap } from './constants';

import styles from './condition-item-logic.module.less';

export interface ConditionItemLogicProps {
  /**
   * And Logic Or
   */
  logic: Logic;
  /**
   * And Or change the logic
   */
  onChange: (logic: Logic) => void;
  showStroke?: boolean;
}

export const ConditionItemLogic: FC<ConditionItemLogicProps> = props => {
  const { logic, onChange, showStroke = false } = props;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative">
        {showStroke ? (
          <div className="absolute left-1/2 right-0 top-2.5 bottom-0 rounded-tl-lg border-solid border-0 border-t border-l coz-stroke-plus" />
        ) : null}
      </div>
      <Select
        className={styles['condition-logic-select']}
        placeholder={I18n.t('workflow_detail_condition_pleaseselect')}
        style={{ marginRight: 4 }}
        value={logic}
        size="small"
        optionList={[
          {
            label: logicTextMap.get(Logic.AND),
            value: Logic.AND,
          },
          {
            label: logicTextMap.get(Logic.OR),
            value: Logic.OR,
          },
        ]}
        onChange={val => onChange(val as Logic)}
      />
      <div className="flex-1 relative">
        {showStroke ? (
          <div className="absolute left-1/2 right-0 top-0 bottom-2.5 rounded-bl-lg border-solid border-0 border-b border-l coz-stroke-plus" />
        ) : null}
      </div>
    </div>
  );
};
