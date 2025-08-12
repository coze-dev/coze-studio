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

import React, { useRef, useEffect } from 'react';

import { debounce } from 'lodash-es';
import {
  BATCH_SIZE_MAX,
  BATCH_SIZE_MIN,
  BATCH_CONCURRENT_SIZE_MIN,
  BATCH_CONCURRENT_SIZE_MAX,
} from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';
import { type FormState } from '@coze-arch/bot-semi/Form';
import { Form as BotSemiForm, Typography } from '@coze-arch/bot-semi';
import { InputSlider } from '@coze-agent-ide/space-bot/input-slider';

import { LabelWithTooltip } from '@/form-extensions/components/label-with-tooltip';

import s from './batch-setting-form.module.less';

interface BatchSetting {
  batchSize: number;
  concurrentSize: number;
}

export type BatchSettingOnChangeValue = FormState<BatchSetting>;

export interface BatchSettingProps {
  readonly?: boolean;
  value: BatchSetting;
  onChange: (value: FormState<BatchSetting>) => void;
}

const DELAY_TIME = 10;

export const BatchSettingForm = ({
  value,
  readonly = false,
  onChange,
}: BatchSettingProps) => {
  const formRef = useRef<BotSemiForm>(null);
  const isSemiFormDestroyed = useRef(false);
  const debouncedChange = debounce((v: BatchSettingOnChangeValue) => {
    // The semi form will trigger an additional onChange when it is destroyed, thereby polluting the data. This situation is avoided here
    if (isSemiFormDestroyed.current) {
      return;
    }
    onChange(v);
  }, DELAY_TIME);

  const commonSliderProps = {
    useRcSlider: true,
    fieldClassName: s['form-field'],
    disabled: readonly,
    decimalPlaces: 0,
    step: 1,
  };

  useEffect(
    () => () => {
      isSemiFormDestroyed.current = true;
    },
    [],
  );

  return (
    // Prevent trigger node selection
    <div
      className={s['workflow-batch-setting-panel']}
      onClick={e => e.stopPropagation()}
    >
      <Typography.Title className={s['workflow-batch-setting-panel-title']}>
        {I18n.t('workflow_batch_settings')}
      </Typography.Title>

      <BotSemiForm<BatchSetting>
        ref={formRef}
        initValues={value}
        onChange={debouncedChange}
      >
        <InputSlider
          {...commonSliderProps}
          field="batchSize"
          label={
            <LabelWithTooltip
              label={I18n.t('workflow_maximum_run_count')}
              tooltip={I18n.t('workflow_maximum_run_count_tips')}
            ></LabelWithTooltip>
          }
          max={BATCH_SIZE_MAX}
          min={BATCH_SIZE_MIN}
        />

        <InputSlider
          {...commonSliderProps}
          field="concurrentSize"
          label={
            <LabelWithTooltip
              label={I18n.t('workflow_maximum_parallel_runs')}
              tooltip={I18n.t('workflow_maximum_parallel_runs_tips')}
            ></LabelWithTooltip>
          }
          max={BATCH_CONCURRENT_SIZE_MAX}
          min={BATCH_CONCURRENT_SIZE_MIN}
        />
      </BotSemiForm>
    </div>
  );
};
