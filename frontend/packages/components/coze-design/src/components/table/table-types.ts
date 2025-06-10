import type {
  Dispatch,
  HTMLAttributes,
  ReactNode,
  SetStateAction,
} from 'react';

import type { ReactElement } from 'react-markdown/lib/react-markdown';
import { type TooltipProps } from '@douyinfe/semi-ui/lib/es/tooltip';
import { type TableProps as SemiTableProps } from '@douyinfe/semi-ui/lib/es/table';
import { type PopconfirmProps } from '@douyinfe/semi-ui/lib/es/popconfirm';

export interface IndicatorState {
  done: boolean;
}
export interface IndicatorProps {
  onIntersecting: (isIntersecting: boolean) => void;
  loadingText: string;
  loadedText: string;
}

export interface IndicatorMethods {
  changeState: Dispatch<SetStateAction<IndicatorState>>;
}
export interface TableProps extends HTMLAttributes<HTMLDivElement> {
  offsetY?: number;
  scrollX?: number;
  tableProps?: SemiTableProps;
  bySearch?: boolean;
  empty?: ReactElement;
  enableLoad?: boolean;
  loadMode?: 'page' | 'cursor'; // 分页、游标
  hasMore?: boolean;
  total?: number;
  onLoad?: () => void;
  wrapperClassName?: string;
  useHoverStyle?: boolean;
  strictDataSourceProp?: boolean; // 严格遵循传递的 dataSource
  /**
   * rowSelection样式为：checkbox和序号相互切换。
   * 注意：获取值变化属性等仍然需要通过tableProps.rowSelection传参，注意不要覆盖ableProps.rowSelection.renderCell
   * */
  indexRowSelection?: boolean;
  /** 空状态也展示表格 */
  showTableWhenEmpty?: boolean;
}

export interface TableMethods {
  reset: () => void;
  getTableList: <T>() => Array<T>;
}

export interface TableMetaProps {
  className?: string;
  avatarClassName?: string;
  icon_url?: string; //icon图标
  icon?: ReactElement; //支持传入icon标签
  name?: string; //名称
  nameIcon?: ReactElement; // name旁边的展示icon
  description?: string; //描述
  suffix?: ReactElement; //额外元素
}

export interface ActionItemProps {
  /** 操作标识 */
  actionKey: string;
  /** 操作名称 */
  actionText: string;
  extActionDom?: ReactElement;
  disabled?: boolean;
  handler?: (() => void) | (() => Promise<void>);
  /** @deprecated */
  handleClick?: () => void;
  hide?: boolean;
  /** @deprecated */
  popconfirm?: PopconfirmProps;
  /** @deprecated */
  tooltip?: TooltipProps;
}

export interface TableActionProps {
  editProps?: Omit<ActionItemProps, 'actionKey' | 'actionText'>;
  copyProps?: Omit<ActionItemProps, 'actionKey' | 'actionText'>;
  deleteProps: Omit<ActionItemProps, 'actionKey' | 'actionText'> & {
    /** 配置删除弹窗描述 */
    deleteDesc?: string;
    /** 禁用二次确认 */
    disableConfirm?: boolean;
  };
  enableProps?: Omit<ActionItemProps, 'actionKey' | 'actionText'>;
  /** 扩展操作 */
  actionList?: (ActionItemProps | { customRender: ReactNode })[];
}
