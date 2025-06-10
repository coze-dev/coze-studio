import type {
  MessageOperateType,
  MessageBizType,
} from '@coze-arch/bot-api/workflow_api';

export interface WsMessageProps {
  resId: string;
  extra: any;
  /**
   * 其他窗口执行保存传入的版本号
   */
  saveVersion?: string;
  operateType: MessageOperateType;
  bizType: MessageBizType;
}
