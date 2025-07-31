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

import { useRef, type CSSProperties } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Tooltip, UIButton } from '@coze-arch/bot-semi';
import { IconEffects, IconStopOutlined } from '@coze-arch/bot-icons';
import { useFlags } from '@coze-arch/bot-flags';
import { debuggerApi } from '@coze-arch/bot-api';

import { type NodeFormSchema } from '../../types';
import { useInnerStore } from '../../store';
import { useTestsetManageStore } from '../../hooks';
import { TestsetManageEventName } from '../../events';
import { toNodeFormSchemas } from './utils';

import s from './auto-fill.module.less';

interface AutoFillButtonProps {
  className?: string;
  style?: CSSProperties;
  onAutoFill?: (schemas: NodeFormSchema[]) => void;
}

/** AI button to generate node data */
export function AutoFillButton({
  className,
  style,
  onAutoFill,
}: AutoFillButtonProps) {
  const [FLAGS] = useFlags();
  const { generating, patch } = useInnerStore();
  const abortRef = useRef<AbortController | null>(null);
  const { bizComponentSubject, bizCtx, reportEvent } = useTestsetManageStore(
    store => store,
  );
  const onClick = async () => {
    // report event
    reportEvent?.(TestsetManageEventName.AIGC_PARAMS_CLICK, {
      path: 'testset',
    });

    patch({ generating: true });
    try {
      abortRef.current = new AbortController();
      const { genCaseData } = await debuggerApi.AutoGenerateCaseData(
        { bizComponentSubject, bizCtx, count: 1 },
        { signal: abortRef.current.signal },
      );

      if (!genCaseData?.length) {
        return;
      }

      // fill form values
      const autoSchemas = toNodeFormSchemas(genCaseData[0].input);
      onAutoFill?.(autoSchemas);
    } finally {
      patch({ generating: false });
    }
  };

  const onStop = () => {
    abortRef.current?.abort();
  };

  // The community edition does not support this function for the time being
  if (!FLAGS['bot.devops.testset_auto_gen'] || !(IS_OVERSEA || IS_BOE)) {
    return null;
  }

  return (
    <div className={cls(s.wrapper, className)} style={style}>
      <Tooltip content={I18n.t('workflow_testset_stopgen')}>
        <UIButton
          icon={<IconStopOutlined />}
          className={cls(s.stop, generating || s.hidden)}
          onClick={onStop}
        />
      </Tooltip>
      <UIButton
        loading={generating}
        icon={<IconEffects />}
        className={s.generate}
        style={style}
        onClick={onClick}
      >
        {generating
          ? I18n.t('workflow_testset_generating')
          : I18n.t('workflow_testset_aigenerate')}
      </UIButton>
    </div>
  );
}
