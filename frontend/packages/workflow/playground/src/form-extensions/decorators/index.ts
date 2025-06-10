import { type DecoratorExtension } from '@flowgram-adapter/free-layout-editor';

import { style } from './style';
import { formLayout } from './form-layout';
import { formItemFeedback } from './form-item-feedback';
import { formItem } from './form-item';
import { formCard, formCardAction } from './form-card';
import { columnsTitle } from './columns-title';

export const decorators: DecoratorExtension[] = [
  style,
  formLayout,
  formCard,
  formCardAction,
  formItem,
  formItemFeedback,
  columnsTitle,
] as DecoratorExtension[];
