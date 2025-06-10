import { type FC, useState } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Image, Input, Modal, Space, Toast } from '@coze/coze-design';
import { type ProductEntityType } from '@coze-arch/bot-api/product_api';

import { type CardInfoProps } from '../type';
import { CardTag } from '../components/tag';
import { CardInfo } from '../components/info';
import { CardContainer, CardSkeletonContainer } from '../components/container';
import { CardButton } from '../components/button';

import styles from './index.module.less';

export type TemplateCardProps = CardInfoProps & {
  entityType?: ProductEntityType;
};
export const TemplateCard = props => {
  const [visible, setVisible] = useState(false);
  return (
    <CardContainer
      className={styles.template}
      shadowMode="default"
      onClick={() => {
        console.log('Template Click Card');
      }}
    >
      <div className={styles['template-wrapper']}>
        <TempCardBody {...props} />
        <Space className={styles['btn-container']}>
          <CardButton
            onClick={() => {
              setVisible(true);
            }}
          >
            {I18n.t('copy')}
          </CardButton>
          <CardButton>查看详情</CardButton>
        </Space>
      </div>
      {visible ? (
        <DuplicateModal
          defaultTitle={`${props.title}(${I18n.t('duplicate_rename_copy')})`}
          hide={() => setVisible(false)}
        />
      ) : null}
    </CardContainer>
  );
};

const DuplicateModal: FC<{
  defaultTitle: string;
  hide: () => void;
}> = ({ defaultTitle, hide }) => {
  const [title, setTitle] = useState(defaultTitle);
  console.log('title', title);
  return (
    <Modal
      type="modal"
      title={I18n.t('creat_project_use_template')}
      visible={true}
      onOk={() => {
        Toast.success(I18n.t('copy_success'));
        //Toast.success(I18n.t('copy_failed'));
        hide();
      }}
      onCancel={hide}
      cancelText={I18n.t('common_button_cacel')}
      okText={I18n.t('common_button_confirm')}
    >
      <Space vertical spacing={4} className="w-full">
        <Space className="w-full">
          <span className="coz-fg-primary font-medium leading-[20px]">
            {I18n.t('creat_project_project_name')}
          </span>
          <span className="coz-fg-hglt-red">*</span>
        </Space>
        <Input
          className="w-full"
          placeholder=""
          defaultValue={defaultTitle}
          onChange={value => {
            setTitle(value);
          }}
        />
      </Space>
    </Modal>
  );
};

export const TemplateCardSkeleton = () => (
  <CardSkeletonContainer className={cls('h-[278px]', styles.template)} />
);

export const TempCardBody: FC<
  TemplateCardProps & {
    renderImageBottomSlot?: () => React.ReactNode;
    renderDescBottomSlot?: () => React.ReactNode;
  }
> = ({
  title,
  imgSrc,
  description,
  entityType,
  userInfo,
  renderImageBottomSlot,
  renderDescBottomSlot,
}) => (
  <div>
    <div className="relative w-full h-[140px] rounded-[8px] overflow-hidden">
      <Image
        preview={false}
        src={imgSrc}
        className="w-full h-full"
        imgCls="w-full h-full object-cover object-center"
      />
      {renderImageBottomSlot?.()}
    </div>
    <CardInfo
      {...{
        title,
        description,
        userInfo,
        renderCardTag: () =>
          entityType ? <CardTag type={entityType} /> : null,
        descClassName: styles.description,
        renderDescBottomSlot,
      }}
    />
  </div>
);
