import { Fragment } from 'react';

import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, Typography } from '@coze-arch/coze-design';
import { type ExtInfoText } from '@coze-studio/plugin-shared';

interface InfoPopoverProps {
  data: ExtInfoText[];
}

export const InfoPopover: React.FC<InfoPopoverProps> = props => {
  const { data } = props;

  return (
    <Tooltip
      showArrow
      theme="dark"
      position="right"
      arrowPointAtCenter
      className="!max-w-[320px]"
      content={data?.map((item, index) => (
        <Fragment key={`${item.type}${index}`}>
          {/* 加粗标题 */}
          {item.type === 'title' ? (
            <Typography.Text fontSize="14px" className="dark coz-fg-primary">
              {item.text}
            </Typography.Text>
          ) : null}
          {/* 文本 */}
          {item.type === 'text' ? (
            <Typography.Paragraph
              fontSize="12px"
              className="dark coz-fg-secondary"
            >
              {item.text}
            </Typography.Paragraph>
          ) : null}
          {/* 换行 */}
          {item.type === 'br' ? <div className="h-[8px]" /> : null}
          {/* 示例，边框内展示 */}
          {item.type === 'demo' ? (
            <div className="dark mt-[4px] p-[10px] border border-solid coz-stroke-primary">
              <Typography.Paragraph
                fontSize="12px"
                className="dark coz-fg-secondary"
              >
                {item.text}
              </Typography.Paragraph>
            </div>
          ) : null}
        </Fragment>
      ))}
    >
      <IconCozInfoCircle className="coz-fg-secondary" />
    </Tooltip>
  );
};
