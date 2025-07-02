import { Skeleton } from '@coze-arch/bot-semi';

import styles from './index.module.less';

export const NodePlaceholder = () => (
  <Skeleton
    loading={true}
    active={true}
    placeholder={
      <div className={styles.placeholder}>
        <div className={styles.hd}>
          <div className={styles.line}>
            <Skeleton.Avatar shape="square" className={styles.avatar} />
            <Skeleton.Title className={styles.title} />
          </div>
          <Skeleton.Paragraph rows={2} />
        </div>
        <Skeleton.Paragraph className={styles.paragraph} rows={2} />
        <Skeleton.Paragraph className={styles.paragraph} rows={2} />
        <div
          className={`${styles.paragraph} ${styles['last-paragraph']}`}
        ></div>
      </div>
    }
  />
);
