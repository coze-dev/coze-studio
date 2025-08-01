/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type ParsingStrategy } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import {
  type BaseFormProps,
  Form,
  Tooltip,
  Typography,
} from '@coze-arch/coze-design';

import { type PDFDocumentFilterValue } from '@/features/knowledge-type/text/interface';

import { type PDFFile } from './pdf-filter/filter-modal';
import { PDFFilter } from './pdf-filter';

export interface DocumentParseFormValue
  extends Omit<ParsingStrategy, 'parsing_type'> {
  filterStrategy: PDFDocumentFilterValue[];
}
const FORM_FIELD_KEY_MAP: Record<
  keyof DocumentParseFormValue,
  keyof DocumentParseFormValue
> = {
  filterStrategy: 'filterStrategy',
  image_extraction: 'image_extraction',
  image_ocr: 'image_ocr',
  table_extraction: 'table_extraction',
};

export type DocumentParseFormProps = BaseFormProps<DocumentParseFormValue> & {
  pdfList?: PDFFile[];
};

export const DocumentParseForm: React.FC<DocumentParseFormProps> = ({
  pdfList,
  ...formProps
}) => (
  <>
    <Form<DocumentParseFormValue>
      className="flex flex-col gap-[4px] [&_.semi-form-field]:p-0"
      {...formProps}
    >
      <div className="h-[24px] leading-[24px]">
        <Typography.Text fontSize="14px" weight={500}>
          {I18n.t('kl_write_100')}
        </Typography.Text>
      </div>
      <Form.Checkbox noLabel field={FORM_FIELD_KEY_MAP.image_extraction}>
        {I18n.t('kl_write_008')}
        <Tooltip content={I18n.t('pic_not_supported')}>
          <IconCozInfoCircle className="coz-fg-secondary w-[14px] ml-[4px]" />
        </Tooltip>
      </Form.Checkbox>
      <Form.Checkbox noLabel field={FORM_FIELD_KEY_MAP.image_ocr}>
        {I18n.t('kl_write_009')}
      </Form.Checkbox>
      <Form.Checkbox noLabel field={FORM_FIELD_KEY_MAP.table_extraction}>
        {I18n.t('kl_write_010')}
      </Form.Checkbox>
      <PDFFilter
        field={FORM_FIELD_KEY_MAP.filterStrategy}
        pdfList={pdfList}
        noLabel
        fieldClassName="!mt-[8px]"
      />
    </Form>
  </>
);
