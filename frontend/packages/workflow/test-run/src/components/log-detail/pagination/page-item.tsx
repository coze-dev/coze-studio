import { useCallback, useMemo } from 'react';

import { isNumber } from 'lodash-es';
import cls from 'classnames';
import { type NodeResult } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { IconCozWarningCircleFill } from '@coze/coze-design/icons';
import { Tooltip } from '@coze/coze-design';

import styles from './page-item.module.less';

interface PageItemProps {
  data: NodeResult | null;
  idx: number;
  paging: number;
  onChange: (v: number) => void;
}

type Nilable<T> = T | undefined | null;

export function checkHasError(item: Nilable<NodeResult>) {
  return Boolean(item?.errorInfo) && item?.errorLevel === 'Error';
}

export function checkHasWarning(item: Nilable<NodeResult>) {
  return Boolean(item?.errorInfo) && item?.errorLevel !== 'Error';
}

const PageItemEmpty: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Tooltip
    content={I18n.t('workflow_detail_testrun_panel_batch_naviagte_empty')}
  >
    <div className={cls(styles['page-item'], styles['page-item-empty'])}>
      {children}
    </div>
  </Tooltip>
);

export const PageItem: React.FC<PageItemProps> = ({
  data,
  idx,
  paging,
  onChange,
}) => {
  const isError = useMemo(() => checkHasError(data), [data]);
  const isWarning = useMemo(() => checkHasWarning(data), [data]);

  const page = useMemo(() => {
    const temp = data?.index;
    if (isNumber(temp)) {
      return temp;
    }
    return idx;
  }, [data, idx]);

  const echoPage = useMemo(() => page + 1, [page]);

  const handleChange = useCallback(() => {
    onChange(page);
  }, [page, onChange]);

  if (!data) {
    return <PageItemEmpty key={echoPage}>{echoPage}</PageItemEmpty>;
  }

  return (
    <div
      key={echoPage}
      className={cls(styles['page-item'], {
        [styles.error]: isError,
        [styles.warning]: isWarning,
        [styles.active]: page === paging,
      })}
      onClick={handleChange}
    >
      {echoPage}
      {isError || isWarning ? (
        <IconCozWarningCircleFill className={styles.icon} />
      ) : null}
    </div>
  );
};
