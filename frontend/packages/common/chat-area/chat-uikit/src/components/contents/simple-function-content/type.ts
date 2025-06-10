import {
  type ISimpleFunctionContentCopywriting,
  type IBaseContentProps,
} from '@coze-common/chat-uikit-shared';

export type ISimpleFunctionMessageContentProps = IBaseContentProps & {
  copywriting?: ISimpleFunctionContentCopywriting;
};
