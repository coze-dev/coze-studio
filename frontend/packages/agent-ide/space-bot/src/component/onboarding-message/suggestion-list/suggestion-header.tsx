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

import React, { type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Switch } from '@coze-arch/coze-design';
import { SuggestedQuestionsShowMode } from '@coze-arch/bot-api/developer_api';

import s from '../index.module.less';
import { ToolTipNode } from '../common-component';
import SugLayoutLimit from '../assets/sug_layout_limit.png';
import SugLayoutFull from '../assets/sug_layout_full.png';
import { type SuggestionListContext } from './index';

export interface SuggestionHeaderProps {
  context: SuggestionListContext;
  onSwitchShowMode?: (mode: SuggestedQuestionsShowMode) => void;
}
export const SuggestionHeader: FC<SuggestionHeaderProps> = props => {
  const {
    isReadonly,
    initValues: {
      suggested_questions_show_mode = SuggestedQuestionsShowMode.Random,
    },
  } = props.context.props;

  return (
    <div
      className={classNames(
        s['onboarding-message-title'],
        s['mt-20'],
        'flex justify-between',
      )}
    >
      <div className="flex items-center">
        <span className="coz-fg-secondary">
          {I18n.t('bot_edit_opening_question_title')}
        </span>
      </div>
      <div className="flex items-center mr-[1px]">
        <ToolTipNode
          content={<SwitchLayoutTipContent />}
          tipContentClassName="!max-w-[320px]"
          className={classNames('flex items-center')}
        >
          <span className="ml-[2px] cursor-pointer coz-fg-secondary">
            {I18n.t('opening_showall')}
          </span>
        </ToolTipNode>
        <Switch
          data-testid="bot-editor.suggestion-list-setting.switch-show-all-suggestions"
          disabled={isReadonly}
          defaultChecked={
            suggested_questions_show_mode === SuggestedQuestionsShowMode.All
          }
          size="mini"
          className="ml-[5px]"
          onChange={(checked: boolean) => {
            props.onSwitchShowMode?.(
              checked
                ? SuggestedQuestionsShowMode.All
                : SuggestedQuestionsShowMode.Random,
            );
          }}
        ></Switch>
      </div>
    </div>
  );
};

const SwitchLayoutTipContent = () => (
  <div>
    <div className="coz-fg-plus text-base	font-medium">
      {I18n.t('opening_showall')}
    </div>
    <div className="coz-fg-secondary text-xs pb-3">
      {I18n.t('opening_showall_explain')}
    </div>
    <div className="coz-fg-secondary text-xs pb-[6px]">
      {I18n.t('opening_showall_explain_demo_on')}
    </div>
    <img height="112px" width="288px" src={SugLayoutLimit} />
    <div className="coz-fg-secondary text-xs pb-[6px]">
      {I18n.t('opening_showall_explain_demo_off')}
    </div>
    <img height="112px" width="288px" src={SugLayoutFull} />
  </div>
);
