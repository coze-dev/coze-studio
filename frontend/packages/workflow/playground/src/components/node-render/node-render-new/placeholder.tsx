import { Skeleton } from '@coze-arch/bot-semi';

import styles from './placeholder.module.less';

export function Placeholder() {
  return (
    <Skeleton
      className={styles.skeleton}
      loading={true}
      active={true}
      placeholder={
        <div className={styles.placeholder}>
          <div className={styles.hd}>
            <Skeleton.Avatar shape="square" className={styles.avatar} />
            <Skeleton.Title style={{ width: 141 }} />
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-row items-center gap-2.5">
              <Skeleton.Title style={{ width: 85 }} />
              <Skeleton.Title style={{ width: 241 }} />
            </div>
            <Skeleton.Title style={{ width: 220 }} />
          </div>
        </div>
      }
    />
  );
}
