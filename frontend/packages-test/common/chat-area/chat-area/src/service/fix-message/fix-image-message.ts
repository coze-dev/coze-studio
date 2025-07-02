import { cloneDeep } from 'lodash-es';
import { type ContentType, type MessageContent } from '@coze-common/chat-core';
import { type Reporter } from '@coze-arch/logger';

import { getIsImageMessage } from '../../utils/message';
import { type Message } from '../../store/types';
import { ReportErrorEventNames } from '../../report-events/report-event-names';

// 下游依赖存在问题，本次不好修改，因此配合服务端在前端对结构体进行抹平
export const fixImageMessage = (message: Message, reporter: Reporter) => {
  if (!getIsImageMessage(message)) {
    return message;
  }

  const fixedMessage = cloneDeep(message);

  // 虽然我不理解为什么线上会产生这种异常数据，还是进行兜底处理了
  if (!fixedMessage.content_obj) {
    fixedMessage.content_obj = {
      image_list: [
        {
          key: '',
          image_ori: { url: '', width: 0, height: 0 },
          image_thumb: { url: '', width: 0, height: 0 },
        },
      ],
    };
  }

  if (!('image_list' in fixedMessage.content_obj)) {
    fixedMessage.content_obj = {
      image_list:
        fixedMessage.content_obj as MessageContent<ContentType.Image>['image_list'],
    };
  }

  if (fixedMessage.content_obj.image_list?.length) {
    fixedMessage.content_obj.image_list?.forEach(img => {
      if (!img.image_ori) {
        img.image_ori = {
          url: '',
          width: 0,
          height: 0,
        };
        reporter.errorEvent({
          eventName:
            ReportErrorEventNames.OldChatMessageImageStructNotImageObjectError,
          error: new Error('image_ori not exist'),
        });
      }

      if (!img.image_thumb) {
        img.image_thumb = {
          url: '',
          width: 0,
          height: 0,
        };
        reporter.errorEvent({
          eventName:
            ReportErrorEventNames.OldChatMessageImageStructNotImageObjectError,
          error: new Error('image_thumb not exist'),
        });
      }

      if (!img.image_thumb.url) {
        img.image_thumb.url = img.image_ori.url;
      }
    });
  }

  fixedMessage.content = JSON.stringify(fixedMessage.content_obj);

  return fixedMessage;
};
