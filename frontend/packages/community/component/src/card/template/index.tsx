import { type FC, useState } from 'react';

import cls from 'classnames';
import { explore } from '@coze-studio/api-schema';
import { useSpaceList } from '@coze-foundation/space-store';
import { I18n } from '@coze-arch/i18n';
import { Image, Input, Modal, Space, Toast } from '@coze-arch/coze-design';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';

import { cozeBaseUrl } from '@/const/url';

import { type CardInfoProps } from '../type';
import { CardTag } from '../components/tag';
import { CardInfo } from '../components/info';
import { CardContainer, CardSkeletonContainer } from '../components/container';
import { CardButton } from '../components/button';

type ProductInfo = explore.ProductInfo;
import styles from './index.module.less';

export type TemplateCardProps = ProductInfo;

const PATH_MAP: Partial<
  Record<explore.product_common.ProductEntityType, string>
> = {
  [ProductEntityType.BotTemplate]: 'agent',
  [ProductEntityType.WorkflowTemplateV2]: 'workflow',
  [ProductEntityType.ImageflowTemplateV2]: 'workflow',
  [ProductEntityType.ProjectTemplate]: 'project',
};

export const TemplateCard: FC<TemplateCardProps> = props => {
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
        <TempCardBody
          {...{
            title: props.meta_info?.name,
            description: props.meta_info?.description,
            userInfo: props.meta_info?.user_info,
            entityType: props.meta_info.entity_type,
            imgSrc: props.meta_info.covers?.[0].url,
          }}
        />
        <Space className={styles['btn-container']}>
          <CardButton
            onClick={() => {
              setVisible(true);
            }}
          >
            {I18n.t('copy')}
          </CardButton>
          <CardButton
            onClick={() => {
              const pathPrefix = PATH_MAP[props.meta_info.entity_type] || '';
              const pathSuffix = [
                ProductEntityType.WorkflowTemplateV2,
                ProductEntityType.ImageflowTemplateV2,
              ].includes(props.meta_info.entity_type)
                ? `?entity_type=${props.meta_info.entity_type}`
                : '';
              window.open(
                `${cozeBaseUrl}/template/${pathPrefix}/${props.meta_info.id}${pathSuffix}`,
              );
            }}
          >
            {I18n.t('plugin_store_view_details')}
          </CardButton>
        </Space>
      </div>
      {visible ? (
        <DuplicateModal
          productId={props.meta_info.id}
          entityType={props.meta_info.entity_type}
          defaultTitle={`${props.meta_info?.name}(${I18n.t('duplicate_rename_copy')})`}
          hide={() => setVisible(false)}
        />
      ) : null}
    </CardContainer>
  );
};

const DuplicateModal: FC<{
  defaultTitle: string;
  productId: string;
  entityType: explore.product_common.ProductEntityType;
  hide: () => void;
}> = ({ defaultTitle, hide, productId, entityType }) => {
  const [title, setTitle] = useState(defaultTitle);
  const { spaces } = useSpaceList();
  const spaceId = spaces?.[0]?.id;
  console.log('title', title, spaces);
  return (
    <Modal
      type="modal"
      title={I18n.t('creat_project_use_template')}
      visible={true}
      onOk={async () => {
        try {
          await explore.PublicDuplicateProduct({
            product_id: productId,
            entity_type: entityType,
            space_id: spaceId,
            name: defaultTitle,
          });
          Toast.success(I18n.t('copy_success'));
          hide();
        } catch (err) {
          console.error('PublicDuplicateProduct', err);
          Toast.error(I18n.t('copy_failed'));
        }
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
  CardInfoProps & {
    entityType?: explore.product_common.ProductEntityType | ProductEntityType;
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
