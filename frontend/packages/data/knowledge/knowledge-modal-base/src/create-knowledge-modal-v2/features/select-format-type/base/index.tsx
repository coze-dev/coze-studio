import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { withField } from '@coze-arch/bot-semi';
import { FormatType } from '@coze-arch/bot-api/memory';
import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Radio, RadioGroup, Tooltip } from '@coze/coze-design';

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
