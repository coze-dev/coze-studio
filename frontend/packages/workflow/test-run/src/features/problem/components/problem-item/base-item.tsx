import type React from 'react';
import { useCallback } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Popover, Typography, Tag } from '@coze/coze-design';

import { type ProblemItem } from '../../types';

import styles from './base-item.module.less';

type BaseItemWrapProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const BaseItemWrap: React.FC<
  React.PropsWithChildren<BaseItemWrapProps>
> = ({ className, ...props }) => (
  <div className={cls(styles['base-item-wrap'], className)} {...props}></div>
);

interface BaseItemProps {
  problem: ProblemItem;
  title: string;
  icon: React.ReactNode;
  popover?: React.ReactNode;
  onClick: (p: ProblemItem) => void;
}

const { Text } = Typography;

export const BaseItem: React.FC<BaseItemProps> = ({
  problem,
  title,
  icon,
  popover,
  onClick,
}) => {
  const { errorInfo, errorLevel } = problem;

  const handleClick = useCallback(() => {
    onClick(problem);
  }, [problem, onClick]);

  return (
    <BaseItemWrap className={styles['base-item']} onClick={handleClick}>
      <div className={styles['item-icon']}>{icon}</div>
      <div className={styles['item-content']}>
        <div className={styles['item-title']}>
          <Text weight={500}>{title}</Text>
          {errorLevel === 'warning' && (
            <Tag color="primary">{I18n.t('workflow_exception_ignore_tag')}</Tag>
          )}
          {popover ? (
            <Popover content={popover} position="top">
              <IconCozInfoCircle className={styles['item-popover']} />
            </Popover>
          ) : null}
        </div>
        <div className={styles['item-info']}>
          <Text
            size="small"
            className={
              errorLevel === 'error' ? 'coz-fg-hglt-red' : 'coz-fg-hglt-yellow'
            }
          >
            {errorInfo}
          </Text>
        </div>
      </div>
    </BaseItemWrap>
  );
};

export const TextItem: React.FC<{
  problem: ProblemItem;
  onClick: (p: ProblemItem) => void;
}> = ({ problem, onClick }) => {
  const { errorInfo, errorLevel } = problem;

  const handleClick = useCallback(() => {
    onClick(problem);
  }, [problem, onClick]);

  return (
    <BaseItemWrap className={styles['text-item']} onClick={handleClick}>
      <Text
        size="small"
        className={
          errorLevel === 'error' ? 'coz-fg-hglt-red' : 'coz-fg-hglt-yellow'
        }
      >
        {errorInfo}
      </Text>
    </BaseItemWrap>
  );
};
