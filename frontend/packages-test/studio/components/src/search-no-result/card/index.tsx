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
