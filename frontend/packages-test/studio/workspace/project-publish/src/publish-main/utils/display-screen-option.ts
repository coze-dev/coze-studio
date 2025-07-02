import { UIPreviewType } from '@coze-arch/idl/product_api';
import { type UIOption } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';

export enum DisplayScreen {
  Web = 'web',
  Mobile = 'mobile',
}

export interface DisplayScreenOption {
  label: string;
  value: DisplayScreen;
  disabled?: boolean;
  tooltip?: string;
}

export function toDisplayScreenOption(uiOption: UIOption): DisplayScreenOption {
  const publicProps = {
    disabled: uiOption.available === false,
    tooltip: uiOption.unavailable_reason,
  };
  if (uiOption.ui_channel === UIPreviewType.Web.toString()) {
    return {
      value: DisplayScreen.Web,
      label: I18n.t('builder_canvas_tools_pc'),
      ...publicProps,
    };
  }
  return {
    value: DisplayScreen.Mobile,
    label: I18n.t('builder_canvas_tools_phone'),
    ...publicProps,
  };
}
