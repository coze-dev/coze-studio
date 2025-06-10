/* eslint-disable @typescript-eslint/no-explicit-any */

import classNames from 'classnames';
import { Popover } from '@coze-arch/bot-semi';
import { type IPoint } from '@flowgram-adapter/common';

import { LineErrorTip } from './line-error-tip';

const PADDING = 12;

export const LinePopover = (props: Record<string, any>) => {
  const { className, line, isHovered, ...other } = props;

  const { hasError, bezier, position } = line;

  const { bbox } = bezier;
  // 相对位置
  const toRelative = (p: IPoint) => ({
    x: p.x - bbox.x + PADDING,
    y: p.y - bbox.y + PADDING,
  });
  const fromPos = toRelative(position.from);
  const toPos = toRelative(position.to);

  const left = bbox.x + Math.abs((toPos.x - fromPos.x) / 2);
  const top = bbox.y + Math.abs((toPos.y - fromPos.y) / 2);

  return (
    <Popover
      className={classNames('p-4', className)}
      showArrow
      content={() => <LineErrorTip />}
      visible={isHovered && hasError}
      {...other}
    >
      {/* tooltip锚点，需要计算线条的中心位置 */}
      <div
        style={{
          left,
          top,
          position: 'absolute',
        }}
      ></div>
    </Popover>
  );
};
