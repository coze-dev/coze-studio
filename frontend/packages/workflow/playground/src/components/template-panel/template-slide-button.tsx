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

import classNames from 'classnames';
import {
  IconCozArrowLeft,
  IconCozArrowRight,
} from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { TemplateCompZIndex } from './constants';

import styles from './index.module.less';

export const TemplateSlideButton = ({
  onTemplateScorll,
  templateVisible,
  slidable,
  direction,
}) => {
  const IconComp = direction === 'right' ? IconCozArrowRight : IconCozArrowLeft;

  if (!slidable) {
    return null;
  }

  return (
    <div
      className={classNames(
        'absolute',
        direction === 'right' ? 'right-[8px]' : 'left-[8px]',
        styles['slide-button'],
        {
          [styles['slide-button-visible']]: templateVisible,
        },
      )}
      style={{
        zIndex: TemplateCompZIndex.TemplateSildeButton,
      }}
    >
      <IconButton
        icon={<IconComp className="text-xxl coz-fg-hglt-white" />}
        style={{
          maxWidth: '24px',
          minWidth: '24px',
          height: '24px',
          cursor: slidable ? 'pointer' : 'not-allowed',
          background: 'white',
          boxShadow:
            '0px 4px 24px 0px rgba(0, 0, 0, 0.25), 0px 12px 48px 0px rgba(0, 0, 0, 0.20)',
        }}
        onClick={() => onTemplateScorll(direction)}
      />
    </div>
  );
};
