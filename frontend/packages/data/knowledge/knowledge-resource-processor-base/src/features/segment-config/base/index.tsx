import type { ParsingStrategy } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import type { FormApi } from '@coze/coze-design';

import { type SegmentMode, type CustomSegmentRule } from '@/types';
import { CustomSegment } from '@/features/segment-strategys/segment-strategy/custom';
import { AutomaticCleaning } from '@/features/segment-strategys/segment-strategy/automatic-cleaning';
import type { PDFFile } from '@/features/segment-strategys/document-parse-strategy/precision-parsing/document-parse-form/pdf-filter/filter-modal';
import type { DocumentParseFormValue } from '@/features/segment-strategys/document-parse-strategy/precision-parsing/document-parse-form';
import type { PDFDocumentFilterValue } from '@/features/knowledge-type/text/interface';
import { defaultCustomSegmentRule } from '@/constants';
import { CardRadioGroup, CollapsePanel } from '@/components';

export interface OnChangeProps {
  segmentRule?: CustomSegmentRule;
  segmentMode?: SegmentMode;
  parsingStrategy?: ParsingStrategy;
  // indexStrategy?: IndexStrategy;
  filterStrategy?: PDFDocumentFilterValue[];
}

interface SegmentConfigProps {
  segmentMode: SegmentMode;
  segmentRule?: CustomSegmentRule;
  parsingStrategy?: ParsingStrategy;
  filterStrategy?: PDFDocumentFilterValue[];
  onChange: (params: OnChangeProps) => void;
  pdfList?: PDFFile[];
  getParseFormApi?: (formApi: FormApi<DocumentParseFormValue>) => void;
}

export const SegmentConfig = ({
  segmentMode,
  segmentRule = defaultCustomSegmentRule,
  onChange,
}: SegmentConfigProps) => (
  <>
    <CollapsePanel header={I18n.t('kl_write_011')}>
      <CardRadioGroup<SegmentMode>
        value={segmentMode}
        onChange={value => {
          onChange({ segmentMode: value, segmentRule });
        }}
      >
        <AutomaticCleaning />
        <CustomSegment
          segmentMode={segmentMode}
          segmentRule={segmentRule}
          onChange={onChange}
        />
      </CardRadioGroup>
    </CollapsePanel>
  </>
);
