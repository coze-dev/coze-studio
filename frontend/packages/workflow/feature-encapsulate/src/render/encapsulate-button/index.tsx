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

import { type MouseEvent, useRef, type MouseEventHandler } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { useValidate } from '../hooks/use-validate';
import { useEncapsulate } from '../hooks/use-encapsulate';
import { EncapsulateTooltip } from '../encapsulate-tooltip';
import { EncapsulateRenderService } from '../encapsulate-render-service';
import { ENCAPSULATE_SHORTCUTS } from '../constants';

import styles from './styles.module.less';

const HOVER_DELAY = 200;

/**
 * encapsulation button
 */
export function EncapsulateButton() {
  const encapsulateRenderService = useService<EncapsulateRenderService>(
    EncapsulateRenderService,
  );
  const { handleEncapsulate, loading } = useEncapsulate();

  const { validating, errors } = useValidate();

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (validating) {
      return;
    }
    handleEncapsulate();
  };

  const hasError = errors && errors.length > 0;
  const disabled = !!(!errors || hasError);
  const timeOutRef = useRef<number>();
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> = () => {
    if (!timeOutRef.current) {
      timeOutRef.current = window.setTimeout(() => {
        encapsulateRenderService.hideTooltip();
        timeOutRef.current = undefined;
      }, HOVER_DELAY);
    }
  };

  const handleMouseEnter: MouseEventHandler<HTMLDivElement> = () => {
    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
      timeOutRef.current = undefined;
    }
    encapsulateRenderService.showTooltip();
  };

  return (
    <EncapsulateTooltip
      errors={errors}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="pointer-events-auto"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={ref}
      >
        <Button
          loading={loading}
          disabled={disabled}
          className={styles.button}
          color="highlight"
          onMouseDown={handleClick}
        >
          <span>
            {I18n.t('workflow_encapsulate_button', undefined, '封装工作流')}
          </span>
          <span className={styles.shortcut}>
            {ENCAPSULATE_SHORTCUTS.encapsulate}
          </span>
        </Button>
      </div>
    </EncapsulateTooltip>
  );
}
