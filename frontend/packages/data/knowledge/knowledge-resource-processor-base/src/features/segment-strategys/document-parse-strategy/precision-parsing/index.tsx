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

import { merge, omit } from 'lodash-es';
import classNames from 'classnames';
import { type ParsingStrategy, ParsingType } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { Radio, Divider, type FormApi } from '@coze-arch/coze-design';

import { type PDFDocumentFilterValue } from '@/features/knowledge-type/text/interface';

import { type PDFFile } from './document-parse-form/pdf-filter/filter-modal';
import {
  DocumentParseForm,
  type DocumentParseFormValue,
} from './document-parse-form';

interface PrecisionParsingProps {
  parsingStrategy?: ParsingStrategy;
  filterStrategy?: PDFDocumentFilterValue[];
  pdfList?: PDFFile[];
  getParseFormApi?: (formApi: FormApi<DocumentParseFormValue>) => void;
  onChange: (params: {
    parsingStrategy?: ParsingStrategy;
    filterStrategy?: PDFDocumentFilterValue[];
  }) => void;
}

const PrecisionParsingContent = ({
  parsingStrategy,
  filterStrategy,
  pdfList,
  getParseFormApi,
  onChange,
}: PrecisionParsingProps) => (
  <>
    {I18n.t('kl_write_007')}
    <div
      className={classNames({
        hidden: parsingStrategy?.parsing_type !== ParsingType.AccurateParsing,
      })}
    >
      <Divider margin={12} />
      <DocumentParseForm
        getFormApi={getParseFormApi}
        pdfList={pdfList}
        initValues={{
          ...omit(parsingStrategy, 'parsing_type'),
          filterStrategy: filterStrategy ?? [],
        }}
        onValueChange={({
          filterStrategy: formFilterValues,
          ...parseValues
        }) => {
          onChange({
            parsingStrategy: merge({}, parseValues),
            filterStrategy: formFilterValues,
          });
        }}
      />
    </div>
  </>
);

export const PrecisionParsing = (props: PrecisionParsingProps) => (
  <Radio
    value={ParsingType.AccurateParsing}
    extra={<PrecisionParsingContent {...props} />}
  >
    {I18n.t('kl_write_006')}
  </Radio>
);
