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

import {
  useEffect,
  useState,
  type PropsWithChildren,
  type FC,
  type MouseEventHandler,
  useMemo,
} from 'react';

import { groupBy } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { EncapsulateRenderService } from '../encapsulate-render-service';
import { type EncapsulateValidateError } from '../../validate';
import { ErrorTitle } from './error-title';

import styles from './index.module.less';

interface Props {
  errors: EncapsulateValidateError[];
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  getPopupContainer?: () => HTMLElement;
}

const ErrorMessage: FC<{
  error: EncapsulateValidateError;
}> = ({ error }) => (
  <div className="flex-1 coz-fg-primary font-normal">{error.message}</div>
);

export const EncapsulateTooltip: FC<PropsWithChildren<Props>> = ({
  errors = [],
  onMouseEnter,
  onMouseLeave,
  children,
}) => {
  const encapsulateRenderService = useService<EncapsulateRenderService>(
    EncapsulateRenderService,
  );

  const [tooltipVisible, setTooltipVisible] = useState(
    encapsulateRenderService.tooltipVisible,
  );

  useEffect(() => {
    const disposable =
      encapsulateRenderService.onTooltipVisibleChange(setTooltipVisible);

    return () => {
      disposable.dispose();
    };
  }, []);

  const hasError = errors.length;

  const groupErrors = useMemo(
    () =>
      groupBy(
        errors.filter(e => e.message),
        error =>
          error?.sourceName || error?.sourceIcon
            ? 'withSource'
            : 'withoutSource',
      ),
    [errors],
  );

  return (
    <Tooltip
      trigger="custom"
      position="bottom"
      visible={tooltipVisible && errors?.length > 0}
      showArrow={false}
      onClickOutSide={() => {
        setTooltipVisible(false);
      }}
      className="p-0 max-w-[460px] overflow-hidden"
      content={
        hasError ? (
          <div
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={styles.tooltip}
          >
            <div className="coz-fg-plus font-medium text-[16px]">
              {I18n.t(
                'workflow_encapsulate_button_unable',
                undefined,
                '无法封装工作流',
              )}
            </div>

            {/* No wrong sources */}
            {(groupErrors.withoutSource || []).map((error, index) => (
              <div key={index} className="flex mt-3 gap-4 items-start">
                <ErrorMessage error={error} />
              </div>
            ))}

            {/* There is a wrong source */}
            {(groupErrors.withSource || []).length ? (
              <div className={styles.errors}>
                {(groupErrors.withSource || []).map(error => (
                  <>
                    <ErrorTitle error={error} />
                    <ErrorMessage error={error} />
                  </>
                ))}
              </div>
            ) : null}
          </div>
        ) : null
      }
    >
      {children}
    </Tooltip>
  );
};
