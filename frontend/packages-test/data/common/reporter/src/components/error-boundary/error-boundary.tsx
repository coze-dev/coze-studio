import React, { type FC, type PropsWithChildren } from 'react';

import { logger, ErrorBoundary } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IllustrationNoAccess } from '@douyinfe/semi-illustrations';

import { type DataNamespace } from '../../constants';

import s from './index.module.less';

interface FallbackComponentProps {
  namespace: DataNamespace;
}
export const ErrorFallbackComponent: FC<FallbackComponentProps> = ({
  namespace,
}) => (
  <div className={s.wrapper}>
    <div className={s.content}>
      <IllustrationNoAccess width={140} height={140} />
      <div className={s.title}>
        {I18n.t('data_error_title', { module: namespace })}
      </div>
      <div className={s.paragraph}>{I18n.t('data_error_msg')}</div>
    </div>
  </div>
);

export interface DataErrorBoundaryProps {
  namespace: DataNamespace;
}
export const DataErrorBoundary: FC<
  PropsWithChildren<DataErrorBoundaryProps>
> = ({ children, namespace }) => (
  <ErrorBoundary
    onError={error => {
      logger.persist.error({
        eventName: `${namespace}_error_boundary`,
        error,
      });
    }}
    errorBoundaryName={`${namespace}-error-boundary`}
    FallbackComponent={() => <ErrorFallbackComponent namespace={namespace} />}
  >
    {children}
  </ErrorBoundary>
);
