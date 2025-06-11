import { type ReactNode } from 'react';

export enum ProcessStatus {
  Processing, // 处理中
  Complete, // 处理完成
  Failed, // 处理失败
}
export interface ProcessProgressItemProps {
  className?: string | undefined;
  style?: React.CSSProperties;
  mainText: string;
  subText: ReactNode;
  percent: number;
  status: ProcessStatus;
  actions?: Array<ReactNode>;
  avatar: ReactNode;
  tipText?: ReactNode;
  percentFormat?: ReactNode;
}
