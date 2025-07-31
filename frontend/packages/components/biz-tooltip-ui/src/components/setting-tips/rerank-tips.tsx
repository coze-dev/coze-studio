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

import { I18n } from '@coze-arch/i18n';

import { CaseBlock } from './case-block';

import s from './index.module.less';

interface TipContentProps {
  labelContentPairs: {
    label: string;
    content: string;
  }[];
}

const TipContent: React.FC<TipContentProps> = ({ labelContentPairs }) => (
  <div className={s['rerank-block-content']}>
    {labelContentPairs.map(({ label, content }, index) => (
      <div key={`${label}-${index}`} className="flex items-center">
        <div
          style={{
            minWidth: '50px',
            color: 'var(--Fg-COZ-fg-hglt, #543EF7)',
          }}
          className={s['rerank-block-content-text']}
        >
          {label}
        </div>
        <div
          style={{
            color: 'var(--Fg-COZ-fg-primary, rgba(32, 41, 65, 0.89))',
          }}
          className={s['rerank-block-content-text']}
        >
          {content}
        </div>
      </div>
    ))}
  </div>
);

export const RerankTips: React.FC = () => {
  const labelContentPairs = [
    {
      label: I18n.t('kl_write_041', { index: 'A' }),
      content: I18n.t('kl_write_042'),
    },
    {
      label: I18n.t('kl_write_041', { index: 'B' }),
      content: I18n.t('kl_write_043'),
    },
    {
      label: I18n.t('kl_write_041', { index: 'C' }),
      content: I18n.t('kl_write_044'),
    },
    {
      label: I18n.t('kl_write_041', { index: 'D' }),
      content: I18n.t('kl_write_045'),
    },
  ];

  const secLabelContentPairs = [
    {
      label: I18n.t('kl_write_041', { index: 'C' }),
      content: I18n.t('kl_write_044'),
    },
    {
      label: I18n.t('kl_write_041', { index: 'D' }),
      content: I18n.t('kl_write_045'),
    },
    {
      label: I18n.t('kl_write_041', { index: 'B' }),
      content: I18n.t('kl_write_043'),
    },
    {
      label: I18n.t('kl_write_041', { index: 'A' }),
      content: I18n.t('kl_write_042'),
    },
  ];

  return (
    <div className="flex flex-col gap-[8px]">
      <div className={s['tips-headline']}>{I18n.t('kl_write_034')}</div>
      <CaseBlock
        label={I18n.t('kl_write_046')}
        content={<TipContent labelContentPairs={labelContentPairs} />}
      />
      <CaseBlock
        label={I18n.t('kl_write_047')}
        content={<TipContent labelContentPairs={secLabelContentPairs} />}
      />
    </div>
  );
};
