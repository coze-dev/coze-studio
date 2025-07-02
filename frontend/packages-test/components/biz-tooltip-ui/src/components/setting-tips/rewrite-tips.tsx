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
