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

import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { withField } from '@coze-arch/bot-semi';
import { FormatType } from '@coze-arch/bot-api/memory';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Radio, RadioGroup, Tooltip } from '@coze-arch/coze-design';

import type {
  SelectFormatTypeModule,
  SelectFormatTypeModuleProps,
} from '../module';
// eslint-disable-next-line @coze-arch/no-deep-relative-import
import { ReactComponent as TextKnowledgeLogo } from '../../../../assets/text-knowledge.svg';
// eslint-disable-next-line @coze-arch/no-deep-relative-import
import { ReactComponent as TableKnowledgeLogo } from '../../../../assets/table-knowledge.svg';
// eslint-disable-next-line @coze-arch/no-deep-relative-import
import { ReactComponent as ImageKnowledgeLogo } from '../../../../assets/image-knowledge.svg';

import styles from './index.module.less';

const SelectFormatTypeComponent: React.FC<
  SelectFormatTypeModuleProps
> = props => {
  const { onChange } = props;
  return (
    <RadioGroup
      defaultValue={FormatType.Text}
      onChange={v => {
        onChange?.(v.target.value);
      }}
      type="pureCard"
      direction="horizontal"
      className={styles['select-format-type']}
    >
      <Radio
        value={FormatType.Text}
        key={FormatType.Text}
        data-testid={KnowledgeE2e.CreateKnowledgeModalTextRadioGroup}
      >
        <div className="radio-logo">
          <TextKnowledgeLogo />
        </div>
        <div>{I18n.t('create-knowledge-text-type')}</div>
      </Radio>
      <Radio
        value={FormatType.Table}
        key={FormatType.Table}
        data-testid={KnowledgeE2e.CreateKnowledgeModalTableRadioGroup}
      >
        <div className="radio-logo">
          <TableKnowledgeLogo />
        </div>
        <div>{I18n.t('create-knowledge-table-type')}</div>
        <Tooltip content={I18n.t('knowledge_table_nl2sql_tooltip')}>
          <IconCozInfoCircle className={'info-icon'} />
        </Tooltip>
      </Radio>
      <Radio
        value={FormatType.Image}
        key={FormatType.Image}
        data-testid={KnowledgeE2e.CreateKnowledgeModalPhotoRadioGroup}
      >
        <div className="radio-logo">
          <ImageKnowledgeLogo />
        </div>
        <div>{I18n.t('knowledge_photo_001')}</div>
      </Radio>
    </RadioGroup>
  );
};

export const SelectFormatType: SelectFormatTypeModule = withField(
  SelectFormatTypeComponent,
);
