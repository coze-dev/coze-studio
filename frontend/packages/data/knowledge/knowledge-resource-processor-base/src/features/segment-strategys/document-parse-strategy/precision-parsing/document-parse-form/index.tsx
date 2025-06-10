import { type ParsingStrategy } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { IconCozInfoCircle } from '@coze/coze-design/icons';
import {
  type BaseFormProps,
  Form,
  Tooltip,
  Typography,
} from '@coze/coze-design';

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
