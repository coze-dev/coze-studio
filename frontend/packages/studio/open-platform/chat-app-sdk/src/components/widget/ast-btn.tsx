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
import { Layout } from '@coze-studio/open-chat/types';

import { getCssVars } from '@/util/style';
import { type AstBtnProps } from '@/types/chat';
import { useGlobalStore } from '@/store/context';
import WidgetPng from '@/assets/widget.png';

import styles from './index.module.less';

export const AstBtn: FC<AstBtnProps> = ({ position = 'fixed', client }) => {
  const { chatVisible, setChatVisible, layout } = useGlobalStore(s => ({
    chatVisible: s.chatVisible,
    setChatVisible: s.setChatVisible,
    layout: s.layout,
  }));

  const { base: baseConf, asstBtn: asstBtnConf } = client?.options?.ui || {};
  const iconUrl = baseConf?.icon;
  const zIndex = baseConf?.zIndex;
  const zIndexStyle = getCssVars({ zIndex });
  if (chatVisible || !asstBtnConf?.isNeed) {
    return null;
  }

  return (
    <div
      style={{ position, ...zIndexStyle }}
      className={cls(styles['coze-ast-btn'], {
        [styles.mobile]: layout === Layout.MOBILE,
      })}
      onClick={e => {
        e.stopPropagation();
        setChatVisible(true);
      }}
    >
      <img alt="logo" src={iconUrl || WidgetPng} />
    </div>
  );
};
