import { type MessageGroupMember, type MessageGroup } from '../../store/types';

export const flatMessageGroupIdList = (messageGroupList: MessageGroup[]) => {
  const messageIdListArray = messageGroupList.map(messageGroup => {
    const keys = Object.keys(
      messageGroup.memberSet,
    ) as (keyof MessageGroupMember)[];

    return keys
      .map(key => {
        const messageIdOrList = messageGroup.memberSet[key];

        if (Array.isArray(messageIdOrList)) {
          return messageIdOrList;
        }
        if (messageIdOrList) {
          return [messageIdOrList];
        }
        return [];
      })
      .flat();
  });
  return messageIdListArray.flat();
};
