import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/bot-semi';

import styles from './index.module.less';

export const CollaborationCloseIntroduction = () => (
  <div className={styles['intro-container']}>
    <Typography.Paragraph className={styles.text}>
      {I18n.t('wmv_publish_multibranch_IntroTitle')}
    </Typography.Paragraph>

    <Typography.Paragraph strong className={styles['intro-title']}>
      {I18n.t('devops_publish_multibranch_PersionDrafts')}
    </Typography.Paragraph>
    <Typography.Paragraph>
      {I18n.t('devops_publish_multibranch_PersionDraftsInfo')}
    </Typography.Paragraph>

    <Typography.Paragraph strong className={styles['intro-title']}>
      {I18n.t('devops_publish_multibranch_VersionControl')}
    </Typography.Paragraph>
    <Typography.Paragraph>
      {I18n.t('devops_publish_multibranch_VersionControlInfo')}
    </Typography.Paragraph>

    <Typography.Paragraph strong className={styles['intro-title']}>
      {I18n.t('devops_publish_multibranch_RetrieveAndMerge')}
    </Typography.Paragraph>
    <Typography.Paragraph>
      {I18n.t('devops_publish_multibranch_RetrieveAndMergeInfo')}
    </Typography.Paragraph>
  </div>
);
