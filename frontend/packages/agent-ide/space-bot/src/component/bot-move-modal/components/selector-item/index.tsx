import classnames from 'classnames';
import { IconCozCheckMarkFill } from '@coze-arch/coze-design/icons';
import { type BotSpace } from '@coze-arch/bot-api/developer_api';

interface ISelectorItemProps {
  space: BotSpace;
  disabled?: boolean;
  selected?: boolean;
  onSelect?: (space: BotSpace) => void;
}

export function SelectorItem(props: ISelectorItemProps) {
  const { space, disabled = false, selected = false, onSelect } = props;
  return (
    <div
      className={classnames(
        'flex justify-between items-center gap-x-[8px] p-[8px] w-full coz-mg-primary',
        disabled ? '' : 'hover:coz-mg-primary-hovered cursor-pointer',
      )}
      onClick={() => {
        if (!disabled) {
          onSelect?.(space);
        }
      }}
    >
      <div className="flex items-center">
        {space.icon_url ? (
          <img
            src={space.icon_url}
            className="w-[24px] h-[24px] rounded-full mr-[8px]"
          />
        ) : null}
        <p
          className={classnames(
            'text-[14px] leading-[20px] font-[400] text-left align-middle whitespace-normal -webkit-box line-clamp-1 overflow-hidden grow',
            disabled ? 'coz-fg-secondary' : 'coz-fg-primary',
          )}
        >
          {space.name}
        </p>
      </div>
      {selected ? (
        <div className="w-[24px] h-[24px] flex justify-center items-center">
          <IconCozCheckMarkFill className="coz-fg-secondary" />
        </div>
      ) : null}
    </div>
  );
}
