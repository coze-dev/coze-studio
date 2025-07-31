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

import cls from 'classnames';
import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import { I18n } from '@coze-arch/i18n';
import { UIButton } from '@coze-arch/bot-semi';

import style from '../index.module.less';
import { type UIMode } from '../../shortcut-bar/types';
import ArrowUpIcon from '../../assets/load-more-arrow-up.svg';
import ArrowDownIcon from '../../assets/load-more-arrow-down.svg';

interface TemplateShortcutProps {
  shortcuts: ShortCutCommand[];
  uiMode: UIMode;
  onOpen: () => void;
  onClose: () => void;
  isLoadMoreActive: boolean;
  getPopupContainer: () => HTMLElement | null;
}

export const LoadMore: FC<TemplateShortcutProps> = props => {
  const { onOpen, uiMode, onClose, isLoadMoreActive } = props;

  const onShortcutClick = () => {
    isLoadMoreActive ? onClose?.() : onOpen?.();
  };

  return (
    <div
      className={cls(style['load-more-shortcut-wrapper'], {
        [style['shortcut-white'] || '']: uiMode === 'white',
        [style['shortcut-blur'] || '']: uiMode === 'blur',
      })}
    >
      <UIButton
        data-testid="chat-area.shortcut.load-more-button"
        className={cls(style['load-more-button'], style['shortcut-button'], {
          '!coz-mg-primary-pressed': isLoadMoreActive && uiMode === 'white',
        })}
        onClick={onShortcutClick}
      >
        <span className="mr-1">{I18n.t('More')}</span>
        {isLoadMoreActive ? (
          <img className="arraw-icon" src={ArrowUpIcon} alt="up" />
        ) : (
          <img className="arraw-icon" src={ArrowDownIcon} alt="down" />
        )}
      </UIButton>
    </div>
  );
};
