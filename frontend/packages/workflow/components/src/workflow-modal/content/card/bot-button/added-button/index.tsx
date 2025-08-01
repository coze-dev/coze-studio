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
import { useBoolean } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { Button, type ButtonProps } from '@coze-arch/coze-design';

import { useI18nText } from '@/workflow-modal/hooks/use-i18n-text';

import styles from './index.module.less';

type WorkflowAddedButtonProps = ButtonProps;

export const WorkflowAddedButton: FC<
  WorkflowAddedButtonProps
> = buttonProps => {
  const [isMouseIn, { setFalse, setTrue }] = useBoolean(false);

  const onMouseEnter = () => {
    setTrue();
  };
  const onMouseLeave = () => {
    setFalse();
  };
  const { i18nText, ModalI18nKey } = useI18nText();
  return (
    <Button
      {...buttonProps}
      color={isMouseIn ? 'red' : 'primary'}
      className={classNames({
        [styles.button]: true,
        [styles.moreLevel]: true,
      })}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-testid="workflow.modal.button.added"
    >
      {isMouseIn
        ? i18nText(ModalI18nKey.ListItemRemove)
        : I18n.t('workflow_add_list_added')}
    </Button>
  );
};
