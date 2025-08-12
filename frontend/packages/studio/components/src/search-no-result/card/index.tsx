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

import React from 'react';

import classnames from 'classnames';

import { type COZTheme } from '../factory';
import { WidgetSearchNoCard } from './widget';
import { SocialSceneFlowSearchNoCard } from './social-scene-flow';
import { SocialSearchNoCard } from './social';
import { RecommendSearchNoCard } from './recommend';
import { CommonSearchNoCard } from './common';
import { BotSearchNoCard } from './bot';

import s from './index.module.less';

export interface CardProps extends COZTheme {
  type:
    | 'bot'
    | 'common'
    | 'widget'
    | 'social'
    | 'recommend'
    | 'social-scene-flow';
  position: 'top' | 'bottom' | 'center';
}

const renderSearchNoCard = (
  type: CardProps['type'],
  theme: CardProps['theme'],
) => {
  switch (type) {
    case 'bot':
      return <BotSearchNoCard theme={theme} />;
    case 'common':
      return <CommonSearchNoCard theme={theme} />;
    case 'widget':
      return <WidgetSearchNoCard theme={theme} />;
    case 'social':
      return <SocialSearchNoCard theme={theme} />;
    case 'recommend':
      return <RecommendSearchNoCard theme={theme} />;
    case 'social-scene-flow':
      return <SocialSceneFlowSearchNoCard theme={theme} />;
    default:
      return null;
  }
};

export function SearchNoCard({ type, theme, position }: CardProps) {
  return (
    <div
      className={classnames(s['search-no-card'], {
        ['items-start']: position === 'top',
        ['items-center']: position === 'center',
        ['items-end']: position === 'bottom',
      })}
    >
      <div className={s[`${type}-no-card`]}>
        {renderSearchNoCard(type, theme)}
      </div>
    </div>
  );
}
