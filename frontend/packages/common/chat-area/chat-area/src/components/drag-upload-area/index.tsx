import classNames from 'classnames';
import { IllustrationNoContent } from '@douyinfe/semi-illustrations';

import { usePreference } from '../../context/preference';
import { useDragUploadContext } from '../../context/drag-upload';

import styles from './index.module.less';

const UploadIllustrationContent = () => (
  <div className={styles['upload-illustration-content']}>
    <IllustrationNoContent className={styles.illustration} />
    <div className={styles.title}>Upload the file</div>
    <div className={styles.description}>
      Drop files here to add to the conversation
    </div>
  </div>
);

export const DragUploadArea = () => {
  const { enableDragUpload } = usePreference();

  const { isDragOver } = useDragUploadContext();

  if (!enableDragUpload) {
    return null;
  }

  return (
    <div className={classNames(styles.area, isDragOver && styles['drag-over'])}>
      {isDragOver ? <UploadIllustrationContent /> : null}
    </div>
  );
};
