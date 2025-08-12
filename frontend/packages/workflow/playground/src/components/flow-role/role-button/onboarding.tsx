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
import {
  Tooltip,
  Button,
  Typography,
  type PopoverProps,
} from '@coze-arch/coze-design';
import { localStorageService } from '@coze-foundation/local-storage';

import img from './onboarding.png';

import css from './onboarding.module.less';

const ONBOARDING_KEY = 'workflow-toolbar-role-onboarding-hidden';

const OnBoardingPopoverContent: React.FC<{
  onOk: () => void;
}> = ({ onOk }) => (
  <div className={css['popover-content']}>
    <img src={img} />
    <br />
    <Typography.Text>
      {I18n.t('workflow_role_config_onboarding')}
    </Typography.Text>
    <div className={css.btn}>
      <Button color="highlight" onClick={onOk}>
        {I18n.t('upgrade_guide_got_it')}
      </Button>
    </div>
  </div>
);

interface OnBoardingPopoverProps {
  visible: boolean;
  getPopupContainer?: PopoverProps['getPopupContainer'];
}

export const OnBoardingPopover: React.FC<
  React.PropsWithChildren<OnBoardingPopoverProps>
> = ({ visible, children, ...props }) => {
  const [localVisible, setLocalVisible] = useState(
    !localStorageService.getValue(ONBOARDING_KEY),
  );

  const innerVisible = visible && localVisible;

  const handleClose = () => {
    setLocalVisible(false);
    localStorageService.setValue(ONBOARDING_KEY, 'true');
  };

  if (!visible) {
    return children;
  }

  return (
    <Tooltip
      position="top"
      visible={innerVisible}
      showArrow
      trigger="custom"
      spacing={16}
      content={<OnBoardingPopoverContent onOk={handleClose} />}
      {...props}
    >
      {children}
    </Tooltip>
  );
};
