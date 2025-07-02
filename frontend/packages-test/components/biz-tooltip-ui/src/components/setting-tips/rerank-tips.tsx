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
