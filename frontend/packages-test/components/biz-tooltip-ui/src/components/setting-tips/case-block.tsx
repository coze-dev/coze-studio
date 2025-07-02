import React from 'react';

import s from './index.module.less';

export const CaseBlock: React.FC<{
  label: string;
  content: React.ReactNode;
}> = ({ label, content }) => (
  <div role="article" className="flex flex-col gap-[4px]">
    <div className={s['case-block-label']}>{label}</div>
    <div className="flex">{content}</div>
  </div>
);
