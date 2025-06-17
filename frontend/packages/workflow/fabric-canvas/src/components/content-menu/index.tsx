import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Menu } from '@coze-arch/coze-design';

import { PopInScreen } from '../pop-in-screen';
import { CopyMode } from '../../typings';

interface IProps {
  left?: number;
  top?: number;
  offsetY?: number;
  offsetX?: number;
  cancelMenu?: () => void;
  hasActiveObject?: boolean;
  copy?: (mode: CopyMode) => void;
  paste?: (options: { mode?: CopyMode }) => void;
  disabledPaste?: boolean;
  moveToFront?: () => void;
  moveToBackend?: () => void;
  moveToFrontOne?: () => void;
  moveToBackendOne?: () => void;
  isActiveObjectsInBack?: boolean;
  isActiveObjectsInFront?: boolean;
  limitRect?: {
    width?: number;
    height?: number;
  };
}

export const ContentMenu: FC<IProps> = props => {
  const {
    left = 0,
    top = 0,
    offsetX = 0,
    offsetY = 0,
    cancelMenu,
    hasActiveObject,
    copy,
    paste,
    moveToFront,
    moveToBackend,
    moveToFrontOne,
    moveToBackendOne,
    isActiveObjectsInBack,
    isActiveObjectsInFront,
    disabledPaste,
    limitRect,
  } = props;
  const isMac = navigator.platform.toLowerCase().includes('mac');
  const ctrlKey = isMac ? '⌘' : 'ctrl';
  const menuItems = [
    {
      label: I18n.t('imageflow_canvas_copy'),
      suffix: `${ctrlKey} + C`,
      onClick: () => {
        copy?.(CopyMode.CtrlCV);
      },
    },
    {
      label: I18n.t('imageflow_canvas_paste'),
      suffix: `${ctrlKey} + V`,
      onClick: () => {
        paste?.({ mode: CopyMode.CtrlCV });
      },
      disabled: disabledPaste,
      alwaysShow: true,
    },
    {
      label: I18n.t('Copy'),
      suffix: `${ctrlKey} + D`,
      onClick: async () => {
        await copy?.(CopyMode.CtrlD);
        paste?.({ mode: CopyMode.CtrlD });
      },
    },
    {
      key: 'divider1',
      divider: true,
    },
    {
      label: I18n.t('imageflow_canvas_top_1'),
      suffix: ']',
      onClick: () => {
        moveToFrontOne?.();
      },
      disabled: isActiveObjectsInFront,
    },
    {
      label: I18n.t('imageflow_canvas_down_1'),
      suffix: '[',
      onClick: () => {
        moveToBackendOne?.();
      },
      disabled: isActiveObjectsInBack,
    },
    {
      label: I18n.t('imageflow_canvas_to_front'),
      suffix: `${ctrlKey} + ]`,
      onClick: () => {
        moveToFront?.();
      },
      disabled: isActiveObjectsInFront,
    },
    {
      label: I18n.t('imageflow_canvas_to_back'),
      suffix: `${ctrlKey} + [`,
      onClick: () => {
        moveToBackend?.();
      },
      disabled: isActiveObjectsInBack,
    },
  ].filter(item => item.alwaysShow ?? hasActiveObject);
  return (
    <PopInScreen
      position="bottom-right"
      left={left + offsetX}
      top={top + offsetY}
      zIndex={1001}
      onClick={e => {
        e.stopPropagation();
        cancelMenu?.();
      }}
      limitRect={limitRect}
    >
      <Menu.SubMenu mode="menu">
        {menuItems.map(d => {
          if (d.divider) {
            return <Menu.Divider key={d.key} />;
          }
          return (
            <Menu.Item
              itemKey={d.label}
              onClick={d.onClick}
              disabled={d.disabled}
            >
              <div className="w-[120px] flex justify-between">
                <div>{d.label}</div>
                <div className="coz-fg-secondary">{d.suffix}</div>
              </div>
            </Menu.Item>
          );
        })}
      </Menu.SubMenu>
    </PopInScreen>
  );
};
