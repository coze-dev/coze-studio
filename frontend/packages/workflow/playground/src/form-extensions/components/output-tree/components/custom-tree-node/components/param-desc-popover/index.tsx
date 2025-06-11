import { type FC } from 'react';

import { IconCozPencilPaper } from '@coze/coze-design/icons';
import { Popover, IconButton, TextArea } from '@coze/coze-design';

import { type ParamNameProps } from '../param-description';

export const ParamDescPopover: FC<ParamNameProps> = props => {
  const { data, disabled, onChange } = props;

  const handleChange = (desc: string) => {
    onChange?.(desc);
  };

  if (disabled) {
    return (
      <div className="ml-1 px-0.5">
        <IconButton
          className="!block"
          disabled={disabled}
          color={data.description ? 'highlight' : 'secondary'}
          size="mini"
          icon={<IconCozPencilPaper />}
        />
      </div>
    );
  }

  return (
    <Popover
      trigger="click"
      autoAdjustOverflow
      content={
        <div className="p-4">
          <TextArea
            className="w-72"
            defaultValue={data.description}
            maxCount={1000}
            onChange={handleChange}
          />
        </div>
      }
    >
      <div className="ml-1 px-0.5 flex h-6 self-start items-center">
        <IconButton
          className="!block"
          disabled={disabled}
          color={data.description ? 'highlight' : 'secondary'}
          size="mini"
          icon={<IconCozPencilPaper />}
        />
      </div>
    </Popover>
  );
};
