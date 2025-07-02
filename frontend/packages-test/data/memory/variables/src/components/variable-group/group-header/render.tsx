import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
export const VariableGroupParamHeader = ({
  hideHeaderKeys,
}: {
  hideHeaderKeys?: string[];
}) => (
  <div
    className={cls(
      'flex w-full h-[28px] py-[6px] pl-8 items-center gap-x-4 justify-start',
      'border border-solid coz-stroke-primary border-t-0 border-x-0',
    )}
  >
    <div className="flex-1 h-full flex items-center">
      <div className="coz-fg-secondary text-[12px] font-[500] leading-[16px]">
        {I18n.t('bot_edit_memory_title_filed')}
        <span className="coz-fg-hglt-red">*</span>
      </div>
    </div>
    <div className="flex-1 h-full flex items-center">
      <div className="coz-fg-secondary text-[12px] font-[500] leading-[16px]">
        {I18n.t('bot_edit_memory_title_description')}
      </div>
    </div>
    {!hideHeaderKeys?.includes('type') ? (
      <div className="flex-none w-[166px] basis-[166px] h-full flex items-center box-content">
        <div className="coz-fg-secondary text-[12px] font-[500] leading-[16px]">
          {I18n.t('variable_Table_Title_type')}
        </div>
      </div>
    ) : null}
    <div className="flex-none w-[164px] basis-[164px] h-full flex items-center box-content">
      <div className="coz-fg-secondary text-[12px] font-[500] leading-[16px]">
        {I18n.t('bot_edit_memory_title_default')}
      </div>
    </div>
    {!hideHeaderKeys?.includes('channel') ? (
      <div className="flex-none w-[164px] basis-[164px] h-full flex items-center box-content">
        <div className="coz-fg-secondary text-[12px] font-[500] leading-[16px]">
          {I18n.t('variable_Table_Title_support_channels')}
        </div>
      </div>
    ) : null}

    <div className="flex-none w-[130px] basis-[130px] h-full flex items-center box-content">
      <div className="coz-fg-secondary text-[12px] font-[500] leading-[16px]">
        {I18n.t('bot_edit_memory_title_action')}
      </div>
    </div>
  </div>
);
