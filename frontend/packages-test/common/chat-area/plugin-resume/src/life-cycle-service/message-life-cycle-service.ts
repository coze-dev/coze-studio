import {
  isRequireInfoInterruptMessage,
  WriteableMessageLifeCycleService,
  type OnBeforeDistributeMessageIntoMemberSetContent,
} from '@coze-common/chat-area';

export class ResumeMessageLifeCycleService extends WriteableMessageLifeCycleService<unknown> {
  onBeforeDistributeMessageIntoMemberSet(
    ctx: OnBeforeDistributeMessageIntoMemberSetContent,
  ): OnBeforeDistributeMessageIntoMemberSetContent {
    const { message } = ctx;

    if (isRequireInfoInterruptMessage(message)) {
      return { ...ctx, memberSetType: 'llm' };
    }

    return ctx;
  }
}
