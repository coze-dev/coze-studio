import { type FC, type PropsWithChildren } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';
import { UIModal, type UIModalProps } from '@coze-arch/bot-semi';
import { IconMinimizeOutlined } from '@coze-arch/bot-icons';

import styles from '../index.module.less';

export const EditorExpendModal: FC<PropsWithChildren<UIModalProps>> = ({
  children,
  ...modalProps
}) => (
  <UIModal
    {...modalProps}
    title={
      <div className="coz-fg-plus text-[20px] leading-8">
        {I18n.t('bot_edit_opening_text_title')}
      </div>
    }
    centered
    style={{
      maxWidth: 640,
      aspectRatio: 640 / 668,
      height: 'auto',
    }}
    bodyStyle={{
      padding: 0,
    }}
    className={styles['editor-expend-modal']}
    footer={null}
    type="base-composition"
    closeIcon={
      <Tooltip content={I18n.t('collapse')}>
        <IconMinimizeOutlined
          size="extra-large"
          className="cursor-pointer"
          onClick={modalProps.onCancel}
        />
      </Tooltip>
    }
  >
    {children}
  </UIModal>
);
