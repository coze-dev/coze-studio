import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  IconCozFixedSize,
  IconCozAutoWidth,
} from '@coze/coze-design/icons';
import { Tooltip } from '@coze/coze-design';

import { MyIconButton } from '../icon-button';
import { Mode } from '../../typings';

interface IProps {
  value: Mode;
  onChange: (value: Mode) => void;
}
export const TextType: FC<IProps> = props => {
  const { value, onChange } = props;
  return (
    <div className="flex gap-[12px]">
      <Tooltip
        mouseEnterDelay={300}
        mouseLeaveDelay={300}
        content={I18n.t('imageflow_canvas_text1')}
      >
        <MyIconButton
          inForm
          color={value === Mode.INLINE_TEXT ? 'highlight' : 'secondary'}
          onClick={() => {
            onChange(Mode.INLINE_TEXT);
          }}
          icon={<IconCozAutoWidth className="text-[16px]" />}
        />
      </Tooltip>

      <Tooltip
        mouseEnterDelay={300}
        mouseLeaveDelay={300}
        content={I18n.t('imageflow_canvas_text2')}
      >
        <MyIconButton
          inForm
          color={value === Mode.BLOCK_TEXT ? 'highlight' : 'secondary'}
          onClick={() => {
            onChange(Mode.BLOCK_TEXT);
          }}
          icon={<IconCozFixedSize className="text-[16px]" />}
        />
      </Tooltip>
    </div>
  );
};
