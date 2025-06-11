import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozImage } from '@coze/coze-design/icons';
import { Menu, MenuSubMenu } from '@coze/coze-design';

import { CustomUpload, handleCustomUploadRequest } from './custom-upload';

interface UseEditorContextMenuParams {
  insertImg: (data: { url?: string; tosKey?: string }) => void;
}
export function useEditorContextMenu(params: UseEditorContextMenuParams): {
  popoverNode: React.ReactNode;
  onContainerScroll: () => void;
  onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => void;
} {
  const { insertImg } = params;
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  return {
    popoverNode: (
      <Menu
        visible={visible}
        onVisibleChange={setVisible}
        // clickToHide
        onClickOutSide={() => setVisible(false)}
        trigger="custom"
        position="bottomLeft"
        render={
          <MenuSubMenu mode="menu">
            <CustomUpload
              customRequest={object => {
                handleCustomUploadRequest({
                  object,
                  options: {
                    onFinally: () => {
                      setVisible(false);
                    },
                    onFinish: data => {
                      insertImg(data);
                    },
                  },
                });
              }}
            >
              <Menu.Item isMenu icon={<IconCozImage className="text-14px" />}>
                {I18n.t('knowledge_insert_img_002')}
              </Menu.Item>
            </CustomUpload>
          </MenuSubMenu>
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
    onContextMenu: e => {
      e.preventDefault();

      setPosition({ left: e.pageX, top: e.pageY });
      setVisible(true);
    },
  };
}
