import { type ComponentProps, type ComponentType, useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  type CommonFieldProps,
  TextArea,
  Typography,
  withField,
} from '@coze-arch/coze-design';

import { renderDocumentFilterValue } from '@/utils/render-document-filter-value';
import { type PDFDocumentFilterValue } from '@/features/knowledge-type/text/interface';

import { FilterModal, type PDFFile } from './filter-modal';

export { type PDFFile };

const PDFFilterImpl: React.FC<{
  value?: PDFDocumentFilterValue[];
  onChange?: (value: PDFDocumentFilterValue[]) => void;
  pdfList?: PDFFile[];
}> = ({ value, onChange, pdfList }) => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const canFilter = pdfList && pdfList.length > 0;
  const openFilterModal = () => {
    if (canFilter) {
      setFilterModalVisible(true);
    }
  };
  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  return (
    <>
      <label className="leading-[20px] mb-[4px] flex items-center gap-[4px]">
        <Typography.Text fontSize="14px" weight={500}>
          {I18n.t('kl_write_102')}
        </Typography.Text>
        <Typography.Text
          fontSize="12px"
          link={canFilter}
          disabled={!canFilter}
          onClick={openFilterModal}
        >
          {I18n.t('kl_write_103')}
        </Typography.Text>
      </label>
      <TextArea
        disabled
        className="!coz-mg-primary"
        autosize={{ minRows: 3, maxRows: 6 }}
        value={
          value && pdfList
            ? renderDocumentFilterValue({ filterValue: value, pdfList })
            : ''
        }
        placeholder={I18n.t('kl_write_104')}
      />
      <FilterModal
        value={value}
        onChange={onChange}
        visible={filterModalVisible}
        onOk={closeFilterModal}
        onCancel={closeFilterModal}
        pdfList={pdfList ?? []}
      />
    </>
  );
};

export const PDFFilter: ComponentType<
  ComponentProps<typeof PDFFilterImpl> & CommonFieldProps
> = withField(PDFFilterImpl);
