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

/* eslint-disable @coze-arch/max-line-per-function */
import { useEffect, useState } from 'react';

import { CozeFormTextArea, CozeInputWithCountField } from '@coze-data/utils';
import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { PictureUpload } from '@coze-common/biz-components/picture-upload';
import { I18n } from '@coze-arch/i18n';
import { FormatType } from '@coze-arch/bot-api/memory';
import { type Icon } from '@coze-arch/bot-api/knowledge';
import { FileBizType, IconType } from '@coze-arch/bot-api/developer_api';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { useFormApi } from '@coze-arch/coze-design';

import { SelectFormatType } from '../../select-format-type/base';
import { ImportKnowledgeSourceSelect } from '../../import-knowledge-source-select/base';

import styles from './index.module.less';

export interface CozeKnowledgeAddTypeContentFormData {
  name: string;
  icon_uri?: Array<{
    url: string;
    uri: string;
    uid: string;
    isDefault?: boolean;
  }>;
  format_type: FormatType;
  description: string;
}

export interface AddTypeContentProps {
  onImportKnowledgeTypeChange?: (type: UnitType) => void;
  onSelectFormatTypeChange?: (type: FormatType) => void;
}

export const CozeKnowledgeAddTypeContent = (params: AddTypeContentProps) => {
  const { onImportKnowledgeTypeChange, onSelectFormatTypeChange } = params;
  const formApi = useFormApi<CozeKnowledgeAddTypeContentFormData>();
  // Use useState to ensure re-rendering
  const [currentFormatType, setCurrentFormatType] = useState(FormatType.Text);
  const [iconInfoGenerate, setIconInfoGenerate] = useState<{
    name: string;
    desc: string;
  }>({
    name: '',
    desc: '',
  });
  const [coverIcon, setCoverIcon] = useState<Icon | undefined>({
    uri: '',
    url: '',
  });

  const fetchIcon = async (formatType: FormatType) => {
    const { icon } = await KnowledgeApi.GetIcon({
      format_type: formatType,
    });
    setCoverIcon(icon);
    const currentCover = formApi.getValue('icon_uri');
    if (!currentCover || currentCover[0]?.isDefault) {
      formApi.setValue('icon_uri', [
        {
          url: icon?.url ?? '',
          uri: icon?.uri ?? '',
          uid: icon?.uri ?? '',
          isDefault: true,
        },
      ]);
    }
  };

  const [unitType, setUnitType] = useState<UnitType>(UnitType.TEXT_DOC);

  useEffect(() => {
    fetchIcon(currentFormatType);
    if (currentFormatType === FormatType.Text) {
      setUnitType(UnitType.TEXT_DOC);
    } else if (currentFormatType === FormatType.Table) {
      setUnitType(UnitType.TABLE_DOC);
    } else if (currentFormatType === FormatType.Image) {
      setUnitType(UnitType.IMAGE_FILE);
    }
  }, [currentFormatType]);

  useEffect(() => {
    if (!unitType) {
      return;
    }
    onImportKnowledgeTypeChange?.(unitType);
  }, [unitType]);

  return (
    <div data-testid={KnowledgeE2e.CreateKnowledgeModal}>
      <SelectFormatType
        field="format_type"
        noLabel
        onChange={(type: FormatType) => {
          setCurrentFormatType(type);
          formApi.setValue('format_type', type);
          onSelectFormatTypeChange?.(type);
        }}
      />
      <CozeInputWithCountField
        data-testid={KnowledgeE2e.CreateKnowledgeModalNameInput}
        field="name"
        label={I18n.t('datasets_model_create_name')}
        maxLength={100}
        onChange={(value: string) => {
          setIconInfoGenerate(prev => ({
            ...prev,
            name: value?.trim() || '',
          }));
        }}
        rules={[
          {
            required: true,
            whitespace: true,
            message: I18n.t('dataset-name-empty-tooltip'),
          },
          {
            pattern: /^[^"'`\\]+$/,
            message: I18n.t('dataset-name-has-wrong-word-tooltip'),
          },
        ]}
        placeholder={I18n.t('datasets_model_create_name_placeholder')}
      />
      <CozeFormTextArea
        field="description"
        data-testid={KnowledgeE2e.CreateKnowledgeModalDescInput}
        // className={s['textarea-multi-line']}
        label={I18n.t('datasets_model_create_description')}
        autosize={{ minRows: 1, maxRows: 2 }}
        maxCount={2000}
        maxLength={2000}
        placeholder={I18n.t('datasets_model_create_description_placeholder')}
        onChange={(value: string) => {
          setIconInfoGenerate(prev => ({
            ...prev,
            desc: value?.trim() || '',
          }));
        }}
      />

      <div
        className="semi-form-field"
        x-label-pos="top"
        x-field-id="name"
        x-extra-pos="bottom"
      >
        <label className="semi-form-field-label semi-form-field-label-left">
          <div className="semi-form-field-label-text" x-semi-prop="label">
            {I18n.t('create-dataset-import-type')}
          </div>
        </label>

        <ImportKnowledgeSourceSelect
          formatType={currentFormatType}
          initValue={unitType}
          onChange={setUnitType}
        />
      </div>

      <PictureUpload
        label={I18n.t('datasets_model_create_avatar')}
        field="icon_uri"
        testId={KnowledgeE2e.CreateKnowledgeModalAvatarUploader}
        fileBizType={FileBizType.BIZ_DATASET_ICON}
        uploadClassName={styles['upload-avatar-container']}
        iconType={IconType.Dataset}
        generateInfo={iconInfoGenerate}
        generateTooltip={{
          generateBtnText: I18n.t(
            'dataset_create_knowledge_generate_avatar_tips',
          ),
          contentNotLegalText: I18n.t(
            'dataset_create_knowledge_generate_content_tips',
          ),
        }}
        initValue={[
          {
            url: coverIcon?.url,
            uri: coverIcon?.uri,
            isDefault: true,
          },
        ]}
      />
    </div>
  );
};
