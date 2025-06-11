import { type FC } from 'react';

import { JsonViewer } from '@coze-common/json-viewer';

import styles from './chat-history.module.less';

interface Props {
  data: object | null;
}

export const ChatHistory: FC<Props> = ({ data }) => (
  <JsonViewer data={data} className={styles['json-viewer']} />
);
