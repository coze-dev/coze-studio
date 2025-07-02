import { I18n } from '@coze-arch/i18n';

const style = {
  color: 'var(--semi-color-primary-hover)',
};

const getVar = (text: string) => (
  <span style={style}>
    {'{{'}
    {text}
    {'}}'}
  </span>
);

const var1 = getVar(
  I18n.t('shortcut_modal_query_message_hover_tip_component_mode_var1'),
);
const var2 = getVar(
  I18n.t('shortcut_modal_query_message_hover_tip_component_mode_var2'),
);

export const queryTip = () => (
  <div className="p[16px] leading-[16px] text-[12px] font-normal coz-fg-secondary">
    <h2 className="m-0 mb-[12px] text-[14px] font-medium leading-[20px] coz-fg-plus">
      {I18n.t('shortcut_modal_query_message_hover_tip_title')}
    </h2>
    <ul className="pl-[12px]">
      <li>
        {I18n.t('shortcut_modal_query_message_hover_tip_send_query_mode')}
      </li>
      <li>
        {I18n.t('shortcut_modal_query_message_hover_tip_component_mode', {
          var1,
          var2,
        })}
      </li>
    </ul>
    <p>
      <span className="coz-fg-hglt-red w-[12px] inline-block">*</span>
      {I18n.t(
        'shortcut_modal_query_message_hover_tip_how_to_insert_components',
      )}
    </p>
  </div>
);

export const compTip = () =>
  I18n.t('shortcut_modal_components_hover_tip', {
    var1,
    var2,
  });
