import React from 'react';

import { I18n } from '@coze-arch/i18n';

import styles from './index.module.less';

export function AuditErrorMessage({
  link = '/docs/guides/content_principles',
}: {
  link?: string;
}) {
  return (
    <div className={styles['error-message']}>
      {I18n.t('audit_unsuccess_general_type', {
        link: (
          <a
            rel="noreferrer noopener"
            href={link}
            target="_blank"
            className={styles.link}
          >
            {I18n.t('audit_unsuccess_general_type_url')}
          </a>
        ),
      })}
    </div>
  );
}
