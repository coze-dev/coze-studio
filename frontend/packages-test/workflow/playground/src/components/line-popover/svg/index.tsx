// eslint-disable-next-line @coze-arch/no-pkg-dir-import
import { IconFactory } from '@coze-arch/bot-icons/src/factory';

import { ReactComponent as SvgLineError } from './line-error.svg';
import { ReactComponent as SvgLineErrorCaseI18n } from './line-error-case-i18n.svg';
import { ReactComponent as SvgLineErrorCaseCn } from './line-error-case-cn.svg';

export const IconLineErrorCaseI18n: ReturnType<typeof IconFactory> =
  IconFactory(<SvgLineErrorCaseI18n />);

export const IconLineErrorCaseCn: ReturnType<typeof IconFactory> = IconFactory(
  <SvgLineErrorCaseCn />,
);

export const IconLineError: ReturnType<typeof IconFactory> = IconFactory(
  <SvgLineError />,
);
