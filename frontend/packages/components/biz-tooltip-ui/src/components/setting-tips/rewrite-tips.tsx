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

import React, { type ReactNode } from 'react';

import { I18n } from '@coze-arch/i18n';

import { CaseBlock } from './case-block';

import s from './index.module.less';

const TipContent: React.FC<{ description: ReactNode }> = ({ description }) => (
  <div className={s['rewrite-block-content']}>{description}</div>
);

export const RewriteTips: React.FC = () => {
  const caseList = [
    {
      labelKey: 'kl_write_035',
      contentKey: 'kl_write_036',
    },
    {
      labelKey: 'kl_write_037',
      contentKey: 'kl_write_038',
    },
    {
      labelKey: 'kl_write_039',
      contentKey: 'kl_write_040',
    },
  ] as const;

  return (
    <div className="flex flex-col gap-[8px]">
      <div className={s['tips-headline']}>{I18n.t('kl_write_034')}</div>
      {caseList.map(({ labelKey, contentKey }) => (
        <CaseBlock
          key={labelKey}
          label={I18n.t(labelKey)}
          content={<TipContent description={I18n.t(contentKey)} />}
        />
      ))}
    </div>
  );
};
