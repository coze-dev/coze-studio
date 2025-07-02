import styles from './message-loading.module.less';

export const MessageLoading = () => (
  <div className={styles['loading-container']}>
    <div className={styles.loading} />
  </div>
);
