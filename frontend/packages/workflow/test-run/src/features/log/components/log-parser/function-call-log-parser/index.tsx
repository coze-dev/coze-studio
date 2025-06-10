import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';

import { LogWrap } from '../log-wrap';
import { type FunctionCallLog } from '../../../types';
import { FunctionCallLogPanel } from './function-call-panel';

import styles from './index.module.less';

export const FunctionCallLogParser: FC<{ log: FunctionCallLog }> = ({
  log,
}) => {
  const { items } = log;

  return (
    <LogWrap
      label={I18n.t('workflow_250310_06', undefined, '技能调用')}
      source={log.data}
      copyable={false}
    >
      {items.length ? (
        <div className={styles.container}>
          {items.map(item => (
            <>
              <FunctionCallLogPanel item={item} />
            </>
          ))}
        </div>
      ) : (
        <div className="border-[1px] border-solid coz-stroke-primary h-7 rounded-[6px]"></div>
      )}
    </LogWrap>
  );
};
