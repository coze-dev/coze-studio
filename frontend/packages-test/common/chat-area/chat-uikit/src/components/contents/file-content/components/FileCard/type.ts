import {
  type IFileAttributeKeys,
  type IFileCardTooltipsCopyWritingConfig,
  type IFileInfo,
  type Layout,
} from '@coze-common/chat-uikit-shared';

export interface IFileCardProps {
  file: IFileInfo;
  /**
   * 用于识别成功 / 失败状态的key
   */
  attributeKeys: IFileAttributeKeys;
  /**
   * 文案配置
   */
  tooltipsCopywriting?: IFileCardTooltipsCopyWritingConfig;
  /**
   * 是否只读
   */
  readonly?: boolean;
  /**
   * 取消上传事件回调
   */
  onCancel: () => void;
  /**
   * 重试上传事件回调
   */
  onRetry: () => void;
  /**
   * 拷贝url事件回调
   */
  onCopy: () => void;
  className?: string;
  layout: Layout;
  showBackground: boolean;
}
