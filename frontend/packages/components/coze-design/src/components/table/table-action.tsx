import { type FC, useState } from 'react';

import { Space } from '@douyinfe/semi-ui';

import { cn } from '@/utils/cn';
import { useCDLocale } from '@/locales';
import { Modal } from '@/components/modal';
import { Menu } from '@/components/menu';
import { IconCozMore } from '@/components/icon';
import { IconButton } from '@/components/button';

import { type TableActionProps } from './table-types';

export const TableAction: FC<TableActionProps> = props => {
  const { i18n } = useCDLocale();
  const { editProps, deleteProps, copyProps } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const handle = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };

  const toggleModal = () => setModalVisible(!modalVisible);

  const renderDeleteModal = (deleteDesc?: string) => (
    <Modal
      maskClosable={false}
      centered={true}
      visible={modalVisible}
      title={i18n.t('delete_title')}
      onOk={() => {
        deleteProps.handler?.();
        toggleModal();
      }}
      onCancel={toggleModal}
      closeOnEsc={true}
      cancelText={i18n.t('cancel')}
      okText={i18n.t('confirm')}
      okButtonColor="red"
    >
      {deleteDesc ?? i18n.t('delete_desc')}
    </Modal>
  );

  return (
    <div className="flex justify-end coz-table-action" onClick={handle}>
      {!deleteProps.hide &&
        !deleteProps.disableConfirm &&
        renderDeleteModal(deleteProps.deleteDesc)}
      <Menu
        className="min-w-[96px] mt-2px mb-2px"
        trigger="hover"
        stopPropagation={true}
        position="bottomRight"
        render={
          <Menu.SubMenu mode="menu">
            {props?.actionList?.map(item => {
              if ('customRender' in item) {
                return item.customRender;
              }
              if (item.hide) {
                return null;
              }
              return (
                <Menu.Item
                  key={item.actionKey}
                  onClick={item?.handler}
                  disabled={item?.disabled}
                  data-testid={`ui.table-action.${item.actionKey}`}
                >
                  <Space spacing={12}>
                    {item.actionText ?? '-'}
                    {item.extActionDom ? item.extActionDom : null}
                  </Space>
                </Menu.Item>
              );
            })}
            {copyProps && !copyProps.hide ? (
              <Menu.Item
                onClick={copyProps?.handler}
                disabled={copyProps?.disabled}
                data-testid="ui.table-action.copy"
              >
                {i18n.t('Copy')}
              </Menu.Item>
            ) : null}
            {editProps && !editProps.hide ? (
              <Menu.Item
                onClick={editProps?.handler}
                disabled={deleteProps.disabled}
                data-testid="ui.table-action.edit"
              >
                {i18n.t('Edit')}
              </Menu.Item>
            ) : null}
            {!deleteProps.hide && (
              <Menu.Item
                onClick={(value, event) => {
                  event.stopPropagation();
                  if (deleteProps.disableConfirm) {
                    deleteProps.handler?.();
                  } else {
                    setModalVisible(!modalVisible);
                  }
                }}
                disabled={deleteProps.disabled}
                data-testid="ui.table-action.delete"
              >
                <span
                  className={cn({
                    'coz-fg-hglt-red': !deleteProps.disabled,
                    'coz-fg-hglt-red-dim': deleteProps.disabled,
                  })}
                >
                  {i18n.t('Delete')}
                </span>
              </Menu.Item>
            )}
          </Menu.SubMenu>
        }
      >
        <IconButton color="secondary" iconSize="small" icon={<IconCozMore />} />
      </Menu>
    </div>
  );
};

TableAction.displayName = 'TableAction';
