import { type FC } from 'react';

import { typeSafeJsonParse } from '@coze-common/chat-area-utils';
import { IconCozLoading } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

import { isFunctionCall } from '../../../utils/is-function-call';
import { type ISimpleFunctionMessageContentProps } from './type';

export const SimpleFunctionContent: FC<
  ISimpleFunctionMessageContentProps
> = props => {
  const { message, copywriting } = props;

  const { content } = message;

  const contentObj = typeSafeJsonParse(content, () => undefined);

  if (!isFunctionCall(contentObj, message)) {
    return null;
  }

  return (
    <div
      // chat-uikit-simple-function-content
      className="coz-fg-hglt select-none flex items-center max-w-[230px] text-xxl leading-[26px]"
    >
      <IconCozLoading
        // chat-uikit-simple-function-content__prefix-icon
        className="animate-spin"
      />
      <div
        // chat-uikit-simple-function-content__prefix-text
        className="mr-[4px] ml-[8px]"
      >
        {copywriting?.using ?? 'using'}
      </div>
      <Typography.Text
        // chat-uikit-simple-function-content__plugin-name
        className="coz-fg-hglt flex-1 text-xxl font-bold leading-[26px]"
        ellipsis={{
          showTooltip: {
            opts: {
              content: contentObj.name,
              style: { wordWrap: 'inherit' },
            },
          },
        }}
      >
        {contentObj.name}
      </Typography.Text>
    </div>
  );
};

SimpleFunctionContent.displayName = 'SimpleFunctionContent';
