import { I18n } from '@coze-arch/i18n';
import { Popover } from '@coze-arch/coze-design';

import previewCard from './preview-card.png';

export function MonetizeDescription({ isOn }: { isOn: boolean }) {
  return (
    <div className="coz-fg-primary">
      <span>
        {isOn ? I18n.t('monetization_on_des') : I18n.t('monetization_off_des')}
      </span>
      {isOn ? (
        <Popover
          content={
            <div className="p-[12px] coz-bg-max rounded-[10px]">
              <img width={320} src={previewCard} />
            </div>
          }
        >
          <span className="coz-fg-hglt cursor-pointer">
            {I18n.t('monetization_on_viewbill')}
          </span>
        </Popover>
      ) : null}
    </div>
  );
}
