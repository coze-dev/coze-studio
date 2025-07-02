import { useState, type CSSProperties } from 'react';

import classNames from 'classnames';
import { Typography, UIIconButton } from '@coze-arch/bot-semi';
import { IconDeleteOutline, IconEdit } from '@coze-arch/bot-icons';
import { IconEyeOpened, IconUploadError } from '@douyinfe/semi-icons';

import { MockSetStatus } from '../../interface';

import styles from './option-item.module.less';

export interface MockSetItemProps {
  name: string;
  onDelete?: () => void;
  onView?: () => void;
  status?: MockSetStatus;
  creatorName?: string;
  viewOnly?: boolean;
  disableCreator?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const MockSetItem = ({
  name,
  onDelete,
  onView,
  status = MockSetStatus.Normal,
  creatorName,
  viewOnly,
  disableCreator,
  className,
  style,
}: MockSetItemProps) => {
  const [isHover, setIsHover] = useState(false);
  const renderExtraInfo = () => {
    if (isHover) {
      return (
        <div
          className={styles['operation-icon']}
          onClick={e => e.stopPropagation()}
        >
          {viewOnly ? (
            <UIIconButton onClick={onView} icon={<IconEyeOpened />} />
          ) : (
            <>
              <UIIconButton
                onClick={onView}
                icon={<IconEdit />}
                wrapperClass="mr-[4px]"
              />
              <UIIconButton onClick={onDelete} icon={<IconDeleteOutline />} />
            </>
          )}
        </div>
      );
    }
    return disableCreator ? null : (
      <Typography.Text
        ellipsis={{
          showTooltip: {
            opts: { content: creatorName },
          },
        }}
        className={styles['creator-name']}
      >
        {creatorName}
      </Typography.Text>
    );
  };
  return (
    <div
      className={classNames(styles['mock-select-item'], className)}
      style={style}
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => setIsHover(false)}
    >
      <span className={styles['mock-main-info']}>
        {status !== MockSetStatus.Normal && (
          <IconUploadError className={styles['status-icon']} />
        )}
        <Typography.Text ellipsis={{}} className={styles['mock-name']}>
          {name}
        </Typography.Text>
      </span>
      <div className={styles['mock-extra-info']}>{renderExtraInfo()}</div>
    </div>
  );
};
