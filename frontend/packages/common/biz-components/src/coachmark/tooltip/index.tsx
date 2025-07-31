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

import { type TooltipRenderProps, type StepMerged } from 'react-joyride';
import { type FC, type MouseEvent, useCallback } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

import { Container } from '../container';

import s from './index.module.less';

export interface IExtraAction {
  content: string;
  onClick: (step: StepMerged) => void;
}

export const Tooltip: FC<
  TooltipRenderProps & {
    showProgress?: boolean;
    extraAction?: IExtraAction;
    onClose?: () => void;
  }
> = props => {
  const {
    index,
    isLastStep,
    primaryProps,
    skipProps,
    closeProps,
    step,
    showProgress,
    size,
    extraAction,
    onClose,
  } = props;

  const handleClose = useCallback(
    (e: MouseEvent<HTMLElement, globalThis.MouseEvent>) => {
      onClose?.();
      closeProps.onClick(e);
    },
    [closeProps, onClose],
  );

  return (
    <div className={s.tooltip} data-testid="coachmark_tooltip">
      <Container>
        {step.content}
        <Container>
          <div className={s['tooltip-footer']}>
            <div className={s['action-btn-index']}>
              {showProgress ? `${index + 1}/${size}` : ''}
            </div>
            <div className={s['action-btn']}>
              {isLastStep ? (
                extraAction ? (
                  <>
                    <Button
                      size="default"
                      color="secondary"
                      {...closeProps}
                      onClick={handleClose}
                      data-testid="coachmark_tooltip_got_it"
                    >
                      {I18n.t('upgrade_guide_got_it')}
                    </Button>
                    <Button
                      size="default"
                      color="highlight"
                      onClick={() => {
                        extraAction.onClick(step);
                        onClose?.();
                      }}
                    >
                      {extraAction.content}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="default"
                    color="highlight"
                    {...closeProps}
                    onClick={handleClose}
                    data-testid="coachmark_tooltip_got_it"
                  >
                    {I18n.t('upgrade_guide_got_it')}
                  </Button>
                )
              ) : (
                <>
                  <Button
                    size="default"
                    color={'secondary'}
                    {...skipProps}
                    onClick={handleClose}
                    data-testid="coachmark_tooltip_got_it"
                  >
                    {I18n.t('upgrade_guide_got_it')}
                  </Button>
                  <Button
                    size="default"
                    color={'highlight'}
                    onClick={e => {
                      step.data?.nextAction?.();
                      primaryProps.onClick(e);
                    }}
                  >
                    {I18n.t('upgrade_guide_next')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Container>
      </Container>
    </div>
  );
};
