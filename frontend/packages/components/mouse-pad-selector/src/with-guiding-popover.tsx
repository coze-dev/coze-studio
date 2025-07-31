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

import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button, Popover, Typography } from '@coze-arch/bot-semi';

import { PadIcon } from '../src/icons/pad';
import { MouseIcon } from '../src/icons/mouse';
import { needShowGuidingPopover, hideGuidingPopover } from './utils';

import styles from './with-guiding-popover.module.less';

export interface GuidingPopoverProps {
  buttonText: string;
  mainTitle: string;
  mouseOptionTitle: string;
  mouseOptionDesc: string;
  padOptionTitle: string;
  padOptionDesc: string;
  onGotIt: () => void;
}

const GuidingContent = (props: GuidingPopoverProps) => (
  <div className={styles['guiding-content']}>
    <div className={styles['guiding-content-title']}>
      <Typography.Text>{props.mainTitle}</Typography.Text>
    </div>

    <div className={styles['guiding-content-mouse-option']}>
      <div className={styles['guiding-content-mouse-option-icon']}>
        <MouseIcon />
      </div>
      <div>
        <Typography.Text className={styles['guiding-content-title']}>
          {props.mouseOptionTitle}
        </Typography.Text>
        <Typography.Paragraph className={styles['guiding-content-desc']}>
          {props.mouseOptionDesc}
        </Typography.Paragraph>
      </div>
    </div>

    <div className={styles['guiding-content-pad-option']}>
      <div className={styles['guiding-content-pad-option-icon']}>
        <PadIcon />
      </div>
      <div>
        <Typography.Text className={styles['guiding-content-title']}>
          {props.padOptionTitle}
        </Typography.Text>
        <Typography.Paragraph className={styles['guiding-content-desc']}>
          {props.padOptionDesc}
        </Typography.Paragraph>
      </div>
    </div>

    <div>
      <Button
        type="primary"
        theme="solid"
        className={styles['guiding-content-button']}
        onClick={props?.onGotIt}
      >
        {props.buttonText}
      </Button>
    </div>
  </div>
);

export const GuidingPopover = (
  props: React.PropsWithChildren<Partial<GuidingPopoverProps>>,
) => {
  const {
    children,
    mainTitle = I18n.t('workflow_interactive_mode_popover_title'),
    buttonText = I18n.t('guidance_got_it'),
    mouseOptionTitle = I18n.t('workflow_interactive_mode_mouse_friendly'),
    mouseOptionDesc = I18n.t('workflow_interactive_mode_mouse_friendly_desc'),
    padOptionTitle = I18n.t('workflow_interactive_mode_pad_friendly'),
    padOptionDesc = I18n.t('workflow_interactive_mode_pad_friendly_desc'),
  } = props;

  const [visible, setVisible] = useState(() => needShowGuidingPopover());
  const onButtonClick = () => setVisible(false);

  // The gotIt method is not exposed to the upper layer first, and it needs to be used later before being exposed.
  const handleGotIt = () => {
    hideGuidingPopover();
    setVisible(false);
  };

  const textProps = {
    mainTitle,
    mouseOptionTitle,
    mouseOptionDesc,
    padOptionTitle,
    padOptionDesc,
    buttonText,
  };

  return (
    <Popover
      content={<GuidingContent {...textProps} onGotIt={handleGotIt} />}
      trigger="custom"
      position="top"
      style={{ padding: 0 }}
      visible={visible}
      showArrow
      onClickOutSide={onButtonClick}
    >
      {children}
    </Popover>
  );
};
