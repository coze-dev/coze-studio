import { useRef, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  IconCozDocumentAddBottom,
  IconCozDocumentAddTop,
  IconCozEdit,
  IconCozTrashCan,
} from '@coze/coze-design/icons';
import { Modal, Menu } from '@coze/coze-design';

import { type TPosition } from '@/types/slice';

import style from './index.module.less';

interface Params {
  canEdit: boolean;
}
export function useContextMenu(params: Params): {
  popoverNode: React.ReactNode;
  onContainerScroll: () => void;
  onContextMenu: (
    e: React.MouseEvent<HTMLDivElement>,
    params: {
      onEdit: () => void;
      onDelete: () => void;
      onInsert: (position: TPosition) => void;
    },
  ) => void;
} {
  const { canEdit } = params;
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const onEditRef = useRef<() => void>();
  const onDeleteRef = useRef<() => void>();
  const onInsertRef = useRef<(position: TPosition) => void>();

  const handleDelete = () => {
    Modal.error({
      title: I18n.t('delete_title'),
      content: <div className="my-[16px]">{I18n.t('delete_desc')}</div>,
      okText: I18n.t('Delete'),
      cancelText: I18n.t('Cancel'),
      onOk: () => {
        onDeleteRef.current?.();
      },
    });
  };

  return {
    popoverNode: (
      <Menu
        visible={visible}
        onVisibleChange={setVisible}
        clickToHide
        onClickOutSide={() => setVisible(false)}
        trigger="custom"
        position="bottomLeft"
        className={style.menu_wrapper}
        render={
          <Menu.SubMenu className={style.menu} mode="menu">
            <Menu.Item
              disabled={!canEdit}
              icon={<IconCozEdit className="text-xxl" />}
              onClick={() => onEditRef.current?.()}
            >
              {I18n.t('Edit')}
            </Menu.Item>
            <Menu.Item
              disabled={!canEdit}
              icon={<IconCozDocumentAddTop className="text-xxl" />}
              onClick={() => onInsertRef.current?.('top')}
            >
              {I18n.t('knowledge_optimize_017')}
            </Menu.Item>
            <Menu.Item
              disabled={!canEdit}
              icon={<IconCozDocumentAddBottom className="text-xxl" />}
              onClick={() => onInsertRef.current?.('bottom')}
            >
              {I18n.t('knowledge_optimize_016')}
            </Menu.Item>
            <Menu.Item
              disabled={!canEdit}
              icon={<IconCozTrashCan className="text-xxl" />}
              onClick={handleDelete}
            >
              {I18n.t('Delete')}
            </Menu.Item>
          </Menu.SubMenu>
        }
      >
        <div
          style={{
            height: 0,
            width: 0,
            position: 'fixed',
            top: position.top,
            left: position.left,
          }}
        />
      </Menu>
    ),
    onContainerScroll: () => {
      if (visible) {
        setVisible(false);
      }
    },
    onContextMenu: (e, { onEdit, onDelete, onInsert }) => {
      e.preventDefault();

      onEditRef.current = onEdit;
      onDeleteRef.current = onDelete;
      onInsertRef.current = onInsert;

      setPosition({ left: e.pageX, top: e.pageY });
      setVisible(true);
    },
  };
}
